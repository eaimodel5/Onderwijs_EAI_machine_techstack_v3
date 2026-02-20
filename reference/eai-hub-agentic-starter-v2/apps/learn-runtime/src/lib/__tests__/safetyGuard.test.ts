import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkPromptSafety } from '../safetyGuard';
import type { SafetyDecision } from '../safetyGuard';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock API usage tracker
vi.mock('@/utils/apiUsageTracker', () => ({
  incrementApiUsage: vi.fn()
}));

describe('safetyGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkPromptSafety', () => {
    it('should allow safe content', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: {
          ok: true,
          decision: 'allow' as SafetyDecision,
          score: 0.95,
          severity: 'low',
          flags: [],
          details: 'Geen problemen'
        },
        error: null
      });

      const result = await checkPromptSafety('Ik voel me verdrietig vandaag');

      expect(result.ok).toBe(true);
      expect(result.decision).toBe('allow');
      expect(result.score).toBeGreaterThan(0);
      expect(result.flags).toEqual([]);
    });

    it('should flag harmful content', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: {
          ok: false,
          decision: 'block' as SafetyDecision,
          score: 0.1,
          flags: ['violence', 'self-harm'],
          reasons: ['Content contains harmful intent'],
          severity: 'high',
          details: 'Harmful intent detected'
        },
        error: null
      });

      const result = await checkPromptSafety('harmful content example');

      expect(result.ok).toBe(false);
      expect(result.decision).toBe('block');
      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.reasons).toBeDefined();
      expect(result.severity).toBe('high');
      expect(result.details).toBe('Harmful intent detected');
    });

    it('should review borderline content', async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: {
          ok: true,
          decision: 'review' as SafetyDecision,
          score: 0.6,
          flags: ['sensitive'],
          reasons: ['Content may need review'],
          severity: 'medium',
          details: 'Borderline sensitive content'
        },
        error: null
      });

      const result = await checkPromptSafety('borderline content');

      expect(result.decision).toBe('review');
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(1);
      expect(result.severity).toBe('medium');
      expect(result.details).toBe('Borderline sensitive content');
    });

    it('should handle API errors gracefully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: { message: 'API error' }
      });

      const result = await checkPromptSafety('test input');

      expect(result.ok).toBe(false);
      expect(result.decision).toBe('allow'); // Graceful degradation
      expect(result.error).toBeDefined();
    });

    it('should handle network failures', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.functions.invoke).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await checkPromptSafety('test input');

      expect(result.ok).toBe(false);
      expect(result.decision).toBe('allow'); // Fail-open for availability
      expect(result.error).toBeDefined();
    });

    it('should track API usage', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { incrementApiUsage } = await import('@/utils/apiUsageTracker');
      
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { ok: true, decision: 'allow', score: 1, flags: [], severity: 'low' },
        error: null
      });

      await checkPromptSafety('test');

      expect(incrementApiUsage).toHaveBeenCalledWith('safety');
    });
  });
});

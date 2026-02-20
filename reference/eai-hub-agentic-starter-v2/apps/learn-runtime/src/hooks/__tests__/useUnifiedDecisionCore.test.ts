import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUnifiedDecisionCore } from '../useUnifiedDecisionCore';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null }))
  }
}));

// Mock browser transformer engine
vi.mock('../useBrowserTransformerEngine', () => ({
  useBrowserTransformerEngine: () => ({
    detectEmotionInBrowser: vi.fn(() => Promise.resolve({
      ok: true,
      result: { emotion: 'blijdschap', confidence: 0.85 }
    })),
    modelLoaded: true,
    isProcessing: false
  })
}));

// Mock embedding utils
vi.mock('@/lib/embeddingUtils', () => ({
  generateEmbedding: vi.fn(() => Promise.resolve(Array(1536).fill(0.1)))
}));

describe('useUnifiedDecisionCore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchUnifiedKnowledge', () => {
    it('should search knowledge base with query', async () => {
      const { result } = renderHook(() => useUnifiedDecisionCore());

      const results = await result.current.searchUnifiedKnowledge('verdriet', undefined, 5);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle empty query gracefully', async () => {
      const { result } = renderHook(() => useUnifiedDecisionCore());

      const results = await result.current.searchUnifiedKnowledge('', undefined, 5);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('makeUnifiedDecision', () => {
    it('should generate decision with emotion detection', async () => {
      const { result } = renderHook(() => useUnifiedDecisionCore());

      const decision = await result.current.makeUnifiedDecision(
        'Ik voel me verdrietig',
        'test-api-key'
      );

      expect(decision).toBeDefined();
      expect(decision.emotion).toBeDefined();
      expect(decision.confidence).toBeGreaterThan(0);
      expect(decision.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle low confidence scenarios', async () => {
      const { result } = renderHook(() => useUnifiedDecisionCore());

      const decision = await result.current.makeUnifiedDecision(
        'xyzabc123',
        'test-api-key'
      );

      expect(decision).toBeDefined();
      // Low confidence should still return a valid decision
      expect(decision.confidence).toBeGreaterThanOrEqual(0);
    });
  });

  describe('loadKnowledgeStats', () => {
    it('should load knowledge statistics', async () => {
      const { result } = renderHook(() => useUnifiedDecisionCore());

      // Stats are loaded on mount
      await result.current.loadKnowledgeStats();

      expect(result.current.knowledgeStats).toBeDefined();
      expect(result.current.knowledgeStats.seeds).toBeGreaterThanOrEqual(0);
      expect(result.current.knowledgeStats.embeddings).toBeGreaterThanOrEqual(0);
      expect(result.current.knowledgeStats.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('consolidateKnowledge', () => {
    it('should trigger knowledge consolidation', async () => {
      const { result } = renderHook(() => useUnifiedDecisionCore());

      await expect(result.current.consolidateKnowledge()).resolves.not.toThrow();
    });
  });
});

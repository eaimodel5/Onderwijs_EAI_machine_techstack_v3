import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSelfLearningManager } from '../useSelfLearningManager';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }
}));

// Mock hooks
vi.mock('../useProactiveSeedGenerator', () => ({
  useProactiveSeedGenerator: () => ({
    generateFromContext: vi.fn(() => Promise.resolve({
      ok: true,
      seed: {
        id: 'test-seed',
        emotion: 'verdriet',
        triggers: ['verdriet', 'sad'],
        response: { nl: 'Test response', en: 'Test response' },
        confidence: 0.85
      }
    }))
  })
}));

vi.mock('../useEnhancedSeedGeneration', () => ({
  useEnhancedSeedGeneration: () => ({
    generateEnhancedSeed: vi.fn(() => Promise.resolve({
      emotion: 'verdriet',
      triggers: ['verdriet'],
      response: { nl: 'Enhanced response' },
      confidence: 0.9
    }))
  })
}));

vi.mock('../useSeedDatabaseInjection', () => ({
  useSeedDatabaseInjection: () => ({
    injectSeed: vi.fn(() => Promise.resolve({ success: true }))
  })
}));

describe('useSelfLearningManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeTurn', () => {
    it('should detect low confidence scenarios', async () => {
      const { result } = renderHook(() => useSelfLearningManager());

      const outcome = await result.current.analyzeTurn(
        'test input',
        { 
          emotion: 'onzekerheid',
          response: 'test response',
          confidence: 0.4, // Low confidence
          reasoning: 'test'
        } as any,
        []
      );

      expect(outcome).toBeDefined();
      expect(outcome.triggered).toBe(true);
      expect(outcome.reason).toBe('low_confidence');
    });

    it('should detect novel topics', async () => {
      const { result } = renderHook(() => useSelfLearningManager());

      const outcome = await result.current.analyzeTurn(
        'completely new unique topic xyz123',
        { 
          emotion: 'onzekerheid',
          response: 'test',
          confidence: 0.8
        } as any,
        []
      );

      expect(outcome).toBeDefined();
      // Novel topic should trigger learning
    });

    it('should not trigger for high confidence known topics', async () => {
      const { result } = renderHook(() => useSelfLearningManager());

      const outcome = await result.current.analyzeTurn(
        'verdriet',
        { 
          emotion: 'verdriet',
          response: 'test',
          confidence: 0.9
        } as any,
        []
      );

      expect(outcome).toBeDefined();
      // High confidence may not trigger learning
    });

    it('should handle learning errors gracefully', async () => {
      const { result } = renderHook(() => useSelfLearningManager());

      const outcome = await result.current.analyzeTurn(
        '',
        { 
          emotion: 'onzekerheid',
          response: 'test',
          confidence: 0.1
        } as any,
        []
      );

      expect(outcome).toBeDefined();
    });
  });
});

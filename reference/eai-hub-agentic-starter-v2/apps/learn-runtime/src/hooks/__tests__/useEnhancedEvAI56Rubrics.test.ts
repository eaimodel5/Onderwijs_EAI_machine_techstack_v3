import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnhancedEvAI56Rubrics } from '../useEnhancedEvAI56Rubrics';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }
}));

// Mock rubric settings
vi.mock('../useRubricSettings', () => ({
  useRubricSettings: () => ({
    rubricSettings: {
      enabled: true,
      strictnessMode: 'moderate',
      dimensions: {
        crisisRisk: true,
        emotionalDistress: true,
        socialSupport: true,
        copingMechanisms: true,
        therapeuticAlliance: true
      }
    }
  })
}));

describe('useEnhancedEvAI56Rubrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('assessMessage', () => {
    it('should assess message with rubrics', () => {
      const { result } = renderHook(() => useEnhancedEvAI56Rubrics());

      const assessments = result.current.assessMessage(
        'Ik voel me heel verdrietig',
        'balanced'
      );

      expect(assessments).toBeDefined();
      expect(Array.isArray(assessments)).toBe(true);
      expect(assessments.length).toBeGreaterThan(0);
    });

    it('should handle crisis content', () => {
      const { result } = renderHook(() => useEnhancedEvAI56Rubrics());

      const assessments = result.current.assessMessage(
        'Ik wil niet meer leven',
        'strict'
      );

      expect(assessments).toBeDefined();
      const crisisAssessment = assessments.find(a => a.riskScore > 0.7);
      expect(crisisAssessment).toBeDefined();
    });

    it('should handle positive content', () => {
      const { result } = renderHook(() => useEnhancedEvAI56Rubrics());

      const assessments = result.current.assessMessage(
        'Ik voel me geweldig vandaag!',
        'balanced'
      );

      expect(assessments).toBeDefined();
      const protectiveAssessment = assessments.find(a => a.protectiveScore > 0.5);
      expect(protectiveAssessment).toBeDefined();
    });
  });

  describe('calculateOverallRisk', () => {
    it('should calculate risk from assessments', () => {
      const { result } = renderHook(() => useEnhancedEvAI56Rubrics());

      const mockAssessments: any[] = [
        { rubricId: 'test1', riskScore: 0.8, protectiveScore: 0.2 },
        { rubricId: 'test2', riskScore: 0.6, protectiveScore: 0.4 }
      ];

      const overallRisk = result.current.calculateOverallRisk(mockAssessments);

      expect(overallRisk).toBeGreaterThanOrEqual(0);
      expect(overallRisk).toBeLessThanOrEqual(1);
    });

    it('should handle empty assessments', () => {
      const { result } = renderHook(() => useEnhancedEvAI56Rubrics());

      const overallRisk = result.current.calculateOverallRisk([]);

      expect(overallRisk).toBe(0);
    });
  });

  describe('performEnhancedAssessment', () => {
    it('should perform full enhanced assessment', async () => {
      const { result } = renderHook(() => useEnhancedEvAI56Rubrics());

      const enhancedResult = await result.current.performEnhancedAssessment(
        'Ik voel me angstig',
        'test-conversation-id',
        'balanced'
      );

      expect(enhancedResult).toBeDefined();
      expect(enhancedResult.assessments).toBeDefined();
      expect(enhancedResult.overallRisk).toBeGreaterThanOrEqual(0);
      expect(enhancedResult.processingMode).toBe('balanced');
    });

    it('should respect processing mode', async () => {
      const { result } = renderHook(() => useEnhancedEvAI56Rubrics());

      const strictResult = await result.current.performEnhancedAssessment(
        'test',
        undefined,
        'strict'
      );

      expect(strictResult.processingMode).toBe('strict');
    });
  });
});

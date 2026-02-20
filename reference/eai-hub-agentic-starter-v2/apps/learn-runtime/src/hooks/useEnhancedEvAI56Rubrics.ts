
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RubricAssessment {
  rubricId: string;
  riskScore: number;
  protectiveScore: number;
  triggers: string[];
  confidenceLevel: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface EnhancedRubricResult {
  assessments: RubricAssessment[];
  overallRisk: number;
  overallProtective: number;
  dominantPattern: string;
  processingMode: 'strict' | 'balanced' | 'flexible';
  timestamp: Date;
}

// Single user ID constant
const SINGLE_USER_ID = '00000000-0000-0000-0000-000000000001';

// Core EvAI 5.6 Rubrics with enhanced scoring
const EVAI_56_RUBRICS = {
  'emotional-validation': {
    id: 'emotional-validation',
    name: 'Emotionele Validatie',
    triggers: ['verdrietig', 'bang', 'alleen', 'onbegrepen', 'pijn', 'verloren'],
    riskFactors: ['zelfverwijt', 'isolatie', 'hulpeloosheid'],
    protectiveFactors: ['steun zoeken', 'contact maken', 'hulp accepteren'],
    baseWeight: 1.0
  },
  'anxiety-support': {
    id: 'anxiety-support',
    name: 'Angst Ondersteuning',
    triggers: ['ongerust', 'paniek', 'stress', 'zenuwachtig', 'angst'],
    riskFactors: ['vermijding', 'controle verlies', 'catastroferen'],
    protectiveFactors: ['ademtechnieken', 'grounding', 'ondersteuning'],
    baseWeight: 1.2
  },
  'mood-regulation': {
    id: 'mood-regulation',
    name: 'Stemming Regulatie',
    triggers: ['boos', 'gefrustreerd', 'geïrriteerd', 'woedend'],
    riskFactors: ['agressie', 'impulsiviteit', 'destructief gedrag'],
    protectiveFactors: ['emotie regulatie', 'pauze nemen', 'reflectie'],
    baseWeight: 1.1
  },
  'social-connection': {
    id: 'social-connection',
    name: 'Sociale Verbinding',
    triggers: ['eenzaam', 'uitgesloten', 'niet begrepen', 'geïsoleerd'],
    riskFactors: ['sociale terugtrekking', 'negatieve gedachten over anderen'],
    protectiveFactors: ['contact zoeken', 'gemeenschap', 'delen van gevoelens'],
    baseWeight: 0.9
  },
  'self-worth': {
    id: 'self-worth',
    name: 'Zelfwaarde',
    triggers: ['waardeloos', 'mislukking', 'niet goed genoeg', 'teleurstelling'],
    riskFactors: ['zelfkritiek', 'perfectionalisme', 'vergelijking'],
    protectiveFactors: ['zelfcompassie', 'groei mindset', 'kleine successen'],
    baseWeight: 1.3
  }
};

export function useEnhancedEvAI56Rubrics() {
  const [isProcessing, setIsProcessing] = useState(false);

  const assessMessage = useCallback((content: string, processingMode: 'strict' | 'balanced' | 'flexible' = 'balanced'): RubricAssessment[] => {
    const assessments: RubricAssessment[] = [];
    const contentLower = content.toLowerCase();
    
    console.log('🔍 Enhanced EvAI 5.6 Assessment Starting:', { content: content.substring(0, 100), processingMode });

    Object.values(EVAI_56_RUBRICS).forEach(rubric => {
      // Check for trigger words
      const triggeredWords = rubric.triggers.filter(trigger => 
        contentLower.includes(trigger.toLowerCase())
      );
      
      if (triggeredWords.length === 0) return;

      // Enhanced risk calculation
      const riskFactors = rubric.riskFactors.filter(factor => 
        contentLower.includes(factor.toLowerCase())
      );
      
      const protectiveFactors = rubric.protectiveFactors.filter(factor => 
        contentLower.includes(factor.toLowerCase())
      );

      // Dynamic scoring based on processing mode
      let baseRiskScore = (triggeredWords.length / rubric.triggers.length) * 100;
      let riskMultiplier = 1;

      switch (processingMode) {
        case 'strict':
          riskMultiplier = 1.3;
          break;
        case 'flexible':
          riskMultiplier = 0.7;
          break;
        default: // balanced
          riskMultiplier = 1.0;
      }

      const riskScore = Math.min(100, baseRiskScore * riskMultiplier * rubric.baseWeight);
      const protectiveScore = Math.max(0, (protectiveFactors.length * 25) - (riskFactors.length * 15));
      
      // Confidence calculation
      const triggerRatio = triggeredWords.length / rubric.triggers.length;
      let confidenceLevel: 'low' | 'medium' | 'high';
      
      if (triggerRatio >= 0.6) confidenceLevel = 'high';
      else if (triggerRatio >= 0.3) confidenceLevel = 'medium';
      else confidenceLevel = 'low';

      const assessment: RubricAssessment = {
        rubricId: rubric.id,
        riskScore,
        protectiveScore,
        triggers: triggeredWords,
        confidenceLevel,
        reasoning: `Gedetecteerd: ${triggeredWords.join(', ')}. Risk factoren: ${riskFactors.length}, Protective factoren: ${protectiveFactors.length}`
      };

      assessments.push(assessment);
      console.log(`✅ Rubric ${rubric.id} triggered:`, assessment);
    });

    return assessments;
  }, []);

  const calculateOverallRisk = useCallback((assessments: RubricAssessment[]): number => {
    if (assessments.length === 0) return 0;
    
    // Weighted average based on confidence levels
    const totalWeightedRisk = assessments.reduce((sum, assessment) => {
      const confidenceWeight = assessment.confidenceLevel === 'high' ? 1.0 : 
                              assessment.confidenceLevel === 'medium' ? 0.7 : 0.4;
      return sum + (assessment.riskScore * confidenceWeight);
    }, 0);
    
    const totalWeight = assessments.reduce((sum, assessment) => {
      const confidenceWeight = assessment.confidenceLevel === 'high' ? 1.0 : 
                              assessment.confidenceLevel === 'medium' ? 0.7 : 0.4;
      return sum + confidenceWeight;
    }, 0);
    
    return totalWeight > 0 ? totalWeightedRisk / totalWeight : 0;
  }, []);

  const logAssessment = useCallback(async (
    messageContent: string,
    assessment: RubricAssessment,
    conversationId?: string
  ): Promise<void> => {
    try {
      await supabase.from('rubrics_assessments').insert({
        user_id: SINGLE_USER_ID,
        conversation_id: conversationId || crypto.randomUUID(),
        message_content: messageContent,
        rubric_id: assessment.rubricId,
        risk_score: assessment.riskScore,
        protective_score: assessment.protectiveScore,
        overall_score: assessment.riskScore - assessment.protectiveScore,
        triggers: assessment.triggers,
        confidence_level: assessment.confidenceLevel,
        processing_mode: 'enhanced'
      });
      
      console.log('📊 Assessment logged to database:', assessment.rubricId);
    } catch (error) {
      console.error('❌ Failed to log assessment:', error);
    }
  }, []);

  const performEnhancedAssessment = useCallback(async (
    content: string,
    conversationId?: string,
    processingMode: 'strict' | 'balanced' | 'flexible' = 'balanced'
  ): Promise<EnhancedRubricResult> => {
    setIsProcessing(true);
    
    try {
      console.log('🚀 Enhanced EvAI 5.6 Assessment Started');
      
      const assessments = assessMessage(content, processingMode);
      const overallRisk = calculateOverallRisk(assessments);
      const overallProtective = assessments.reduce((sum, a) => sum + a.protectiveScore, 0) / Math.max(1, assessments.length);
      
      // Determine dominant pattern
      const dominantPattern = assessments.length > 0 
        ? assessments.reduce((prev, current) => 
            prev.riskScore > current.riskScore ? prev : current
          ).rubricId
        : 'none';

      // Log assessments to database
      for (const assessment of assessments) {
        await logAssessment(content, assessment, conversationId);
      }

      const result: EnhancedRubricResult = {
        assessments,
        overallRisk,
        overallProtective,
        dominantPattern,
        processingMode,
        timestamp: new Date()
      };

      console.log('✅ Enhanced Assessment Complete:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Enhanced assessment failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [assessMessage, calculateOverallRisk, logAssessment]);

  return {
    assessMessage,
    calculateOverallRisk,
    performEnhancedAssessment,
    logAssessment,
    isProcessing,
    rubrics: EVAI_56_RUBRICS
  };
}

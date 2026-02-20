
import { useCallback, useState } from 'react';
import { UnifiedResponse, ChatHistoryItem } from '../types';
import { SeedGenerationRequest } from '../types/openAISeedGenerator';
import { useUnifiedDecisionCore } from './useUnifiedDecisionCore';
import { useEnhancedSeedGeneration } from './useEnhancedSeedGeneration';
import { addAdvancedSeed } from '@/lib/advancedSeedStorage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SelfLearningOutcome {
  triggered: boolean;
  reason?: 'low_confidence' | 'novel_topic';
  seedId?: string;
}

export function useSelfLearningManager() {
  const [isLearning, setIsLearning] = useState(false);
  const { searchUnifiedKnowledge } = useUnifiedDecisionCore();
  const { generateEnhancedSeed } = useEnhancedSeedGeneration();

  const analyzeTurn = useCallback(async (
    userInput: string,
    result: UnifiedResponse,
    history?: ChatHistoryItem[]
  ): Promise<SelfLearningOutcome> => {
    // Proactief, impliciet leren op basis van onzekerheid/novelty/correcties
    try {
      // Vector embeddings are generated server-side via openai-embedding Edge Function
      // No client-side vector key needed
      const vectorKey = ''; // Kept for backward compatibility with searchUnifiedKnowledge

      // 1) Detectiecriteria
      const lowConfidence = (result.confidence ?? 0) < 0.6;
      let novelTopic = false;
      const correction = /^\s*(nee|niet zo|ik bedoel|bedoelde|dat klopt niet|correctie|even corrigeren)/i.test(userInput);

      try {
        const unified = await searchUnifiedKnowledge(userInput, vectorKey || undefined, 5);
        novelTopic = !unified || unified.length === 0;
      } catch (e) {
        // Als search faalt, beschouw dit niet als blocking voor de chat
        console.warn('⚠️ Self-learning: unified search failed, skipping novelty check');
      }

      if (!lowConfidence && !novelTopic && !correction) {
        return { triggered: false };
      }

      setIsLearning(true);

      // 2) Kies severiteit op basis van label
      const severityMap: Record<UnifiedResponse['label'], 'low' | 'medium' | 'high' | 'critical'> = {
        Valideren: 'low',
        Reflectievraag: 'medium',
        Suggestie: 'high',
        Interventie: 'critical',
        Fout: 'medium'
      };

      const severity = severityMap[result.label] || 'medium';

      // 3) Genereer verbeterde/nieuwe seed (diversificatie)
      const conversationHistory = (history || []).slice(-6).map(h => h.content);
      const seedRequest: SeedGenerationRequest = {
        emotion: result.emotion || 'neutral',
        context: userInput.slice(0, 240),
        severity,
        conversationHistory
      };

      const newSeed = await generateEnhancedSeed(seedRequest, '');
      if (!newSeed) {
        // Log poging zonder resultaat
        console.warn('⚠️ Self-learning: seed generation failed');
        toast.warning('Self-learning seed generation failed', {
          description: 'Could not generate new seed from this conversation'
        });
        
        try {
          await supabase.rpc('log_reflection_event', {
            p_trigger_type: correction ? 'correction' : (lowConfidence ? 'low_confidence' : 'novel_topic'),
            p_context: {
              userInput,
              emotion: result.emotion || null,
              confidence: result.confidence || null,
              label: result.label,
              historyCount: (history || []).length,
              severity
            }
          });
        } catch (e) {
          console.error('❌ Self-learning: log_reflection_event (no seed) failed:', e);
        }
        return { triggered: false };
      }

      // 4) Opslaan als AdvancedSeed in emotion_seeds (+ auto-embed in unified_knowledge)
      await addAdvancedSeed(newSeed);

      // Log succesvolle zelfleer-actie
      try {
        const learningImpact = Math.max(0.05, (result.confidence ?? 0.5) * 0.1);
        
        await supabase.rpc('log_reflection_event', {
          p_trigger_type: correction ? 'correction' : (lowConfidence ? 'low_confidence' : 'novel_topic'),
          p_context: {
            userInput,
            emotion: result.emotion || null,
            confidence: result.confidence || null,
            label: result.label,
            historyCount: (history || []).length,
            severity,
            newSeed: { id: newSeed.id, emotion: newSeed.emotion, label: newSeed.label }
          },
          p_new_seeds_generated: 1,
          p_learning_impact: learningImpact
        });
        
        // ✅ NEW: Trigger Meta-Learner (async, non-blocking)
        void (async () => {
          try {
            const { FusionWeightCalibrator } = await import('@/lib/fusionWeightCalibrator');
            const calibrator = new FusionWeightCalibrator();
            await calibrator.learnFromReflection({
              trigger_type: correction ? 'correction' : (lowConfidence ? 'low_confidence' : 'novel_topic'),
              new_seeds_generated: 1,
              learning_impact: learningImpact
            });
          } catch (e) {
            console.error('❌ Meta-Learner reflection integration failed:', e);
          }
        })();
        
        toast.success('🌱 Self-learning activated', {
          description: `New seed generated for ${newSeed.emotion}`
        });
      } catch (e) {
        console.error('❌ Self-learning: log_reflection_event failed:', e);
        toast.error('Failed to log self-learning event', {
          description: 'Seed was created but logging failed'
        });
      }

      console.log('🌱 Self-learning added seed (auto-embedded):', newSeed.id, newSeed.emotion, newSeed.label);
      return { triggered: true, reason: lowConfidence ? 'low_confidence' : 'novel_topic', seedId: newSeed.id };
    } catch (err) {
      console.error('🔴 Self-learning pipeline error:', err);
      return { triggered: false };
    } finally {
      setIsLearning(false);
    }
  }, [generateEnhancedSeed, searchUnifiedKnowledge]);

  return { analyzeTurn, isLearning };
}

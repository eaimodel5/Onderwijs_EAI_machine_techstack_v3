import { supabase } from '@/integrations/supabase/client';
import { FusionWeightCache } from './fusionWeightCache';

interface WeightProfile {
  symbolicWeight: number;
  neuralWeight: number;
  contextType: string;
  sampleCount: number;
}

/**
 * Meta-Learner: Adjusts fusion weights based on HITL feedback and self-learning events
 * Uses dampened, gradual weight shifts with candidate/production promotion model
 */
export class FusionWeightCalibrator {
  private readonly MAX_SHIFT_PER_UPDATE = 0.05; // Max 5% shift per update
  private readonly MIN_SAMPLES_FOR_COMMIT = 10; // Need 10 samples before promoting to production
  private readonly DAMPENING_FACTOR = 0.7; // Reduce shift magnitude for stability
  
  /**
   * Learn from HITL admin feedback
   * - approved: increase neural weight (neural was correct)
   * - rejected: increase symbolic weight (neural failed)
   * - override: trigger learning mode (both failed)
   */
  async learnFromHITL(
    itemId: string,
    status: 'approved' | 'rejected' | 'override',
    context: { contextType: string; confidence: number; tdScore: number }
  ): Promise<void> {
    console.log(`🧠 Meta-Learner: Learning from HITL ${status} for ${context.contextType}`);
    
    try {
      // Get current production weights
      const current = await this.getProductionWeights(context.contextType);
      
      // Calculate direction
      let direction: 'neural' | 'symbolic' | 'neutral';
      if (status === 'approved') {
        direction = 'neural'; // Neural was correct, increase neural weight
      } else if (status === 'rejected') {
        direction = 'symbolic'; // Neural failed, increase symbolic weight
      } else {
        direction = 'neutral'; // Both failed, trigger learning mode
        await this.triggerLearningMode(context);
        return;
      }
      
      // Calculate new candidate weights (dampened)
      const candidate = this.calculateDampenedShift(current, direction);
      
      // Store as candidate (not yet production!)
      await this.storeCandidateWeight(context.contextType, candidate);
      
      // Check if candidate has enough samples → promote to production
      const candidateSamples = await this.getCandidateSampleCount(context.contextType);
      if (candidateSamples >= this.MIN_SAMPLES_FOR_COMMIT) {
        await this.promoteCandidateToProduction(context.contextType);
        
        // Invalidate cache so next request gets new weights
        FusionWeightCache.getInstance().invalidate(context.contextType);
      }
    } catch (e) {
      console.error('❌ Meta-Learner HITL learning failed:', e);
    }
  }
  
  /**
   * Learn from self-learning reflection events
   * Increase neural weight if successful learning (new seeds = exploration was good)
   */
  async learnFromReflection(
    reflectionLog: { trigger_type: string; new_seeds_generated: number; learning_impact: number }
  ): Promise<void> {
    // Self-learning event → update weights based on learning impact
    // Only update if significant impact (>0.1)
    if (reflectionLog.learning_impact < 0.1) {
      console.log('🧠 Meta-Learner: Reflection impact too low, skipping learning');
      return;
    }
    
    try {
      const contextType = this.mapTriggerToContext(reflectionLog.trigger_type);
      const current = await this.getProductionWeights(contextType);
      
      // Increase neural weight if successful learning (new seeds = exploration was good)
      const direction = reflectionLog.new_seeds_generated > 0 ? 'neural' : 'symbolic';
      const candidate = this.calculateDampenedShift(current, direction, reflectionLog.learning_impact);
      
      await this.storeCandidateWeight(contextType, candidate);
      
      console.log(`🧠 Meta-Learner: Learned from reflection (${contextType}, direction: ${direction})`);
    } catch (e) {
      console.error('❌ Meta-Learner reflection learning failed:', e);
    }
  }
  
  /**
   * Calculate dampened weight shift
   */
  private calculateDampenedShift(
    current: WeightProfile,
    direction: 'neural' | 'symbolic',
    impactFactor: number = 1.0
  ): WeightProfile {
    const rawShift = this.MAX_SHIFT_PER_UPDATE * impactFactor;
    const dampenedShift = rawShift * this.DAMPENING_FACTOR;
    
    if (direction === 'neural') {
      const newNeural = Math.min(0.9, current.neuralWeight + dampenedShift);
      return {
        ...current,
        neuralWeight: newNeural,
        symbolicWeight: 1.0 - newNeural
      };
    } else {
      const newSymbolic = Math.min(0.9, current.symbolicWeight + dampenedShift);
      return {
        ...current,
        symbolicWeight: newSymbolic,
        neuralWeight: 1.0 - newSymbolic
      };
    }
  }
  
  /**
   * Get production weights for a context type
   */
  private async getProductionWeights(contextType: string): Promise<WeightProfile> {
    const { data, error } = await supabase
      .from('fusion_weight_profiles')
      .select('*')
      .eq('context_type', contextType)
      .eq('is_candidate', false)
      .single();
    
    if (error || !data) {
      console.warn(`⚠️ No production weights found for ${contextType}, using defaults`);
      return { 
        symbolicWeight: 0.7, 
        neuralWeight: 0.3, 
        contextType, 
        sampleCount: 0 
      };
    }
    
    return {
      symbolicWeight: data.symbolic_weight,
      neuralWeight: data.neural_weight,
      contextType: data.context_type,
      sampleCount: data.sample_count || 0
    };
  }
  
  /**
   * Store candidate weight (not yet production)
   */
  private async storeCandidateWeight(contextType: string, weights: WeightProfile): Promise<void> {
    const { error } = await supabase.from('fusion_weight_profiles').upsert({
      context_type: contextType,
      symbolic_weight: weights.symbolicWeight,
      neural_weight: weights.neuralWeight,
      is_candidate: true,
      sample_count: (weights.sampleCount || 0) + 1,
      last_updated: new Date().toISOString(),
      metadata: { last_update: new Date().toISOString() }
    }, { onConflict: 'user_id,context_type,is_candidate' });
    
    if (error) {
      console.error('❌ Failed to store candidate weight:', error);
    } else {
      console.log(`✅ Stored candidate weight for ${contextType}`);
    }
  }
  
  /**
   * Get candidate sample count
   */
  private async getCandidateSampleCount(contextType: string): Promise<number> {
    const { data, error } = await supabase
      .from('fusion_weight_profiles')
      .select('sample_count')
      .eq('context_type', contextType)
      .eq('is_candidate', true)
      .single();
    
    if (error || !data) return 0;
    return data.sample_count || 0;
  }
  
  /**
   * Promote candidate weights to production
   */
  private async promoteCandidateToProduction(contextType: string): Promise<void> {
    // Get candidate
    const { data: candidate, error: fetchError } = await supabase
      .from('fusion_weight_profiles')
      .select('*')
      .eq('context_type', contextType)
      .eq('is_candidate', true)
      .single();
    
    if (fetchError || !candidate) {
      console.error('❌ Failed to fetch candidate for promotion:', fetchError);
      return;
    }
    
    // Promote to production
    const { error: upsertError } = await supabase.from('fusion_weight_profiles').upsert({
      context_type: contextType,
      symbolic_weight: candidate.symbolic_weight,
      neural_weight: candidate.neural_weight,
      is_candidate: false,
      sample_count: candidate.sample_count,
      success_rate: 0.0,
      last_updated: new Date().toISOString(),
      metadata: { 
        promoted_at: new Date().toISOString(),
        previous_sample_count: candidate.sample_count
      }
    }, { onConflict: 'user_id,context_type,is_candidate' });
    
    if (upsertError) {
      console.error('❌ Failed to promote candidate to production:', upsertError);
    } else {
      console.log(`✅ Promoted candidate weights for ${contextType} to production`);
    }
  }
  
  /**
   * Trigger learning mode when both symbolic and neural failed
   */
  private async triggerLearningMode(context: { contextType: string; confidence: number; tdScore: number }): Promise<void> {
    console.log('🚨 Learning mode triggered - both symbolic and neural failed for', context.contextType);
    
    // Log this critical learning opportunity
    try {
      await supabase.rpc('log_reflection_event', {
        p_trigger_type: 'hitl_override_learning',
        p_context: {
          contextType: context.contextType,
          confidence: context.confidence,
          tdScore: context.tdScore,
          reason: 'Both symbolic and neural pathways failed, manual override required'
        },
        p_new_seeds_generated: 0,
        p_learning_impact: 0.5 // High impact - this is a critical learning signal
      });
    } catch (e) {
      console.error('❌ Failed to log learning mode trigger:', e);
    }
  }
  
  /**
   * Map trigger type to context type
   */
  private mapTriggerToContext(triggerType: string): string {
    const mapping: Record<string, string> = {
      'low_confidence': 'low_confidence',
      'novel_topic': 'normal',
      'correction': 'normal',
      'crisis': 'crisis',
      'hitl_override_learning': 'normal'
    };
    
    return mapping[triggerType] || 'normal';
  }
}

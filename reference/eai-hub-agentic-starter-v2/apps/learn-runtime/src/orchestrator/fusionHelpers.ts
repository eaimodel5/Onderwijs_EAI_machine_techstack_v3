/**
 * NeSy Fusion Helper Functions
 * Voor echte neurosymbolic fusion in plaats van "beste antwoord" selectie
 */
import type { EAAProfile } from '@/types/eaa';
import { FusionWeightCache } from '@/lib/fusionWeightCache';

export interface FusionContext {
  symbolic: {
    response: string;
    emotion: string;
    confidence: number;
    sources: any[];
  };
  neural: {
    response: string;
    confidence: number;
    processingPath: string;
  };
  validation: {
    validated: boolean;
    constraintsOK: boolean;
    tdScore?: number;
  };
  // v20 metadata for context-aware weight selection
  eaaProfile?: EAAProfile;
}

interface FusionResult {
  fusedResponse: string;
  fusedConfidence: number;
  symbolicWeight: number;
  neuralWeight: number;
  preservationScore: number;
  strategy: 'neural_enhanced' | 'weighted_blend' | 'symbolic_fallback';
}

/**
 * Extract therapeutische intentie uit seed tekst
 */
export function extractTherapeuticIntent(seedText: string): {
  validation: boolean;
  reflection: boolean;
  suggestion: boolean;
  empathy: boolean;
} {
  const lowerSeed = seedText.toLowerCase();
  
  return {
    validation: /begrijp|herken|voelt|is logisch|normaal/.test(lowerSeed),
    reflection: /vraag|denk|overweeg|zou kunnen|misschien/.test(lowerSeed),
    suggestion: /probeer|kun je|zou je kunnen|stel voor/.test(lowerSeed),
    empathy: /voel|moeilijk|snap|hier voor je/.test(lowerSeed)
  };
}

/**
 * Valideer of seed preservatie succesvol was
 */
export function validateSeedPreservation(
  llmResponse: string,
  seedCore: any,
  originalSeed: string
): { preserved: boolean; similarity: number; deviation: string[] } {
  const similarity = calculateSimilarity(originalSeed, llmResponse);
  const therapeuticIntent = extractTherapeuticIntent(originalSeed);
  const llmIntent = extractTherapeuticIntent(llmResponse);
  
  const deviations: string[] = [];
  
  // Check of therapeutische markers behouden blijven
  if (therapeuticIntent.validation && !llmIntent.validation) {
    deviations.push('Validatie intentie verloren');
  }
  if (therapeuticIntent.reflection && !llmIntent.reflection) {
    deviations.push('Reflectie intentie verloren');
  }
  if (therapeuticIntent.empathy && !llmIntent.empathy) {
    deviations.push('Empathie intentie verloren');
  }
  
  const preserved = similarity > 0.4 && deviations.length === 0;
  
  return { preserved, similarity, deviation: deviations };
}

/**
 * Blend seed met LLM response (weighted)
 */
export function blendSeedWithLLM(
  seed: string,
  llm: string,
  fusionCheck: { preserved: boolean; similarity: number; deviation: string[] }
): string {
  // Als similarity hoog is, gebruik LLM (seed is goed behouden)
  if (fusionCheck.similarity > 0.7) {
    return llm;
  }
  
  // Als similarity middel, blend 70/30
  if (fusionCheck.similarity > 0.4) {
    const seedSentences = seed.split(/[.!?]+/).filter(Boolean);
    const llmSentences = llm.split(/[.!?]+/).filter(Boolean);
    
    // Behoud eerste 70% van seed zinnen
    const coreCount = Math.ceil(seedSentences.length * 0.7);
    const coreSentences = seedSentences.slice(0, coreCount);
    
    // Voeg unieke LLM zinnen toe (max 30%)
    const uniqueLLMSentences = llmSentences.filter(llmSent =>
      !seedSentences.some(seedSent => calculateSimilarity(seedSent, llmSent) > 0.6)
    );
    
    const contextSentences = uniqueLLMSentences.slice(0, Math.ceil(seedSentences.length * 0.3));
    
    return [...coreSentences, ...contextSentences].join('. ').trim() + '.';
  }
  
  // Anders: gebruik pure seed (preservation te laag)
  console.warn('⚠️ Poor seed preservation, using symbolic core');
  return seed;
}

/**
 * Bereken word overlap similarity tussen twee strings
 */
function calculateSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);
  
  return intersection.size / union.size;
}

/**
 * Bereken preservation score tussen original seed en neural response
 */
function calculatePreservation(symbolic: string, neural: string): number {
  const symbolicSentences = symbolic.split(/[.!?]+/).filter(Boolean);
  const neuralSentences = neural.split(/[.!?]+/).filter(Boolean);
  
  if (symbolicSentences.length === 0) return 0;
  
  let preservedCount = 0;
  symbolicSentences.forEach(sSent => {
    const preserved = neuralSentences.some(nSent => 
      calculateSimilarity(sSent.trim(), nSent.trim()) > 0.6
    );
    if (preserved) preservedCount++;
  });
  
  return preservedCount / symbolicSentences.length;
}

/**
 * Hoofdfunctie: Assembleer fusion van symbolic en neural responses
 */
export async function assembleFusion(ctx: FusionContext): Promise<FusionResult> {
  console.log('🧬 NeSy Fusion Assembly starting...');
  
  // ============ FLOW LOGGING: FUSION_ASSEMBLY ============
  const { getOrCreateSessionId } = await import('@/lib/sessionManager');
  const { logFlowEvent } = await import('@/lib/flowEventLogger');
  const sessionId = getOrCreateSessionId();
  
  await logFlowEvent(sessionId, 'FUSION_ASSEMBLY', 'processing');
  const fusionStartTime = Date.now();
  
  try {
    // ✅ NEW: Get learned weights from cache (non-blocking!)
    const { FusionWeightCache } = await import('@/lib/fusionWeightCache');
    const cache = FusionWeightCache.getInstance();
    const contextType = determineContextType(ctx);
    const learnedWeights = await cache.getWeights(contextType);
  
  console.log(`📊 Using learned weights for ${contextType}:`, learnedWeights);
  
  // Start with learned weights (not defaults!)
  let symbolicWeight = learnedWeights.symbolicWeight;
  let neuralWeight = learnedWeights.neuralWeight;
  
  // Apply validation-based adjustments (override learned weights bij crisis!)
  if (!ctx.validation.validated || !ctx.validation.constraintsOK) {
    console.log('⚠️ Neural validation failed, boosting symbolic to 90% (safety override)');
    symbolicWeight = 0.9;
    neuralWeight = 0.1;
  } else if (ctx.symbolic.confidence < 0.6) {
    // Only adjust if no crisis (learned weights blijven basis)
    console.log('⚠️ Low symbolic confidence, adjusting weights slightly');
    symbolicWeight = Math.max(0.5, symbolicWeight - 0.1);
    neuralWeight = 1.0 - symbolicWeight;
  }
  
  // ============ FLOW LOGGING: SEED_PRESERVATION_CHECK ============
  await logFlowEvent(sessionId, 'SEED_PRESERVATION_CHECK', 'processing');
  const preservationStartTime = Date.now();
  
  // Preservation check: hoe goed heeft LLM de seed behouden?
  const preservation = calculatePreservation(
    ctx.symbolic.response,
    ctx.neural.response
  );
  
  await logFlowEvent(sessionId, 'SEED_PRESERVATION_CHECK', 'completed', Date.now() - preservationStartTime, {
    preservationScore: preservation,
    passedThreshold: preservation > 0.4
  });
  
  console.log(`🔍 Seed preservation score: ${(preservation * 100).toFixed(0)}%`);
  
  let fusedResponse: string;
  let strategy: FusionResult['strategy'];
  
  // ✅ FRIEND-CHECK: Reject therapeutic phrases
  const therapeuticBlacklist = [
    'het is begrijpelijk',
    'veel mensen ervaren',
    'ik hoor dat je',
    'dat moet moeilijk zijn',
    'neem gerust de tijd',
    'het is oké om',
    'ik begrijp dat',
    'therapeutisch',
    'validatie'
  ];
  
  const neuralLower = ctx.neural.response.toLowerCase();
  const hasForbiddenPhrase = therapeuticBlacklist.some(phrase => neuralLower.includes(phrase));
  const isTooLong = ctx.neural.response.length > 120;
  
  if (hasForbiddenPhrase) {
    console.warn('🚨 FRIEND-CHECK: Therapeutic phrase detected, using symbolic');
    fusedResponse = ctx.symbolic.response;
    strategy = 'symbolic_fallback';
  } else if (isTooLong && preservation > 0.5) {
    console.warn('🚨 LENGTH-CHECK: Response too long (>120 chars), using symbolic');
    fusedResponse = ctx.symbolic.response;
    strategy = 'symbolic_fallback';
  } else if (preservation > 0.7) {
    // Excellent preservation: LLM heeft seed goed behouden, gebruik neural
    console.log('✅ Excellent preservation (>70%), using neural-enhanced response');
    fusedResponse = ctx.neural.response;
    strategy = 'neural_enhanced';
  } else if (preservation > 0.4) {
    // Partial preservation: blend both
    console.log('⚖️ Partial preservation (40-70%), using weighted blend');
    fusedResponse = weightedBlend(
      ctx.symbolic.response,
      ctx.neural.response,
      symbolicWeight
    );
    strategy = 'weighted_blend';
  } else {
    // Poor preservation: gebruik symbolic
    console.warn('🚨 Poor preservation (<40%), falling back to symbolic core');
    fusedResponse = ctx.symbolic.response;
    strategy = 'symbolic_fallback';
  }
  
  const fusedConfidence = 
    (ctx.symbolic.confidence * symbolicWeight) + 
    (ctx.neural.confidence * neuralWeight);
  
    console.log(`🧬 Fusion complete: ${strategy} (${Math.round(symbolicWeight * 100)}%/${Math.round(neuralWeight * 100)}%)`);
    
    await logFlowEvent(sessionId, 'FUSION_ASSEMBLY', 'completed', Date.now() - fusionStartTime, {
      strategy,
      symbolicWeight,
      neuralWeight,
      preservationScore: preservation,
      contextType
    });
    
    return {
      fusedResponse,
      fusedConfidence,
      symbolicWeight,
      neuralWeight,
      preservationScore: preservation,
      strategy
    };
  } catch (error) {
    // ✅ FIX 1: Error handling for Fusion Assembly
    console.error('❌ Fusion Assembly failed:', error);
    
    await logFlowEvent(sessionId, 'FUSION_ASSEMBLY', 'failed', Date.now() - fusionStartTime, {
      error: error instanceof Error ? error.message : String(error),
      fallbackStrategy: 'symbolic_fallback'
    });
    
    // Fallback to symbolic core (safest option)
    return {
      fusedResponse: ctx.symbolic.response,
      fusedConfidence: ctx.symbolic.confidence,
      symbolicWeight: 1.0,
      neuralWeight: 0.0,
      preservationScore: 0.0,
      strategy: 'symbolic_fallback'
    };
  }
}

/**
 * Weighted blend van twee responses
 */
function weightedBlend(symbolic: string, neural: string, weight: number): string {
  // Extract seed core sentences
  const seedSentences = symbolic.split(/[.!?]+/).filter(Boolean);
  const neuralSentences = neural.split(/[.!?]+/).filter(Boolean);
  
  // Keep first 70% of seed
  const coreCount = Math.ceil(seedSentences.length * weight);
  const coreSentences = seedSentences.slice(0, coreCount);
  
  // Add neural context (last 30%)
  const contextSentences = neuralSentences.filter(nSent =>
    !seedSentences.some(sSent => calculateSimilarity(sSent, nSent) > 0.7)
  );
  
  const blended = [...coreSentences, ...contextSentences.slice(0, 2)].join('. ').trim();
  return blended.endsWith('.') ? blended : blended + '.';
}

/**
 * Determine context type for fusion weight learning
 * v20: Enhanced with EAA profile for context-aware weight selection
 */
function determineContextType(ctx: FusionContext): string {
  const eaa = ctx.eaaProfile;
  const td = ctx.validation.tdScore || 0.5;
  
  // CRITICAL: Crisis override for low agency (safety first!)
  if (eaa && eaa.agency < 0.3) {
    console.log('🚨 Crisis context detected: low agency');
    return 'crisis';
  }
  
  // Validation failure → symbolic fallback (trust rules over neural)
  if (!ctx.validation.validated || !ctx.validation.constraintsOK) {
    console.log('⚠️ Validation failed: using crisis context');
    return 'crisis';
  }
  
  // High TD + Low neural confidence → rely more on symbolic (therapeutic guidance)
  if (td > 0.7 && ctx.neural.confidence < 0.6) {
    console.log('📊 High TD + Low confidence: using low_confidence context');
    return 'low_confidence';
  }
  
  // High confidence + validated → allow more neural enhancement (contextual adaptation)
  if (ctx.neural.confidence >= 0.8 && ctx.symbolic.confidence >= 0.7) {
    console.log('✅ High confidence: using high_confidence context');
    return 'high_confidence';
  }
  
  // Greeting detection (high symbolic confidence + neutral emotion)
  if (ctx.symbolic.emotion === 'neutraal' && ctx.symbolic.confidence > 0.9) {
    console.log('👋 Greeting detected');
    return 'greeting';
  }
  
  console.log('➡️ Normal context');
  return 'normal';
}

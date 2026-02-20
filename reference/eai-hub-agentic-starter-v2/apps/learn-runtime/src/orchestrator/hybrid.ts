/**
 * EvAI v16 - Neurosymbolic Hybrid Orchestrator
 * Integreert Policy Engine, Semantic Graph en Validation Layer
 * voor volledig auditable en reproduceerbare beslissingen
 */

import { decideNextStep, Context as PolicyContext, explainDecision } from '../policy/decision.policy';
import { validatePlan, validateResponse, validateEAACompliance } from '../policy/validation.policy';
import { suggestInterventions, getAllowedInterventions, checkContraIndications } from '../semantics/graph';
import { supabase } from '@/integrations/supabase/client';
import { extractContextParams } from '../utils/contextExtractor';

// v20 EAA Framework Imports
import { evaluateEAA, validateEAAForStrategy } from '../lib/eaaEvaluator';
import { reflectOnHistory, storeReflectiveMemory } from '../lib/regisseurReflectie';
import { evaluateTD, estimateAIContribution } from '../lib/tdMatrix';
import { evaluateEAIRules, executeEAIAction, createEAIContext } from '../policy/eai.rules';
import type { EAAProfile, TDScore, EAIRuleResult } from '@/types/eaa';

export interface OrchestrationContext {
  userInput: string;
  rubric: {
    crisis: number;
    distress: number;
    support: number;
    coping: number;
    overallRisk: number;
    overallProtective: number;
    dominantPattern: string;
  };
  seed: {
    matchScore: number;
    templateId?: string;
    emotion?: string;
    response?: string;
  };
  consent: boolean;
  conversationHistory: any[];
  topEmotion?: string;
  rubricAssessments?: Array<{
    rubricId: string;
    riskScore: number;
    protectiveScore: number;
    triggers?: string[];
    confidenceLevel?: string;
    reasoning?: string;
  }>;
  // v20 metadata
  eaaProfile?: EAAProfile;
  tdMatrix?: { value: number; flag: string; aiContribution: number; shouldBlock?: boolean; reason?: string };
  regisseurBriefing?: { advice: string; reason: string; avgAgency: number };
  eaiRules?: { triggered: boolean; ruleId?: string; reason?: string; action?: any };
  rubricsAnalysis?: { overallRisk: number; overallProtective: number; dominantPattern: string; assessments?: any[] };
  fusionMetadata?: { strategy: string; symbolicWeight: number; neuralWeight: number; preservationScore: number };
  safetyCheck?: { decision: string; score: number; flags: string[] };
}

export interface OrchestrationResult {
  answer: string;
  emotion: string;
  confidence: number;
  label: 'Valideren' | 'Reflectievraag' | 'Suggestie' | 'Interventie' | 'Fout';
  reasoning: string;
  metadata: {
    policyDecision: string;
    ruleId: string;
    semanticInterventions: string[];
    validated: boolean;
    constraintsOK: boolean;
    processingPath: 'seed' | 'template' | 'llm' | 'crisis' | 'fast';
    auditLog: string[];
  };
}

/**
 * 🎯 Main Orchestration Function
 * Coordineert hele neurosymbolische pipeline
 */
export async function orchestrate(
  ctx: OrchestrationContext
): Promise<OrchestrationResult> {
  const startTime = Date.now();
  const auditLog: string[] = [];
  
  // ============ v20 FLOW LOGGING SETUP (must be first) ============
  const sessionId = sessionStorage.getItem('evai-current-session-id') || 'unknown';
  const { logFlowEvent } = await import('@/lib/flowEventLogger');
  
  auditLog.push(`🚀 EvAI v20 Orchestration started at ${new Date().toISOString()}`);
  auditLog.push(`📝 Input: "${ctx.userInput.substring(0, 50)}..."`);
  
  // ============ LAYER 8: EAA EVALUATION (v20) ============
  let eaaProfile: EAAProfile = ctx.eaaProfile || { ownership: 0.5, autonomy: 0.5, agency: 0.5 };
  if (!ctx.eaaProfile) {
    try {
      const rubricContext = ctx.rubricAssessments && ctx.rubricAssessments.length > 0 ? {
        riskScore: ctx.rubricAssessments[0].riskScore,
        protectiveScore: ctx.rubricAssessments[0].protectiveScore,
        dominantPattern: ctx.rubricAssessments[0].rubricId
      } : undefined;
      
      eaaProfile = evaluateEAA(ctx.userInput, rubricContext);
      auditLog.push(`🧠 EAA Profile: O=${eaaProfile.ownership.toFixed(2)} A=${eaaProfile.autonomy.toFixed(2)} Ag=${eaaProfile.agency.toFixed(2)}`);
    } catch (err) {
      console.error('⚠️ EAA Evaluation failed:', err);
      auditLog.push('⚠️ EAA Evaluation failed, using defaults');
    }
  } else {
    auditLog.push(`🧠 EAA Profile (from parent): O=${eaaProfile.ownership.toFixed(2)} A=${eaaProfile.autonomy.toFixed(2)} Ag=${eaaProfile.agency.toFixed(2)}`);
  }
  
  // ============ REGISSEUR REFLECTIE (v20) ============
  let regisseurAdvice = ctx.regisseurBriefing || { advice: 'geen precedent', reason: 'init', avgAgency: 0.5 };
  if (!ctx.regisseurBriefing) {
    try {
      regisseurAdvice = await reflectOnHistory(ctx.userInput, supabase, {
        similarityThreshold: 0.3,
        maxResults: 5
      });
      auditLog.push(`💭 Regisseur: ${regisseurAdvice.advice} (avg_agency=${regisseurAdvice.avgAgency.toFixed(2)})`);
    } catch (err) {
      console.error('⚠️ Regisseur Reflection failed:', err);
      auditLog.push('⚠️ Regisseur Reflection failed');
    }
  } else {
    auditLog.push(`💭 Regisseur (from parent): ${regisseurAdvice.advice}`);
  }
  
  try {
    // STAP 1: Analyze input complexity
    const inputComplexity = analyzeInputComplexity(ctx.userInput);
    auditLog.push(`📊 Input complexity: ${JSON.stringify(inputComplexity)}`);

    // ============ LAYER 8: POLICY DECISION ============
    await logFlowEvent(sessionId, 'Policy Decision', 'processing');
    const policyStartTime = Date.now();
    
    const policyCtx: PolicyContext = {
      rubric: {
        crisis: ctx.rubric.crisis,
        distress: ctx.rubric.distress,
        support: ctx.rubric.support,
        coping: ctx.rubric.coping
      },
      seed: ctx.seed,
      consent: ctx.consent,
      inputComplexity
    };

    const policyDecision = await decideNextStep(policyCtx);
    const explanation = explainDecision(policyDecision, policyCtx);
    auditLog.push(...explanation);
    
    await logFlowEvent(sessionId, 'Policy Decision', 'completed', Date.now() - policyStartTime, {
      action: policyDecision.action,
      ruleId: policyDecision.ruleId,
      confidence: policyDecision.confidence
    });

    // ============ LAYER 9: SEMANTIC GRAPH ============
    await logFlowEvent(sessionId, 'Semantic Graph', 'processing');
    const semanticStartTime = Date.now();
    const emotionForInterventions = ctx.topEmotion || ctx.seed.emotion || 'neutraal';
    const allowedInterventions = getAllowedInterventions(emotionForInterventions, {
      crisis: ctx.rubric.crisis,
      coping: ctx.rubric.coping,
      distress: ctx.rubric.distress
    });
    
    const suggestedInterventions = suggestInterventions(emotionForInterventions);
    auditLog.push(`💡 Semantic Layer:`);
    auditLog.push(`  • Emotion: ${emotionForInterventions}`);
    auditLog.push(`  • Suggested interventions: ${suggestedInterventions.map(i => i.intervention).join(', ')}`);
    auditLog.push(`  • Allowed interventions: ${allowedInterventions.join(', ')}`);
    
    await logFlowEvent(sessionId, 'Semantic Graph', 'completed', Date.now() - semanticStartTime, {
      emotion: emotionForInterventions,
      suggestedCount: suggestedInterventions.length,
      allowedCount: allowedInterventions.length
    });

    // STAP 4: Execute decision
    let answer = '';
    let emotion = emotionForInterventions;
    let confidence = policyDecision.confidence;
    let label: 'Valideren' | 'Reflectievraag' | 'Suggestie' | 'Interventie' | 'Fout' = 'Valideren';
    let reasoning = policyDecision.reasoning;
    let processingPath: 'seed' | 'template' | 'llm' | 'crisis' | 'fast' = 'seed';
    let plan: any = null;
    let validated = true;
    let constraintsOK = true;

    switch (policyDecision.action) {
      case 'USE_SEED':
        auditLog.push(`🎯 Executing: USE_SEED`);
        const seedResult = await compileSeedResponse(ctx, auditLog, eaaProfile);
        answer = seedResult.answer;
        processingPath = 'seed';
        label = 'Valideren';
        
        // Store fusion metadata if available
        if (seedResult.fusionMetadata) {
          auditLog.push(`🧬 Fusion applied: ${seedResult.fusionMetadata.strategy} (${Math.round(seedResult.fusionMetadata.preservationScore * 100)}% preservation)`);
        }
        break;

      case 'FAST_PATH':
        auditLog.push(`⚡ Executing: FAST_PATH`);
        answer = generateFastPathResponse(ctx.userInput);
        processingPath = 'fast';
        label = 'Valideren';
        break;

      case 'TEMPLATE_ONLY':
        auditLog.push(`📋 Executing: TEMPLATE_ONLY`);
        answer = generateTemplateResponse(emotion, allowedInterventions);
        processingPath = 'template';
        label = 'Valideren';
        break;

      case 'ESCALATE_INTERVENTION':
        auditLog.push(`🚨 Executing: ESCALATE_INTERVENTION`);
        plan = {
          goal: 'safety',
          strategy: 'refer',
          steps: ['veiligheid garanderen', 'contact opnemen met volwassene'],
          interventions: ['verwijzing', 'veiligheid']
        };
        answer = generateCrisisResponse(ctx);
        processingPath = 'crisis';
        label = 'Interventie';
        confidence = 0.95;
        break;

      case 'LLM_PLANNING':
        auditLog.push(`🧠 Executing: LLM_PLANNING`);
        // v20: LLM generation with v20 validation
        try {
          // Call edge function for LLM generation with full v20 context
          const { data: llmData, error: llmError } = await supabase.functions.invoke('evai-core', {
            body: {
              operation: 'generate-response',
              userInput: ctx.userInput,
              emotion,
              allowedInterventions,
              eaaProfile: ctx.eaaProfile || eaaProfile,
              conversationHistory: ctx.conversationHistory?.slice(-6) || [],
              // v20 metadata
              tdMatrix: ctx.tdMatrix,
              regisseurBriefing: ctx.regisseurBriefing,
              eaiRules: ctx.eaiRules,
              rubricsAssessment: ctx.rubricsAnalysis,
              fusionMetadata: ctx.fusionMetadata,
              safetyCheck: ctx.safetyCheck
            }
          });
          
          if (llmError || !llmData?.response) {
            console.warn('⚠️ LLM generation failed, using template fallback');
            answer = generateTemplateResponse(emotion, allowedInterventions);
          } else {
            answer = llmData.response;
            auditLog.push(`✅ LLM generated response (${llmData.model || 'unknown'})`);
          }
        } catch (err) {
          console.error('❌ LLM_PLANNING error:', err);
          answer = generateTemplateResponse(emotion, allowedInterventions);
        }
        processingPath = 'llm';
        label = 'Reflectievraag';
        break;
    }

    // STAP 5: Validate plan (traditional validation + Z3 constraints)
    if (plan) {
      const planValidation = validatePlan(plan, policyCtx);
      validated = planValidation.ok;
      auditLog.push(`🛡️ Plan validation: ${validated ? 'PASSED' : 'FAILED'}`);
      if (!validated) {
        auditLog.push(`  Errors: ${planValidation.errors.join(', ')}`);
      }
      if (planValidation.warnings.length > 0) {
        auditLog.push(`  Warnings: ${planValidation.warnings.join(', ')}`);
      }

      // 🔒 Constraint validation - Z3 layer removed (deprecated)
      // Constraints are now validated via policy and validation layers
      constraintsOK = validated;
      auditLog.push(`🔒 Constraints: ${constraintsOK ? 'SATISFIED' : 'VIOLATED'}`);
    }

    // ============ LAYER 14: VALIDATION ============
    await logFlowEvent(sessionId, 'Validation', 'processing');
    const validationStartTime = Date.now();
    
    const responseValidation = validateResponse(answer, plan || {}, policyCtx);
    constraintsOK = responseValidation.ok;
    auditLog.push(`🛡️ Response validation: ${constraintsOK ? 'PASSED' : 'FAILED'}`);
    
    await logFlowEvent(sessionId, 'Validation', 'completed', Date.now() - validationStartTime, {
      passed: constraintsOK,
      errorsCount: responseValidation.errors.length,
      warningsCount: responseValidation.warnings.length
    });
    
    if (!constraintsOK) {
      auditLog.push(`  Errors: ${responseValidation.errors.join(', ')}`);
      // BLOCK response if validation failed
      answer = generateEAAAwareFallback(eaaProfile, emotion);
      label = 'Fout';
      confidence = 0.3;
    }

    // STAP 6: Log decision for audit trail
    // ============ TD-MATRIX EVALUATION (v20) ============
    let tdScore: TDScore = { value: 0.5, flag: '🟢 TD_balanced', shouldBlock: false };
    try {
      const aiContribution = estimateAIContribution(answer);
      tdScore = evaluateTD(aiContribution, eaaProfile.agency);
      auditLog.push(`⚖️ TD-Matrix: ${tdScore.flag} (TD=${tdScore.value.toFixed(2)})`);
      
      if (tdScore.shouldBlock) {
        auditLog.push(`🚨 TD-Matrix BLOCKS output: ${tdScore.reason}`);
        answer = generateEAAAwareFallback(eaaProfile, emotion);
        emotion = 'onzekerheid';
        label = 'Fout';
        reasoning = `TD-Matrix blocked: ${tdScore.reason}`;
      }
    } catch (err) {
      console.error('⚠️ TD-Matrix evaluation failed:', err);
      auditLog.push('⚠️ TD-Matrix evaluation failed');
    }
    
    // ============ E_AI RULES ENGINE (v20) ============
    let eaiResult: EAIRuleResult = { triggered: false };
    try {
      const eaiContext = createEAIContext(
        eaaProfile,
        tdScore.value,
        {
          riskScore: ctx.rubricAssessments?.[0]?.riskScore,
          protectiveScore: ctx.rubricAssessments?.[0]?.protectiveScore
        }
      );
      
      eaiResult = evaluateEAIRules(eaiContext);
      
      if (eaiResult.triggered && eaiResult.action) {
        const shouldBlock = executeEAIAction(eaiResult.action, auditLog);
        
        if (shouldBlock) {
          answer = generateEAAAwareFallback(eaaProfile, emotion);
          emotion = 'onzekerheid';
          label = 'Fout';
          reasoning = `E_AI rule ${eaiResult.ruleId} blocked output`;
        }
      }
    } catch (err) {
      console.error('⚠️ E_AI Rules evaluation failed:', err);
      auditLog.push('⚠️ E_AI Rules evaluation failed');
    }
    
    // ============ EAA STRATEGY VALIDATION (v20) ============
    if (label) {
      const eaaValidation = validateEAAForStrategy(eaaProfile, label);
      if (!eaaValidation.valid) {
        auditLog.push(`⚠️ EAA blocks strategy "${label}": ${eaaValidation.reason}`);
        label = 'Reflectievraag';
      }
    }
    
    // ============ STORE REFLECTIVE MEMORY (v20) ============
    try {
      await storeReflectiveMemory(
        supabase,
        ctx.userInput,
        answer,
        eaaProfile,
        label || 'Reflectievraag'
      );
    } catch (err) {
      console.error('⚠️ Failed to store reflective memory:', err);
    }
    
    // ============ NGBSE CHECK (v20) ============
    await logFlowEvent(sessionId, 'NGBSE Check', 'processing');
    
    const { performNGBSECheck } = await import('@/lib/ngbseEngine');
    const rubricScores = ctx.rubric ? {
      crisis: ctx.rubric.crisis || 0,
      distress: ctx.rubric.distress || 0,
      support: ctx.rubric.support || 0,
      coping: ctx.rubric.coping || 0,
    } : undefined;
    
    const ngbseStartTime = Date.now();
    const ngbseResult = await performNGBSECheck({
      userInput: ctx.userInput,
      aiResponse: answer,
      confidence,
      emotion,
      seedMatchCount: ctx.seed ? 1 : 0,
      rubricScores,
      conversationHistory: ctx.conversationHistory || [],
      sessionId,
    });
    
    await logFlowEvent(sessionId, 'NGBSE Check', 'completed', Date.now() - ngbseStartTime, {
      blindspots: ngbseResult.blindspots.length,
      adjustedConfidence: ngbseResult.adjustedConfidence
    });
    
    if (ngbseResult.blindspots.length > 0) {
      auditLog.push(`🔍 NGBSE: ${ngbseResult.blindspots.length} blindspot(s) detected`);
      confidence = ngbseResult.adjustedConfidence;
    }
    
    // ============ HITL CHECK (v20) ============
    await logFlowEvent(sessionId, 'HITL Check', 'processing');
    
    const { shouldTriggerHITL, triggerHITL } = await import('@/lib/hitlTriggers');
    const hitlDecision = await shouldTriggerHITL({
      crisisScore: ctx.rubric?.crisis || 0,
      tdValue: tdScore?.value || 0,
      confidence,
      emotion,
      rubrics: ctx.rubric,
      blindspots: ngbseResult.blindspots,
    });
    
    if (hitlDecision.shouldTrigger) {
      auditLog.push(`🚨 HITL triggered: ${hitlDecision.triggerType} (${hitlDecision.severity})`);
      await triggerHITL(ctx.userInput, answer, hitlDecision, {
        sessionId,
        rubrics: ctx.rubric,
        ngbseResult,
      });
      
      await logFlowEvent(sessionId, 'HITL Check', 'completed', 0, {
        triggered: true,
        type: hitlDecision.triggerType,
        severity: hitlDecision.severity
      });
      
      if (hitlDecision.blockOutput) {
        answer = "Dit bericht vereist menselijke review. Een specialist bekijkt je bericht zo snel mogelijk.";
        confidence = 0.2;
        label = 'Reflectievraag';
      }
    } else {
      await logFlowEvent(sessionId, 'HITL Check', 'completed', 0, { triggered: false });
    }
    
    const processingTime = Date.now() - startTime;
    auditLog.push(`⏱️ Total processing time: ${processingTime}ms`);
    
    await logDecisionToDatabase({
      ctx,
      policyDecision: policyDecision.action,
      ruleId: policyDecision.ruleId,
      answer,
      emotion,
      confidence,
      validated,
      constraintsOK,
      processingTime,
      auditLog
    });

    // STAP 7: Return result
    return {
      answer,
      emotion,
      confidence,
      label,
      reasoning: policyDecision.reasoning,
      metadata: {
        policyDecision: policyDecision.action,
        ruleId: policyDecision.ruleId,
        semanticInterventions: allowedInterventions,
        validated,
        constraintsOK,
        processingPath,
        auditLog
      }
    };

  } catch (error) {
    console.error('🔴 Orchestration error:', error);
    auditLog.push(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    
    // ============ AUTO-HEALING (v20) ============
    await logFlowEvent(sessionId, 'AUTO_HEALING', 'processing');
    
    const { attemptAutoHeal } = await import('./autoHealing');
    const healingResult = await attemptAutoHeal(
      {
        error: error as Error,
        sessionId,
        userInput: ctx.userInput,
        attemptNumber: 1,
        conversationHistory: ctx.conversationHistory || [],
      },
      async () => orchestrate(ctx)
    );
    
    await logFlowEvent(sessionId, 'AUTO_HEALING', healingResult.success ? 'completed' : 'failed', 0, {
      strategy: healingResult.strategy,
      escalated: healingResult.escalateToHITL || false
    });
    
    if (healingResult.success && healingResult.response) {
      return healingResult.response;
    }
    
    if (healingResult.escalateToHITL) {
      auditLog.push('🚨 Auto-healing failed - escalating to HITL');
    }
    
    return {
      answer: 'Het spijt me, er ging iets mis. Kun je het opnieuw proberen?',
      emotion: 'error',
      confidence: 0.1,
      label: 'Fout',
      reasoning: 'System error during orchestration',
      metadata: {
        policyDecision: 'ERROR',
        ruleId: 'error',
        semanticInterventions: [],
        validated: false,
        constraintsOK: false,
        processingPath: 'seed',
        auditLog
      }
    };
  }
}

/**
 * Analyze input complexity
 */
function analyzeInputComplexity(input: string) {
  const length = input.trim().length;
  const isGreeting = /^(hi|hallo|hey|hoi|dag|hello|yo|hé|hee|sup|hiya|ok|oké|ja|nee|hmm)[\s!?.]*$/i.test(input.trim());
  const isComplex = length > 20 && !isGreeting;

  return { length, isGreeting, isComplex };
}

/**
 * Generate fast path response for simple greetings
 */
function generateFastPathResponse(input: string): string {
  const greetings = [
    'Hoi! Hoe kan ik je helpen?',
    'Hey! Vertel, waar loop je tegenaan?',
    'Hallo! Fijn dat je er bent. Wat wil je delen?'
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * Generate template response based on emotion and allowed interventions
 */
function generateTemplateResponse(emotion: string, allowedInterventions: string[]): string {
  if (allowedInterventions.includes('valideren')) {
    return `Ik hoor dat je ${emotion} voelt. Dat is helemaal begrijpelijk.`;
  } else if (allowedInterventions.includes('empathie')) {
    return `Het klinkt alsof je ${emotion} ervaart. Ik ben er voor je.`;
  } else {
    return `Dank je voor het delen van je gevoel van ${emotion}.`;
  }
}

/**
 * Generate crisis response
 */
function generateCrisisResponse(ctx: OrchestrationContext): string {
  return `Ik merk dat je in een moeilijke situatie zit. Het is belangrijk dat je niet alleen bent hiermee. Kun je contact opnemen met een volwassene die je vertrouwt, of bel 113 voor directe ondersteuning?`;
}

/**
 * Generate EAA-aware fallback response (replaces generic fallback)
 */
function generateEAAAwareFallback(eaaProfile: { ownership: number; autonomy: number; agency: number }, emotion: string): string {
  if (eaaProfile.agency < 0.4) {
    return `Wat maakt het nu zo moeilijk voor je?`; // Reflectie bij lage agency
  } else if (eaaProfile.agency < 0.6) {
    return `Ik hoor dat je ${emotion} voelt. Wil je vertellen wat er speelt?`;
  } else {
    return `Het klinkt alsof je ${emotion} ervaart. Hoe kan ik je ondersteunen?`;
  }
}

/**
 * Detect prompt injection attempts
 */
function detectPromptInjection(text: string): { safe: boolean; reason?: string } {
  const suspiciousPatterns = [
    /ignore (previous|all) (instructions?|prompts?)/i,
    /you are now/i,
    /new (role|instruction|prompt):/i,
    /system:\s*\{/i,
    /\[SYSTEM\]/i,
    /<\|im_start\|>/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) {
      return { safe: false, reason: 'Potential prompt injection detected' };
    }
  }
  
  return { safe: true };
}

/**
 * Inject seed template with therapeutic constraints (PRE-LLM layer)
 */
function injectSeedTemplate(
  seedGuidance: string,
  userInput: string,
  emotion: string,
  eaaProfile: { ownership: number; autonomy: number; agency: number },
  conversationHistory: Array<{ role: string; content: string }>
): string {
  // Check for prompt injection in user input
  const injectionCheck = detectPromptInjection(userInput);
  if (!injectionCheck.safe) {
    console.warn('⚠️ Prompt injection attempt detected');
    return seedGuidance; // Return seed as-is without user context
  }
  
  // Replace template parameters
  const conversationSummary = conversationHistory.slice(-3).map(h => h.content).join(' → ');
  let enrichedSeed = seedGuidance
    .replace(/\{\{emotie\}\}/g, emotion)
    .replace(/\{\{agency\}\}/g, `${(eaaProfile.agency * 100).toFixed(0)}%`)
    .replace(/\{\{autonomie\}\}/g, `${(eaaProfile.autonomy * 100).toFixed(0)}%`)
    .replace(/\{\{eigenaarschap\}\}/g, `${(eaaProfile.ownership * 100).toFixed(0)}%`);
  
  // Add simple context (NO therapeutic instructions!)
  enrichedSeed += `\n\nGebruiker zei: "${userInput}"`;
  if (conversationHistory.length > 0) {
    enrichedSeed += ` (gesprek: ${conversationSummary})`;
  }
  
  return enrichedSeed;
}

/**
 * Compile seed response with LLM fusion (SEED + LLM + CONVERSATION)
 * v20 NeSy Fusion: Echte fusion in plaats van "beste antwoord" selectie
 */
async function compileSeedResponse(
  ctx: OrchestrationContext,
  auditLog: string[],
  eaaProfile: { ownership: number; autonomy: number; agency: number }
): Promise<{ answer: string; fusionMetadata?: any }> {
  try {
    const seedGuidance = ctx.seed.response || 'Ik begrijp je.';
    
    // STEP 1: Pre-LLM seed protection - bewaar originele seed core
    const { extractTherapeuticIntent } = await import('./fusionHelpers');
    const seedCore = {
      therapeuticIntent: extractTherapeuticIntent(seedGuidance),
      emotionalTone: ctx.seed.emotion,
      originalResponse: seedGuidance
    };
    
    auditLog.push(`🧬 Seed core extracted: ${JSON.stringify(seedCore.therapeuticIntent)}`);
    
    // STEP 2: Pre-LLM Template Injection met fusion constraints
    const enrichedSeed = injectSeedTemplate(
      seedGuidance,
      ctx.userInput,
      ctx.seed.emotion,
      eaaProfile,
      ctx.conversationHistory
    );
    
    auditLog.push(`🎯 Seed enriched with conversation context`);
    
    // Get allowed interventions
    const allowedInterventions = getEAAAllowedInterventions(ctx.seed.emotion, ctx.rubric);
    
    // STEP 3: LLM Generation met fusion mode enabled + v20 context
    console.log('🤖 Calling LLM Generator with NeSy fusion mode + v20 metadata...');
    const { data, error } = await supabase.functions.invoke('evai-core', {
      body: {
        operation: 'generate-response',
        seedGuidance: enrichedSeed,
        fusionMode: true, // ← NIEUW: Signal fusion mode
        preserveCore: true, // ← NIEUW: Instruction to preserve seed
        seedCore: seedCore, // ← NIEUW: Voor validation
        userInput: ctx.userInput,
        conversationHistory: ctx.conversationHistory.slice(-6),
        emotion: ctx.seed.emotion,
        eaaProfile: ctx.eaaProfile || eaaProfile,
        allowedInterventions,
        // v20 metadata voor contextuele sturing
        tdMatrix: ctx.tdMatrix,
        regisseurBriefing: ctx.regisseurBriefing,
        eaiRules: ctx.eaiRules,
        rubricsAssessment: ctx.rubricsAnalysis,
        fusionMetadata: ctx.fusionMetadata,
        safetyCheck: ctx.safetyCheck
      }
    });
    
    if (error || !data?.response) {
      console.warn('⚠️ LLM generation failed, using EAA-aware fallback:', error);
      auditLog.push(`⚠️ LLM fallback: ${error?.message || 'No response'}`);
      return { answer: generateEAAAwareFallback(eaaProfile, ctx.seed.emotion) };
    }
    
    // STEP 4: Neurosymbolic Fusion with Meta-Learner weights
    console.log('🧬 Performing Neurosymbolic Fusion with learned weights...');
    const { assembleFusion } = await import('./fusionHelpers');
    
    // EAA Compliance Validation before fusion
    const validationResult = validateEAACompliance(
      data.response,
      eaaProfile,
      allowedInterventions
    );
    
    const fusionCtx = {
      symbolic: {
        response: seedGuidance,
        emotion: ctx.seed.emotion || 'onzekerheid',
        confidence: ctx.seed.matchScore || 0.7,
        sources: []
      },
      neural: {
        response: data.response,
        confidence: 0.85,
        processingPath: 'llm'
      },
      validation: {
        validated: validationResult.ok,
        constraintsOK: validationResult.ok,
        tdScore: ctx.tdMatrix?.value || 0.5
      },
      eaaProfile: ctx.eaaProfile || eaaProfile
    };
    
    const fusionResult = await assembleFusion(fusionCtx);
    
    auditLog.push(`🧬 Fusion complete: ${fusionResult.strategy} (symbolic: ${(fusionResult.symbolicWeight * 100).toFixed(0)}%, neural: ${(fusionResult.neuralWeight * 100).toFixed(0)}%)`);
    
    if (validationResult.warnings.length > 0) {
      auditLog.push(`⚠️ Post-LLM warnings: ${validationResult.warnings.join(', ')}`);
    }
    
    return {
      answer: fusionResult.fusedResponse,
      fusionMetadata: {
        strategy: fusionResult.strategy,
        preservationScore: fusionResult.preservationScore,
        symbolicWeight: fusionResult.symbolicWeight,
        neuralWeight: fusionResult.neuralWeight
      }
    };
  } catch (err) {
    console.error('❌ Seed compilation error:', err);
    auditLog.push(`❌ Compilation error: ${err instanceof Error ? err.message : String(err)}`);
    return { answer: generateEAAAwareFallback(eaaProfile, ctx.seed.emotion) };
  }
}

/**
 * Get allowed interventions based on emotion and rubric (EAA-aware)
 */
function getEAAAllowedInterventions(emotion: string, rubric: any): string[] {
  const interventions = ['validatie', 'reflectie'];
  
  if (rubric?.protectiveScore > 0.5) {
    interventions.push('suggestie');
  }
  
  if (rubric?.protectiveScore > 0.7 && rubric?.riskScore < 0.3) {
    interventions.push('interventie');
  }
  
  return interventions;
}

/**
 * Log decision to database for audit trail
 */
async function logDecisionToDatabase(params: {
  ctx: OrchestrationContext;
  policyDecision: string;
  ruleId: string;
  answer: string;
  emotion: string;
  confidence: number;
  validated: boolean;
  constraintsOK: boolean;
  processingTime: number;
  auditLog: string[];
}) {
  try {
    const sessionId = sessionStorage.getItem('evai-current-session-id') || 'hybrid-' + Date.now();
    
    await supabase.rpc('log_unified_decision_v3', {
      p_user_input: params.ctx.userInput,
      p_emotion: params.emotion,
      p_response: params.answer,
      p_confidence: params.confidence,
      p_label: 'Valideren',
      p_sources: [{ 
        id: params.ruleId, 
        emotion: params.emotion,
        confidence: params.confidence,
        content_type: 'policy',
        similarity: 0
      }],
      p_conversation_id: sessionId,
      p_processing_time_ms: params.processingTime,
      p_api_collaboration: {
        api1Used: params.policyDecision === 'LLM_PLANNING',
        api2Used: false,
        vectorApiUsed: false,
        googleApiUsed: false,
        seedGenerated: false,
        secondaryAnalysis: false
      },
      // v20 metadata logging
      p_eaa_profile: params.ctx.eaaProfile ? {
        ownership: params.ctx.eaaProfile.ownership,
        autonomy: params.ctx.eaaProfile.autonomy,
        agency: params.ctx.eaaProfile.agency
      } : null,
      p_td_matrix: params.ctx.tdMatrix,
      p_eai_rules: params.ctx.eaiRules,
      p_regisseur_briefing: params.ctx.regisseurBriefing,
      p_fusion_metadata: params.ctx.fusionMetadata,
      p_safety_check: params.ctx.safetyCheck,
      p_rubrics_analysis: params.ctx.rubricsAnalysis
    });

    console.log('✅ Decision logged to database with v20 metadata');
  } catch (error) {
    console.error('❌ Failed to log decision:', error);
  }
}

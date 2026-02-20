import { useState, useCallback } from 'react';
import { ProcessingContext, UnifiedResponse } from '@/types/core';
import { useUnifiedDecisionCore, DecisionResult } from './useUnifiedDecisionCore';
import { testOpenAIApiKey } from '@/utils/apiKeyTester';
import { supabase } from '@/integrations/supabase/client';
import { OPENAI_MODEL } from '../openaiConfig';
import { useEnhancedEvAI56Rubrics } from './useEnhancedEvAI56Rubrics';
import { runConditionalSecondaryAnalysis } from './useSecondaryAnalysisRunner';
import { useBriefingCache } from './useBriefingCache';
import { checkPromptSafety } from '@/lib/safetyGuard';
import { toast } from 'sonner';
import { orchestrate, OrchestrationContext } from '@/orchestrator/hybrid';
import { getGraphStats } from '@/semantics/graph';
import { useEnhancedSeedGeneration } from './useEnhancedSeedGeneration';
// v20 EAA Framework
import { evaluateEAA, validateEAAForStrategy } from '@/lib/eaaEvaluator';
import { evaluateTD, estimateAIContribution } from '@/lib/tdMatrix';
import { evaluateEAIRules, createEAIContext, executeEAIAction } from '@/policy/eai.rules';
import type { EAAProfile } from '@/types/eaa';

interface ProcessingStats {
  totalRequests: number;
  averageProcessingTime: number;
  successRate: number;
  lastProcessingTime: number;
  errorCount: number;
  lastError?: string;
  neurosymbolicRate: number; // % of requests that used true neurosymbolic reasoning (not fallback)
  successfulKnowledgeMatches: number;
}

export function useProcessingOrchestrator() {
  const [stats, setStats] = useState<ProcessingStats>({
    totalRequests: 0,
    averageProcessingTime: 0,
    successRate: 100,
    lastProcessingTime: 0,
    errorCount: 0,
    neurosymbolicRate: 0,
    successfulKnowledgeMatches: 0
  });
  const [lastConfidence, setLastConfidence] = useState<number>(1.0);

  const { makeUnifiedDecision, isProcessing, knowledgeStats } = useUnifiedDecisionCore();
  const { performEnhancedAssessment } = useEnhancedEvAI56Rubrics();
  const { getCached, setCached } = useBriefingCache();
  const { generateEnhancedSeed } = useEnhancedSeedGeneration();

  const validateApiKey = (apiKey: string): boolean => {
    if (!apiKey || !apiKey.trim()) return false;
    if (!apiKey.startsWith('sk-')) return false;
    if (apiKey.includes('demo') || apiKey.includes('test') || apiKey.includes('mock') || apiKey.includes('dev')) {
      return false;
    }
    return true;
  };

  console.log('🧠 EvAI v16 NEUROSYMBOLISCH initialized');
  console.log('📊 Semantic Graph Stats:', getGraphStats());

  const orchestrateProcessing = useCallback(async (
    userInput: string,
    conversationHistory: any[],
    apiKey?: string
  ): Promise<UnifiedResponse> => {
    console.log('🎼 Orchestrator v16 NEUROSYMBOLISCH: Policy + Semantic + Validation');
    console.log('📝 User input:', userInput.substring(0, 50) + '...');
    console.log('📚 Conversation history length:', conversationHistory?.length || 0);
    
    const startTime = Date.now();
    
    // ============ v20 FLOW LOGGING SETUP ============
    const sessionId = sessionStorage.getItem('evai-current-session-id') || 'unknown';
    const { logFlowEvent } = await import('@/lib/flowEventLogger');
    
    try {
      // ============ LAYER 1: SAFETY CHECK ============
      await logFlowEvent(sessionId, 'Safety Check', 'processing');
      const safetyStartTime = Date.now();
      
      console.log('🛡️ Safety check: Analyzing user input...');
      const safetyResult = await checkPromptSafety(userInput);
      
      await logFlowEvent(sessionId, 'Safety Check', 'completed', Date.now() - safetyStartTime, {
        decision: safetyResult.decision,
        score: safetyResult.score,
        flags: safetyResult.flags,
        severity: safetyResult.severity
      });

      if (safetyResult.decision === 'block') {
        console.warn('🚫 Safety check BLOCKED input:', safetyResult.flags, 'severity:', safetyResult.severity, 'details:', safetyResult.details);
        toast.error('Input geblokkeerd om veiligheidsredenen', {
          description: safetyResult.details || 'Je bericht bevat mogelijk schadelijke inhoud. Probeer het anders te formuleren.'
        });
        throw new Error('Input geblokkeerd vanwege veiligheidsredenen');
      }

      if (safetyResult.decision === 'review') {
        console.warn('⚠️ Safety check flagged for REVIEW:', safetyResult.flags, 'severity:', safetyResult.severity, 'details:', safetyResult.details);
        toast.warning('Let op: gevoelige inhoud gedetecteerd', {
          description: safetyResult.details || 'We verwerken je bericht, maar houd rekening met gevoeligheid.'
        });
      } else {
        console.log('✅ Safety check PASSED');
      }

      // Optional API key validation: if provided, ensure it's valid; else rely on server-side keys via Edge Functions
      if (apiKey && !validateApiKey(apiKey)) {
        throw new Error('OpenAI API key ongeldig. Verwijder of vervang in instellingen.');
      }

      if (apiKey) {
        // Pre-flight API key validation
        console.log('🧪 Validating API key functionality...');
        const keyTest = await testOpenAIApiKey(apiKey);
        if (!keyTest.isValid) {
          console.error('❌ API Key validation failed:', keyTest.error);
          throw new Error(`API Key validatie mislukt: ${keyTest.error}`);
        }
        console.log('✅ API Key validation passed');
      } else {
        console.log('🔐 No client API key provided - using server-side keys via Edge Functions');
      }

      // 🎯 REGISSEUR BESLISSING 1: Is dit een simpele greeting? -> Fast-path! (VÓÓr rubrics!)
      // ✅ LAYER 1 FIX: Multi-word greetings support (e.g., "Hey hallo", "Hoi daar")
      const isSimpleGreeting = /^(hi|hallo|hey|hoi|dag|hello|yo|hé|hee|sup|hiya)(\s+(daar|hallo|hey|hoi|jij|allemaal|iedereen))?[\s!?.]*$/i.test(userInput.trim());
      
      if (isSimpleGreeting) {
        console.log('⚡ FAST-PATH: Simpele greeting detected');
        
        // ✅ FIX 5: Run Rubrics check even on fast-path (security requirement)
        console.log('🛡️ Running Rubrics check on greeting (fast-path security)');
        const sessionId = sessionStorage.getItem('evai-current-session-id') || 'unknown';
        const quickRubricResult = await performEnhancedAssessment(userInput, sessionId, 'balanced');
        
        // If high risk detected in greeting, don't use fast-path
        if (quickRubricResult.overallRisk > 60) {
          console.warn('⚠️ High risk detected in greeting, routing to full pipeline');
        } else {
          console.log('✅ Rubrics check passed, continuing fast-path');
          const fastGreetings = [
            'Hoi! Hoe kan ik je helpen?',
            'Hey! Vertel, waar loop je tegenaan?',
            'Hallo! Fijn dat je er bent. Wat wil je delen?'
          ];
          const response = fastGreetings[Math.floor(Math.random() * fastGreetings.length)];
        
          const processingTime = Date.now() - startTime;
          
          setStats(prev => ({
            totalRequests: prev.totalRequests + 1,
            averageProcessingTime: (prev.averageProcessingTime * prev.totalRequests + processingTime) / (prev.totalRequests + 1),
            successRate: ((prev.successRate * prev.totalRequests + 100) / (prev.totalRequests + 1)),
            lastProcessingTime: processingTime,
            errorCount: prev.errorCount,
            neurosymbolicRate: ((prev.neurosymbolicRate * prev.totalRequests + 100) / (prev.totalRequests + 1)),
            successfulKnowledgeMatches: prev.successfulKnowledgeMatches
          }));

          return {
            content: response,
            emotion: 'neutraal',
            confidence: 0.95,
            label: 'Valideren',
            reasoning: 'Fast-path: Rubrics-validated greeting',
            symbolicInferences: ['⚡ Fast-path (security-hardened)', '✅ Rubrics: Passed', '⏭️ Bypassed: Orchestrator, Knowledge matching'],
            metadata: {
              processingPath: 'symbolic',
              totalProcessingTime: processingTime,
              componentsUsed: ['Fast-path greeting detector', 'Rubrics Engine (security check)'],
              apiCollaboration: {
                api1Used: false,
                api2Used: false,
                vectorApiUsed: false,
                googleApiUsed: false,
                seedGenerated: false,
                secondaryAnalysis: false
              }
            }
          };
        }
      }

      // ============ LAYER 2: RUBRICS ASSESSMENT (EvAI 5.6) ============
      await logFlowEvent(sessionId, 'Rubrics Assessment', 'processing');
      const rubricStartTime = Date.now();
      
      console.log('📊 Rubrics Assessment: Analyzing conversation context...');
      const rubricResult = await performEnhancedAssessment(
        userInput,
        sessionId,
        'balanced'
      );
      
      await logFlowEvent(sessionId, 'Rubrics Assessment', 'completed', Date.now() - rubricStartTime, {
        overallRisk: rubricResult.overallRisk,
        overallProtective: rubricResult.overallProtective,
        dominantPattern: rubricResult.dominantPattern,
        triggersCount: rubricResult.assessments.flatMap(a => a.triggers).length
      });
      
      // ============ LAYER 3: EAA EVALUATION ============
      await logFlowEvent(sessionId, 'EAA Evaluation', 'processing');
      const eaaStartTime = Date.now();
      
      console.log('🧠 v20 Pre-Filter: EAA Evaluation starting...');
      const eaaProfile: EAAProfile = evaluateEAA(userInput, {
        riskScore: rubricResult.overallRisk / 100,
        protectiveScore: rubricResult.overallProtective / 100,
        dominantPattern: rubricResult.dominantPattern
      });
      
      await logFlowEvent(sessionId, 'EAA Evaluation', 'completed', Date.now() - eaaStartTime, {
        ownership: eaaProfile.ownership,
        autonomy: eaaProfile.autonomy,
        agency: eaaProfile.agency
      });
      
      console.log(`🧠 EAA Profile: O=${eaaProfile.ownership.toFixed(2)} A=${eaaProfile.autonomy.toFixed(2)} Ag=${eaaProfile.agency.toFixed(2)}`);
      
      console.log('📊 Rubrics result:', {
        risk: rubricResult.overallRisk,
        protective: rubricResult.overallProtective,
        pattern: rubricResult.dominantPattern
      });
      
      // 🎯 REGISSEUR BESLISSING 2: Is dit gesprek complex genoeg voor Strategic Briefing?
      const inputComplexity = userInput.trim().length;
      const conversationDepth = conversationHistory?.length || 0;
      const needsDeepAnalysis = inputComplexity > 20 || conversationDepth > 3 || rubricResult.overallRisk > 40;
      
      console.log('🎭 Regisseur evaluatie:', {
        complexity: inputComplexity,
        depth: conversationDepth,
        risk: rubricResult.overallRisk,
        needsDeepAnalysis
      });

      // ============ LAYER 4: REGISSEUR BRIEFING ============
      await logFlowEvent(sessionId, 'Regisseur Briefing', needsDeepAnalysis ? 'processing' : 'skipped');
      let briefing = null;
      
      if (needsDeepAnalysis) {
        const briefingStartTime = Date.now();
        const cachedBriefing = getCached(sessionId);
        briefing = cachedBriefing;
        
        if (!cachedBriefing) {
          console.log('🎯 Regisseur besluit: Strategic Briefing nodig voor complex gesprek');
          briefing = await runConditionalSecondaryAnalysis(
            userInput,
            conversationHistory,
            rubricResult,
            lastConfidence
          );
          
          if (briefing) {
            setCached(sessionId, briefing);
            console.log('✅ Strategic Briefing created and cached');
          }
        }
        
        await logFlowEvent(sessionId, 'Regisseur Briefing', 'completed', Date.now() - briefingStartTime, {
          goal: briefing?.goal,
          priority: briefing?.priority,
          cached: !!cachedBriefing
        });
      } else {
        console.log('⏭️ Regisseur besluit: Simpel gesprek, Strategic Briefing overgeslagen');
      }

      // ============ LAYER 5: UNIFIED DECISION (Knowledge Matching) ============
      await logFlowEvent(sessionId, 'Response Generation', 'processing');
      const decisionStartTime = Date.now();
      
      const vectorApiKey = apiKey;
      
      console.log('🧠 NEUROSYMBOLISCH v16: Starting Hybrid Orchestrator...');
      console.log('📊 Knowledge base status:', knowledgeStats.total > 0 ? 'Active' : 'Initializing');
      
      // First, try unified decision for seed matching
      const decisionResult: DecisionResult | null = await makeUnifiedDecision(
        userInput,
        apiKey,
        validateApiKey(vectorApiKey) ? vectorApiKey : apiKey,
        briefing, // Strategic briefing (conditionally created)
        conversationHistory
      );
      
      // Store v20 metadata for logging (will be used in logDecisionToDatabase later)
      const v20Metadata = {
        eaaProfile,
        tdMatrix: null as any, // Wordt later berekend
        eaiRules: null as any, // Wordt later berekend
        regisseurBriefing: briefing ? {
          goal: briefing.goal,
          priority: briefing.priority
        } : null,
        fusionMetadata: null as any, // Wordt later toegevoegd
        safetyCheck: {
          decision: safetyResult.decision,
          score: safetyResult.score,
          flags: safetyResult.flags
        },
        rubricsAnalysis: {
          overallRisk: rubricResult.overallRisk,
          overallProtective: rubricResult.overallProtective,
          dominantPattern: rubricResult.dominantPattern,
          assessments: rubricResult.assessments
        }
      };
      
      await logFlowEvent(sessionId, 'Response Generation', 'completed', Date.now() - decisionStartTime, {
        matchFound: !!decisionResult,
        confidence: decisionResult?.confidence || 0,
        sources: decisionResult?.sources?.length || 0
      });

      // 🎯 V16: If high confidence match, route through hybrid orchestrator for validation
      let finalResult: UnifiedResponse | null = null;
      
      if (decisionResult && decisionResult.confidence > 0.70) {
        console.log('✅ High confidence decision (>70%), routing through Hybrid Orchestrator v16...');
        
        try {
          console.log('🎯 High confidence decision, invoking hybrid orchestrator...');
          console.log('📊 Decision details:', {
            emotion: decisionResult.emotion,
            confidence: decisionResult.confidence,
            sources: decisionResult.sources?.length || 0,
            firstSourceId: decisionResult.sources[0]?.id
          });
          
          const orchestrationCtx: OrchestrationContext = {
            userInput,
            rubric: {
              crisis: rubricResult?.overallRisk || 0,
              distress: rubricResult?.overallRisk || 0,
              support: rubricResult?.overallProtective || 0,
              coping: 100 - (rubricResult?.overallRisk || 0),
              overallRisk: rubricResult?.overallRisk || 0,
              overallProtective: rubricResult?.overallProtective || 0,
              dominantPattern: rubricResult?.dominantPattern || 'unknown'
            },
            seed: {
              matchScore: decisionResult.confidence,
              templateId: decisionResult.sources[0]?.id,
              emotion: decisionResult.emotion,
              response: decisionResult.response
            },
            consent: true,
            conversationHistory,
            topEmotion: decisionResult.emotion,
            rubricAssessments: rubricResult.assessments,
            // Pass v20 metadata to orchestrator
            eaaProfile: eaaProfile,
            safetyCheck: {
              decision: safetyResult.decision,
              score: safetyResult.score,
              flags: safetyResult.flags
            },
            rubricsAnalysis: {
              overallRisk: rubricResult.overallRisk,
              overallProtective: rubricResult.overallProtective,
              dominantPattern: rubricResult.dominantPattern,
              assessments: rubricResult.assessments
            },
            regisseurBriefing: briefing ? {
              advice: briefing.goal,
              reason: briefing.priority,
              avgAgency: eaaProfile.agency
            } : undefined
          };

          console.log('🎼 Calling orchestrate with seed:', {
            templateId: orchestrationCtx.seed.templateId,
            hasResponse: !!orchestrationCtx.seed.response
          });

          const hybridResult = await orchestrate(orchestrationCtx);
          
          console.log('✅ Orchestrate completed:', {
            validated: hybridResult.metadata.validated,
            constraintsOK: hybridResult.metadata.constraintsOK,
            processingPath: hybridResult.metadata.processingPath,
            hasAnswer: !!hybridResult.answer
          });
          
          // 🧬 NEUROSYMBOLISCHE FUSION v20 - Assembleer Ying & Yang
          console.log('🧬 NeSy Fusion Assembly: Combining symbolic + neural responses...');
          
          const { assembleFusion } = await import('@/orchestrator/fusionHelpers');
          
          const fusionResult = await assembleFusion({
            symbolic: {
              response: decisionResult.response,
              emotion: decisionResult.emotion,
              confidence: decisionResult.confidence,
              sources: decisionResult.sources
            },
            neural: {
              response: hybridResult.answer,
              confidence: hybridResult.confidence,
              processingPath: hybridResult.metadata.processingPath
            },
            validation: {
              validated: hybridResult.metadata.validated,
              constraintsOK: hybridResult.metadata.constraintsOK,
              tdScore: 0.5 // TODO: Extract from metadata if available
            }
          });
          
          console.log(`🧬 Fusion strategy: ${fusionResult.strategy}`);
          console.log(`   Balance: ${Math.round(fusionResult.symbolicWeight * 100)}% symbolic / ${Math.round(fusionResult.neuralWeight * 100)}% neural`);
          console.log(`   Preservation score: ${Math.round(fusionResult.preservationScore * 100)}%`);
          
          // Update v20Metadata with Fusion results
          v20Metadata.fusionMetadata = {
            strategy: fusionResult.strategy,
            symbolicWeight: fusionResult.symbolicWeight,
            neuralWeight: fusionResult.neuralWeight,
            preservationScore: fusionResult.preservationScore
          };
          
          // ✅ FIX 2: Validate fused response with TD-Matrix + E_AI
          console.log('🛡️ Validating fused response with TD-Matrix + E_AI Rules...');
          
          // ============ LAYER 10: TD-MATRIX EVALUATION ============
          await logFlowEvent(sessionId, 'TD-Matrix', 'processing');
          const tdStartTime = Date.now();
          
          const aiContribution = estimateAIContribution(fusionResult.fusedResponse);
          const userAgency = eaaProfile.agency;
          const tdResult = evaluateTD(aiContribution, userAgency);
          
          await logFlowEvent(sessionId, 'TD-Matrix', 'completed', Date.now() - tdStartTime, {
            value: tdResult.value,
            flag: tdResult.flag,
            shouldBlock: tdResult.shouldBlock,
            aiContribution
          });
          
          // ============ LAYER 11: E_AI RULES ENGINE ============
          await logFlowEvent(sessionId, 'E_AI Rules', 'processing');
          const eaiStartTime = Date.now();
          
          const eaiContext = createEAIContext(eaaProfile, tdResult.value, {
            riskScore: rubricResult.overallRisk / 100,
            protectiveScore: rubricResult.overallProtective / 100
          });
          const eaiResult = evaluateEAIRules(eaiContext);
          
          await logFlowEvent(sessionId, 'E_AI Rules', 'completed', Date.now() - eaiStartTime, {
            triggered: eaiResult.triggered,
            ruleId: eaiResult.ruleId,
            actionType: eaiResult.action?.type
          });
          
          console.log(`   TD Score: ${tdResult.value.toFixed(2)} (${tdResult.flag})`);
          console.log(`   E_AI Triggered: ${eaiResult.triggered} ${eaiResult.triggered ? `(${eaiResult.ruleId})` : ''}`);
          
          // Update v20Metadata with TD-Matrix and E_AI results
          v20Metadata.tdMatrix = {
            value: tdResult.value,
            flag: tdResult.flag,
            shouldBlock: tdResult.shouldBlock,
            aiContribution
          };
          v20Metadata.eaiRules = eaiResult.triggered ? {
            ruleId: eaiResult.ruleId,
            reason: eaiResult.reason,
            action: eaiResult.action
          } : null;
          
          // If E_AI blocks output, use symbolic fallback
          if (eaiResult.triggered && eaiResult.action?.type === 'halt_output') {
            console.warn('⚠️ E_AI blocked fused response, using symbolic fallback');
            fusionResult.fusedResponse = decisionResult.response;
            fusionResult.symbolicWeight = 1.0;
            fusionResult.neuralWeight = 0.0;
            fusionResult.strategy = 'symbolic_fallback';
          }
          
          finalResult = {
            content: fusionResult.fusedResponse, // ← FUSION, niet selection
            emotion: decisionResult.emotion, // Symbolic leidt emotie
            confidence: fusionResult.fusedConfidence, // Weighted average
            label: hybridResult.label as UnifiedResponse['label'],
            reasoning: `🧬 NeSy Fusion: Symbolic core (${Math.round(fusionResult.symbolicWeight*100)}%) + Neural context (${Math.round(fusionResult.neuralWeight*100)}%)`,
            symbolicInferences: [
              `🧬 NEUROSYMBOLISCHE FUSION v20`,
              `🧠 Symbolic: ${decisionResult.emotion} (confidence: ${decisionResult.confidence.toFixed(2)})`,
              `🤖 Neural: Enhanced with context (validation: ${hybridResult.metadata.validated ? '✅' : '❌'})`,
              `⚖️ Balance: ${Math.round(fusionResult.symbolicWeight*100)}% seed / ${Math.round(fusionResult.neuralWeight*100)}% LLM`,
              `📊 Strategy: ${fusionResult.strategy}`,
              `🔍 Preservation: ${Math.round(fusionResult.preservationScore*100)}%`,
              ...decisionResult.symbolicInferences.slice(0, 2)
            ],
            secondaryInsights: hybridResult.metadata.auditLog.slice(0, 5),
            metadata: {
              processingPath: 'hybrid', // Always hybrid nu
              totalProcessingTime: Date.now() - startTime,
              componentsUsed: [
                '🧬 NeSy Fusion Engine v20',
                '🎯 Policy Engine v16',
                '💡 Semantic Graph',
                '🛡️ Validation Layer',
                `Knowledge Base (${knowledgeStats.total} items)`,
                ...(briefing ? ['Strategic Briefing'] : [])
              ],
              fallback: false,
              fusionMetadata: {
                symbolicWeight: fusionResult.symbolicWeight,
                neuralWeight: fusionResult.neuralWeight,
                preservationScore: fusionResult.preservationScore,
                strategy: fusionResult.strategy,
                tdMatrixFlag: tdResult.flag,
                safetyScore: safetyResult.score,
                eaaScores: {
                  ownership: eaaProfile.ownership,
                  autonomy: eaaProfile.autonomy,
                  agency: eaaProfile.agency
                }
              },
              apiCollaboration: {
                api1Used: true,
                api2Used: !!briefing,
                vectorApiUsed: !!vectorApiKey,
                googleApiUsed: false,
                seedGenerated: false,
                secondaryAnalysis: !!briefing
              }
            }
          };
        } catch (hybridError) {
          console.error('❌ HYBRID ORCHESTRATION ERROR - falling back to unified decision');
          console.error('  Error type:', hybridError instanceof Error ? 'Error' : typeof hybridError);
          console.error('  Message:', hybridError instanceof Error ? hybridError.message : String(hybridError));
          console.error('  Stack:', hybridError instanceof Error ? hybridError.stack : 'No stack trace');
        }
      } else {
        console.log('⏭️ Low confidence or no decision, skipping hybrid orchestrator');
        console.log('  Confidence:', decisionResult?.confidence || 0);
      }

      // If hybrid orchestrator produced a result, use it
      if (finalResult) {
        const processingTime = Date.now() - startTime;
        console.log(`✅ Hybrid orchestration completed in ${processingTime}ms`);
        
        setLastConfidence(finalResult.confidence);
        setStats(prev => {
          const newTotalRequests = prev.totalRequests + 1;
          const newSuccessfulMatches = prev.successfulKnowledgeMatches + 1;
          return {
            totalRequests: newTotalRequests,
            averageProcessingTime: (prev.averageProcessingTime * prev.totalRequests + processingTime) / newTotalRequests,
            successRate: ((prev.successRate * prev.totalRequests + 100) / newTotalRequests),
            lastProcessingTime: processingTime,
            errorCount: prev.errorCount,
            lastError: undefined,
            successfulKnowledgeMatches: newSuccessfulMatches,
            neurosymbolicRate: (newSuccessfulMatches / newTotalRequests) * 100
          };
        });
        
        return finalResult;
      }

      if (!decisionResult) {
        console.warn('❌ Geen kennis-match gevonden → Activeer LEARNING MODE');
        
        try {
          // 🎓 LEARNING MODE: Genereer nieuwe seed + gebruik direct
          console.log('🎓 Learning Mode: Analyseer waarom geen match + genereer nieuwe seed...');
          
          const { addAdvancedSeed } = await import('@/lib/advancedSeedStorage');
          
          // Bepaal severity op basis van rubric risk
          const severity: 'low' | 'medium' | 'high' | 'critical' = 
            rubricResult.overallRisk > 70 ? 'critical' :
            rubricResult.overallRisk > 50 ? 'high' :
            rubricResult.overallRisk > 30 ? 'medium' : 'low';
          
          console.log(`🎓 Severity bepaald: ${severity} (risk: ${rubricResult.overallRisk})`);
          
          // Genereer nieuwe seed via OpenAI
          const seedRequest = {
            emotion: rubricResult.dominantPattern || 'onzekerheid',
            context: userInput.slice(0, 240),
            severity,
            conversationHistory: (conversationHistory || []).slice(-6).map(h => h.content)
          };
          
          console.log('🎓 Genereer nieuwe seed met context:', seedRequest.emotion);
          const newSeed = await generateEnhancedSeed(seedRequest, '');
          
          if (!newSeed) {
            throw new Error('Learning Mode: Seed generatie mislukt');
          }
          
          console.log('✅ Nieuwe seed gegenereerd:', {
            id: newSeed.id,
            emotion: newSeed.emotion,
            type: newSeed.type,
            triggers: newSeed.triggers?.slice(0, 3)
          });
          
          // ============ v20 VALIDATION: TD-Matrix + E_AI Rules ============
          console.log('🧠 v20 Learning Mode Validation: Checking generated seed...');
          
          // Estimate AI contribution for generated seed
          const seedAIContribution = estimateAIContribution(newSeed.response.nl);
          const seedTD = evaluateTD(seedAIContribution, eaaProfile.agency);
          console.log(`⚖️ v20 TD-Matrix (Learning): ${seedTD.flag} (TD=${seedTD.value.toFixed(2)})`);
          
          // Check E_AI rules
          const eaiContext = createEAIContext(
            eaaProfile,
            seedTD.value,
            {
              riskScore: rubricResult.overallRisk / 100,
              protectiveScore: rubricResult.overallProtective / 100
            }
          );
          
          const eaiResult = evaluateEAIRules(eaiContext);
          const auditLog: string[] = [];
          
          if (eaiResult.triggered && eaiResult.action) {
            const shouldBlock = executeEAIAction(eaiResult.action, auditLog);
            if (shouldBlock) {
              console.warn(`🚨 v20 E_AI Rule ${eaiResult.ruleId} BLOCKED learning mode seed generation`);
              throw new Error(`Learning mode blocked by E_AI rule: ${eaiResult.reason}`);
            }
          }
          
          // Check TD-Matrix block
          if (seedTD.shouldBlock) {
            console.warn(`🚨 v20 TD-Matrix BLOCKED learning mode seed: ${seedTD.reason}`);
            throw new Error(`Learning mode blocked by TD-Matrix: ${seedTD.reason}`);
          }
          
          console.log('✅ v20 Validation passed for learning mode seed');
          
          // Sla seed op in database (met embedding via server)
          await addAdvancedSeed(newSeed);
          console.log('💾 Seed opgeslagen in database');
          
          // Log learning event
          await supabase.rpc('log_reflection_event', {
            p_trigger_type: 'no_match_learning',
            p_context: {
              userInput,
              knowledgeBaseSize: knowledgeStats.total,
              generatedEmotion: newSeed.emotion,
              seedType: newSeed.type,
              severity
            },
            p_new_seeds_generated: 1,
            p_learning_impact: 0.8
          });
          
          const processingTime = Date.now() - startTime;
          
          // Update stats (learning success!)
          setStats(prev => {
            const newTotalRequests = prev.totalRequests + 1;
            const newSuccessfulMatches = prev.successfulKnowledgeMatches + 1;
            return {
              totalRequests: newTotalRequests,
              averageProcessingTime: (prev.averageProcessingTime * prev.totalRequests + processingTime) / newTotalRequests,
              successRate: ((prev.successRate * prev.totalRequests + 100) / newTotalRequests),
              lastProcessingTime: processingTime,
              errorCount: prev.errorCount,
              lastError: undefined,
              successfulKnowledgeMatches: newSuccessfulMatches,
              neurosymbolicRate: (newSuccessfulMatches / newTotalRequests) * 100
            };
          });
          
          // Gebruik nieuwe seed direct voor response
          return {
            content: newSeed.response.nl,
            emotion: newSeed.emotion,
            confidence: 0.75, // Medium confidence voor nieuwe seed
            label: newSeed.label,
            reasoning: `🎓 LEARNING MODE: Nieuwe seed gegenereerd en direct gebruikt`,
            symbolicInferences: [
              `🎓 LEARNING MODE ACTIVATED`,
              `📊 Knowledge Base: ${knowledgeStats.total} items (geen match)`,
              `🆕 Nieuwe seed gegenereerd: ${newSeed.emotion}`,
              `💾 Seed opgeslagen voor toekomstig gebruik`,
              `🎯 Severity: ${severity}`,
              `📈 Learning impact: 0.8`
            ],
            metadata: {
              processingPath: 'hybrid', // Hybrid = learning + generation
              totalProcessingTime: processingTime,
              componentsUsed: [
                '🎓 Learning Mode',
                'Enhanced Seed Generator',
                'Unified Knowledge (write)',
                'Edge Functions'
              ],
              fallback: false,
              apiCollaboration: {
                api1Used: true, // OpenAI voor seed generatie
                api2Used: false,
                vectorApiUsed: true, // Embedding via server
                googleApiUsed: false,
                seedGenerated: true, // ✅ Nieuwe seed gegenereerd!
                secondaryAnalysis: false
              }
            }
          } as UnifiedResponse;
          
        } catch (learningError) {
          console.error('🔴 Learning Mode mislukt:', learningError);
          
          // Als learning ook faalt, dan pas echt error
          throw new Error(
            learningError instanceof Error
              ? `Learning Mode error: ${learningError.message}`
              : 'Geen match én learning mislukt - mogelijk API issue'
          );
        }
      }

      const processingTime = Date.now() - startTime;
      console.log(`✅ Processing completed in ${processingTime}ms`);

      // Store confidence for next iteration
      setLastConfidence(decisionResult.confidence);

      // Update success stats (neurosymbolic match!)
      setStats(prev => {
        const newTotalRequests = prev.totalRequests + 1;
        const newSuccessfulMatches = prev.successfulKnowledgeMatches + 1;
        return {
          totalRequests: newTotalRequests,
          averageProcessingTime: (prev.averageProcessingTime * prev.totalRequests + processingTime) / newTotalRequests,
          successRate: ((prev.successRate * prev.totalRequests + 100) / newTotalRequests),
          lastProcessingTime: processingTime,
          errorCount: prev.errorCount,
          lastError: undefined,
          successfulKnowledgeMatches: newSuccessfulMatches,
          neurosymbolicRate: (newSuccessfulMatches / newTotalRequests) * 100
        };
      });

      return {
        content: decisionResult.response,
        emotion: decisionResult.emotion,
        confidence: decisionResult.confidence,
        label: decisionResult.label,
        reasoning: decisionResult.reasoning,
        symbolicInferences: [
          ...decisionResult.symbolicInferences,
          ...(briefing ? [`🎯 Strategic Briefing: ${briefing.goal}`] : []),
          `📊 Rubrics Risk: ${rubricResult.overallRisk}%`,
          `🛡️ Rubrics Protection: ${rubricResult.overallProtective}%`,
          `🎭 Dominant Pattern: ${rubricResult.dominantPattern}`
        ],
        metadata: {
          processingPath: 'hybrid',
          totalProcessingTime: processingTime,
              componentsUsed: [
                `🧠 Neurosymbolisch v3.0`,
                `Unified Core (${decisionResult.sources.length} sources)`,
                `Knowledge Base: ${knowledgeStats.total} items`,
                `Browser ML Engine (WebGPU/WASM)`,
                ...(briefing ? ['🎯 Strategic Briefing (conditional)'] : []),
                `📊 Rubrics Assessment (EvAI 5.6)`,
                'Edge Functions'
              ],
              fallback: false,
              apiCollaboration: {
                api1Used: !!apiKey,
                api2Used: !!briefing,
                vectorApiUsed: !!vectorApiKey && validateApiKey(vectorApiKey),
                googleApiUsed: false,
                seedGenerated: false,
                secondaryAnalysis: !!briefing
              }
        }
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('🔴 Production orchestration error:', error);
      console.error('   Processing time before error:', processingTime + 'ms');
      console.error('   Error type:', error instanceof Error ? error.constructor.name : typeof error);

      // Log error naar database
      try {
        await supabase.rpc('log_evai_workflow', {
          p_conversation_id: sessionStorage.getItem('evai-current-session-id') || 'unknown',
          p_workflow_type: 'orchestrate-error',
          p_api_collaboration: {
            api1Used: false,
            api2Used: false,
            vectorApiUsed: false,
            seedGenerated: false,
            secondaryAnalysis: false
          },
          p_rubrics_data: null,
          p_processing_time: processingTime,
          p_success: false,
          p_error_details: {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
          }
        });
      } catch (logError) {
        console.error('Failed to log error to database:', logError);
      }

      // Update error stats
      setStats(prev => {
        const newTotalRequests = prev.totalRequests + 1;
        return {
          totalRequests: newTotalRequests,
          averageProcessingTime: (prev.averageProcessingTime * prev.totalRequests + processingTime) / newTotalRequests,
          successRate: ((prev.successRate * prev.totalRequests + 0) / newTotalRequests),
          lastProcessingTime: processingTime,
          errorCount: prev.errorCount + 1,
          lastError: errorMessage,
          successfulKnowledgeMatches: prev.successfulKnowledgeMatches,
          neurosymbolicRate: (prev.successfulKnowledgeMatches / newTotalRequests) * 100
        };
      });

      // Enhanced error handling for production
      if (errorMessage.includes('API key') || errorMessage.includes('401')) {
        throw new Error('API key probleem gedetecteerd. Controleer je OpenAI API key in de instellingen en zorg dat het een echte (geen mock) key is.');
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        throw new Error('API limiet bereikt. Probeer het over een paar minuten opnieuw.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        throw new Error('Netwerkfout. Controleer je internetverbinding en probeer opnieuw.');
      } else {
        throw new Error(`Er ging iets mis tijdens de verwerking: ${errorMessage}`);
      }
    }
  }, [makeUnifiedDecision, knowledgeStats]);

  return {
    orchestrateProcessing,
    isProcessing,
    stats,
    knowledgeStats
  };
}

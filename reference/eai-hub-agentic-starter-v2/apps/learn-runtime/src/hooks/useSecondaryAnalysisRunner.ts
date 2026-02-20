import { createStrategicBriefing, StrategicBriefing } from './useOpenAISecondary';
import { EnhancedRubricResult } from './useEnhancedEvAI56Rubrics';

/**
 * Conditional Strategic Analysis Runner
 * Only triggers briefing generation when therapeutically necessary
 */
export async function runConditionalSecondaryAnalysis(
  userInput: string,
  conversationHistory: any[],
  rubricResult: EnhancedRubricResult | null,
  lastConfidence?: number
): Promise<StrategicBriefing | undefined> {
  
  console.log('🔍 Evaluating need for Strategic Briefing...');

  // 🎯 Input complexity analysis
  const inputLength = userInput.trim().length;
  const isSimpleGreeting = /^(hi|hallo|hey|hoi|dag|hello|yo|hé|hee|sup|hiya|ok|oké|ja|nee|hmm)[\s!?.]*$/i.test(userInput.trim());
  const isComplex = inputLength > 20 && !isSimpleGreeting;

  // CONDITION 1: High risk score (requires strategic direction)
  const highRisk = (rubricResult?.overallRisk || 0) > 70;
  
  // CONDITION 2: High distress (requires careful handling)
  const highDistress = (rubricResult?.overallRisk || 0) > 80;
  
  // CONDITION 3: Early conversation WITH complex content (establish strategy)
  // 🆕 FIX: Don't trigger briefing for simple greetings, even if early
  const earlyConversationComplex = conversationHistory.length < 3 && isComplex;
  
  // CONDITION 4: Low confidence (previous response uncertain)
  const lowConfidence = (lastConfidence || 1.0) < 0.60;

  const shouldCreateBriefing = highRisk || highDistress || earlyConversationComplex || lowConfidence;

  if (!shouldCreateBriefing) {
    console.log('⏭️ Skipping briefing - conditions not met:', {
      risk: rubricResult?.overallRisk,
      historyLength: conversationHistory.length,
      lastConfidence,
      inputLength,
      isSimpleGreeting,
      isComplex
    });
    return undefined;
  }

  console.log('✅ Briefing needed:', {
    highRisk,
    highDistress,
    earlyConversationComplex,
    lowConfidence,
    riskScore: rubricResult?.overallRisk,
    inputComplexity: isComplex ? 'complex' : 'simple'
  });

  try {
    const briefing = await createStrategicBriefing(
      userInput,
      rubricResult ? {
        overallRisk: rubricResult.overallRisk,
        overallProtective: rubricResult.overallProtective,
        dominantPattern: rubricResult.dominantPattern,
        assessments: rubricResult.assessments
      } : undefined,
      conversationHistory
    );

    return briefing;
  } catch (error) {
    console.error('🔴 Conditional briefing failed:', error);
    return undefined; // Fail gracefully - continue without briefing
  }
}

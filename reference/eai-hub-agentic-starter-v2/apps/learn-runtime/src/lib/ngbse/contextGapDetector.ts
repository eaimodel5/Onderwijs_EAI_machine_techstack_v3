import type { ContextGap, BlindspotSeverity } from '@/types/ngbse';

/**
 * Identifies missing critical context before AI provides solutions
 */
export function detectContextGaps(
  userInput: string,
  aiResponse: string,
  conversationHistory: any[]
): ContextGap[] {
  const gaps: ContextGap[] = [];
  const historyText = conversationHistory.map(h => h.content).join(' ').toLowerCase();
  const userInputLower = userInput.toLowerCase();
  const aiResponseLower = aiResponse.toLowerCase();

  // Gap 1: Timeline not explored
  const hasSuggestion = /(probeer|zou je kunnen|misschien helpt)/i.test(aiResponse);
  const hasTimelineQuestion = /(wanneer|hoe lang|sinds wanneer)/i.test(historyText);
  const userMentionsTime = /(vandaag|gisteren|week|maand|jaar|altijd|vaak)/i.test(userInputLower);

  if (hasSuggestion && !hasTimelineQuestion && !userMentionsTime) {
    gaps.push({
      type: 'timeline',
      description: 'Duur/timing van het probleem is niet geëxploreerd',
      severity: 'medium' as BlindspotSeverity,
    });
  }

  // Gap 2: Root cause not explored
  const hasSolution = /(daarom|probeer|zou je kunnen)/i.test(aiResponse);
  const hasCauseQuestion = /(waarom|waardoor|wat veroorzaakt|wat is de oorzaak)/i.test(historyText);

  if (hasSolution && !hasCauseQuestion && conversationHistory.length < 3) {
    gaps.push({
      type: 'root_cause',
      description: 'Onderliggende oorzaak niet geëxploreerd voordat oplossing wordt gegeven',
      severity: 'high' as BlindspotSeverity,
    });
  }

  // Gap 3: Previous attempts not asked
  const givesSuggestion = /(probeer|zou je kunnen)/i.test(aiResponse);
  const askedPreviousAttempts = /(al geprobeerd|eerder gedaan|al eens)/i.test(historyText);

  if (givesSuggestion && !askedPreviousAttempts) {
    gaps.push({
      type: 'previous_attempts',
      description: 'Niet gevraagd wat gebruiker al heeft geprobeerd',
      severity: 'medium' as BlindspotSeverity,
    });
  }

  // Gap 4: Support system not explored
  const userMentionsCrisis = /(alleen|niemand|geen steun|eenzaam)/i.test(userInputLower);
  const askedSupport = /(hulp van|steun van|praat je met|iemand die)/i.test(historyText);

  if (userMentionsCrisis && !askedSupport) {
    gaps.push({
      type: 'support_system',
      description: 'Geen informatie over support systeem (familie/vrienden/professionals)',
      severity: 'high' as BlindspotSeverity,
    });
  }

  // Gap 5: Safety not assessed for crisis language
  const crisisKeywords = ['pijn doen', 'niet meer willen', 'geen zin meer', 'dood'];
  const userHasCrisisLanguage = crisisKeywords.some(kw => userInputLower.includes(kw));
  const askedSafety = /(veilig|veiligheid|in gevaar|jezelf pijn)/i.test(historyText);

  if (userHasCrisisLanguage && !askedSafety) {
    gaps.push({
      type: 'safety_assessment',
      description: 'Crisis-taal gedetecteerd maar veiligheid niet geassessed',
      severity: 'critical' as BlindspotSeverity,
    });
  }

  return gaps;
}

/**
 * Determines if AI should ask more questions before providing solutions
 */
export function shouldAskMoreQuestions(
  gaps: ContextGap[],
  conversationLength: number
): boolean {
  // Always ask more if critical gaps exist
  if (gaps.some(g => g.severity === 'critical')) {
    return true;
  }

  // Ask more if multiple high-severity gaps in short conversation
  const highSeverityGaps = gaps.filter(g => g.severity === 'high');
  if (highSeverityGaps.length >= 2 && conversationLength < 4) {
    return true;
  }

  return false;
}

import type { Blindspot, BlindspotSeverity } from '@/types/ngbse';

/**
 * Detects implicit assumptions in AI responses
 */
export function detectAssumptions(
  userInput: string,
  aiResponse: string,
  emotion: string
): Blindspot[] {
  const blindspots: Blindspot[] = [];

  // Pattern 1: Assumed emotion without confirmation
  const emotionAssumptionPatterns = [
    /het klinkt alsof je (.*?) voelt/i,
    /je lijkt (.*?) te zijn/i,
    /waarschijnlijk voel je (.*)/i,
    /misschien ben je (.*)/i,
  ];

  for (const pattern of emotionAssumptionPatterns) {
    if (pattern.test(aiResponse) && !userInput.toLowerCase().includes(emotion.toLowerCase())) {
      blindspots.push({
        type: 'assumption',
        severity: 'medium',
        description: `AI neemt emotie "${emotion}" aan zonder expliciete bevestiging van gebruiker`,
        confidence: 0.75,
        recommendation: 'Vraag eerst: "Klopt het dat je je [emotie] voelt?" voordat je verder gaat',
      });
      break;
    }
  }

  // Pattern 2: Universal statements without nuance
  const universalPatterns = [
    /iedereen (voelt|heeft|doet)/i,
    /altijd (.*?) belangrijk/i,
    /nooit (.*?) goed/i,
    /mensen (.*?) meestal/i,
  ];

  for (const pattern of universalPatterns) {
    if (pattern.test(aiResponse)) {
      blindspots.push({
        type: 'assumption',
        severity: 'low',
        description: 'AI gebruikt universele statements die niet voor iedereen gelden',
        confidence: 0.65,
        recommendation: 'Voeg nuance toe: "Voor sommige mensen..." of "In jouw situatie..."',
      });
      break;
    }
  }

  // Pattern 3: Suggestions without exploring context
  const hasQuestions = /\?/.test(userInput);
  const hasSuggestions = /(probeer|zou je kunnen|misschien helpt het)/i.test(aiResponse);
  const userWordCount = userInput.split(/\s+/).length;

  if (hasSuggestions && userWordCount < 15 && !hasQuestions) {
    blindspots.push({
      type: 'assumption',
      severity: 'high',
      description: 'AI geeft suggesties zonder voldoende context te hebben verzameld',
      confidence: 0.80,
      recommendation: 'Stel eerst verdiepende vragen voordat je suggesties geeft',
    });
  }

  // Pattern 4: Assuming causal relationships
  const causalPatterns = [
    /daarom (voel|ben) je/i,
    /dat is de reden dat/i,
    /dit komt omdat/i,
  ];

  for (const pattern of causalPatterns) {
    if (pattern.test(aiResponse)) {
      blindspots.push({
        type: 'assumption',
        severity: 'medium',
        description: 'AI neemt causale relatie aan zonder dit te verifiëren',
        confidence: 0.70,
        recommendation: 'Vraag: "Denk je dat dit er mee te maken heeft?" in plaats van te assumeren',
      });
      break;
    }
  }

  return blindspots;
}

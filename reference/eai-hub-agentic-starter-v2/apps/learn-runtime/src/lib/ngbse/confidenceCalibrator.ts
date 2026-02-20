import type { ConfidenceAdjustment } from '@/types/ngbse';

interface CalibrationContext {
  originalConfidence: number;
  seedMatchCount: number;
  rubricScores?: Record<string, number>;
  emotion: string;
  conversationLength: number;
}

/**
 * Adjusts confidence based on various uncertainty factors
 */
export function calibrateConfidence(context: CalibrationContext): ConfidenceAdjustment {
  let adjusted = context.originalConfidence;
  const factors: string[] = [];
  let reasoning = '';

  // Factor 1: Novel situation (first occurrence of emotion in conversation)
  if (context.conversationLength <= 1) {
    adjusted *= 0.85;
    factors.push('novel_situation');
    reasoning += 'Eerste conversatie-bericht - beperkte context. ';
  }

  // Factor 2: Low knowledge base matches
  if (context.seedMatchCount < 2) {
    adjusted *= 0.80;
    factors.push('low_kb_matches');
    reasoning += `Slechts ${context.seedMatchCount} kennisbasis match(es) gevonden. `;
  }

  // Factor 3: Conflicting rubric scores (high variance)
  if (context.rubricScores) {
    const scores = Object.values(context.rubricScores);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    if (variance > 0.15) {
      adjusted *= 0.90;
      factors.push('rubric_conflict');
      reasoning += `Hoge spreiding in rubric scores (variance: ${variance.toFixed(2)}). `;
    }
  }

  // Factor 4: Overconfidence detection (very high original confidence with few matches)
  if (context.originalConfidence > 0.85 && context.seedMatchCount < 3) {
    adjusted *= 0.75;
    factors.push('overconfidence');
    reasoning += 'Mogelijk overconfident - hoge score met beperkte matches. ';
  }

  // Never go below 0.1 or above 0.95
  adjusted = Math.max(0.1, Math.min(0.95, adjusted));

  return {
    original: context.originalConfidence,
    adjusted,
    reasoning: reasoning.trim() || 'Geen aanpassingen nodig',
    factors,
  };
}

/**
 * Detects if this is a novel situation requiring extra caution
 */
export function isNovelSituation(
  emotion: string,
  userInput: string,
  conversationHistory: any[]
): boolean {
  // Check if emotion is rare or unknown
  const commonEmotions = [
    'angst', 'verdriet', 'woede', 'stress', 'eenzaamheid', 
    'blijdschap', 'trots', 'vreugde'
  ];

  if (!commonEmotions.includes(emotion.toLowerCase())) {
    return true;
  }

  // Check if input contains novel crisis keywords not in history
  const crisisKeywords = ['suïcide', 'zelfmoord', 'dood', 'pijn doen', 'overdosis'];
  const inputLower = userInput.toLowerCase();
  const historyText = conversationHistory.map(h => h.content).join(' ').toLowerCase();

  for (const keyword of crisisKeywords) {
    if (inputLower.includes(keyword) && !historyText.includes(keyword)) {
      return true; // Novel crisis situation
    }
  }

  // Check if conversation length is very short for complex topic
  const complexWords = ['trauma', 'misbruik', 'verslaving', 'psychose'];
  const hasComplexTopic = complexWords.some(word => inputLower.includes(word));
  
  if (hasComplexTopic && conversationHistory.length < 3) {
    return true;
  }

  return false;
}

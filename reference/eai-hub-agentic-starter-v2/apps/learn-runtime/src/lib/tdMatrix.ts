// TD-Matrix - Monitors AI dominance vs human agency
// TD > 0.8 = agency loss (ethical failsafe)

import type { TDScore } from '@/types/eaa';

/**
 * Calculates Taakdichtheid (Task Density) score
 * Measures AI contribution vs user agency
 */
export function evaluateTD(
  aiContribution: number,    // 0-1: How much AI is doing
  userAgency: number         // 0-1: How much user can do themselves
): TDScore {
  // TD = AI_contribution / (AI_contribution + user_agency)
  // When AI does everything and user can do nothing: TD = 1
  // When AI does little and user has high agency: TD = 0
  
  const denominator = aiContribution + userAgency;
  const value = denominator > 0 ? aiContribution / denominator : 0.5;
  
  // Determine flag based on thresholds
  let flag: TDScore['flag'];
  let shouldBlock = false;
  let reason: string | undefined;
  
  if (value <= 0.6) {
    flag = '🟢 TD_balanced';
    reason = 'Gezonde balans tussen AI en menselijke agency';
  } else if (value <= 0.8) {
    flag = '🟠 AI_dominance';
    reason = 'AI neemt veel taken over, monitor agency';
  } else {
    flag = '🚨 Agency_loss';
    shouldBlock = true;
    reason = 'Kritiek agencyverlies - actie geblokkeerd';
  }
  
  return {
    value,
    flag,
    shouldBlock,
    reason
  };
}

/**
 * Estimates AI contribution from response characteristics
 */
export function estimateAIContribution(response: string): number {
  let contribution = 0.3; // baseline
  
  const lower = response.toLowerCase();
  
  // Suggestive language increases AI contribution
  if (/(probeer|doe|ga|start|begin)/.test(lower)) contribution += 0.3;
  if (/(zou kunnen|misschien|overweeg)/.test(lower)) contribution += 0.2;
  if (/(moet|moeten|zou moeten)/.test(lower)) contribution += 0.4;
  
  // Directive language significantly increases contribution
  if (/(volgende stappen|actieplan|strategie)/.test(lower)) contribution += 0.3;
  
  // Reflective language decreases AI contribution
  if (/(wat denk jij|hoe voel je|herken je)/.test(lower)) contribution -= 0.2;
  if (/(vertel|leg uit|beschrijf)/.test(lower)) contribution -= 0.1;
  
  // Length-based adjustment
  const wordCount = response.split(/\s+/).length;
  if (wordCount > 100) contribution += 0.1; // Long responses = more AI doing
  if (wordCount < 30) contribution -= 0.1;  // Short responses = less AI doing
  
  return Math.max(0, Math.min(1, contribution));
}

/**
 * TD-Matrix thresholds configuration
 */
export const TD_THRESHOLDS = {
  balanced: { min: 0.0, max: 0.6, flag: '🟢 TD_balanced' },
  dominant: { min: 0.61, max: 0.8, flag: '🟠 AI_dominance' },
  critical: { min: 0.81, max: 1.0, flag: '🚨 Agency_loss' }
} as const;

/**
 * Validates if response should be blocked based on TD score
 */
export function shouldBlockOnTD(
  tdScore: TDScore,
  userAgency: number
): { block: boolean; reason: string } {
  if (tdScore.shouldBlock) {
    return {
      block: true,
      reason: 'TD > 0.8: Kritiek agencyverlies gedetecteerd'
    };
  }
  
  if (tdScore.value > 0.7 && userAgency < 0.3) {
    return {
      block: true,
      reason: 'Hoge TD + lage agency: risico op overmatige AI-sturing'
    };
  }
  
  return { block: false, reason: 'TD binnen acceptabele grenzen' };
}

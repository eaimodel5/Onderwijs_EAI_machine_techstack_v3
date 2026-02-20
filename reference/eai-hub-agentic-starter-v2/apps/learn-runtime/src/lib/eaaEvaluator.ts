// EAA Evaluator - Evaluates Ownership, Autonomy, Agency
// Based on v18 EAA framework + v20 rubrics integration

import type { EAAProfile } from '@/types/eaa';

interface RubricContext {
  riskScore?: number;
  protectiveScore?: number;
  dominantPattern?: string;
}

/**
 * Evaluates EAA profile from text content
 * Returns ownership, autonomy, agency scores (0-1)
 */
export function evaluateEAA(
  text: string,
  rubricContext?: RubricContext
): EAAProfile {
  const lower = text.toLowerCase();
  
  // Ownership - "Is dit van mij?"
  let ownership = 0.3; // baseline
  if (/(ik|mijn|me|mezelf)/.test(lower)) ownership += 0.3;
  if (/(voel|denk|merk)/.test(lower)) ownership += 0.2;
  if (/(altijd|nooit|steeds)/.test(lower)) ownership += 0.1;
  
  // Autonomy - "Mag ik hier iets over vinden?"
  let autonomy = 0.4; // baseline
  if (/(kan|wil|zou|mag)/.test(lower)) autonomy += 0.3;
  if (/(misschien|wellicht|mogelijk)/.test(lower)) autonomy += 0.2;
  if (/(moet|moeten|verplicht)/.test(lower)) autonomy -= 0.2; // druk verlaagt autonomie
  
  // Agency - "Kan ik hier werkelijk iets mee?"
  let agency = 0.4; // baseline
  if (/(doe|ga|probeer|start|begin)/.test(lower)) agency += 0.4;
  if (/(help|hulp|steun|ondersteuning)/.test(lower)) agency += 0.1;
  if (/(niet|geen|nooit)/.test(lower)) agency -= 0.2;
  if (/(lukt niet|kan niet|onmogelijk)/.test(lower)) agency -= 0.3;
  
  // Rubric-based adjustments
  if (rubricContext) {
    const { riskScore = 0, protectiveScore = 0, dominantPattern } = rubricContext;
    
    // Hoge risico verlaagt agency
    if (riskScore > 0.7) {
      agency = Math.max(0.2, agency - 0.2);
      autonomy = Math.max(0.3, autonomy - 0.1);
    }
    
    // Hoge protective score verhoogt agency
    if (protectiveScore > 0.6) {
      agency = Math.min(1.0, agency + 0.2);
      autonomy = Math.min(1.0, autonomy + 0.1);
    }
    
    // Pattern-based adjustments
    if (dominantPattern === 'mood_regulation' || dominantPattern === 'anxiety_support') {
      ownership = Math.min(1.0, ownership + 0.15);
    }
  }
  
  // Clamp values to 0-1
  return {
    ownership: Math.max(0, Math.min(1, ownership)),
    autonomy: Math.max(0, Math.min(1, autonomy)),
    agency: Math.max(0, Math.min(1, agency))
  };
}

/**
 * Validates if EAA profile allows certain strategy
 */
export function validateEAAForStrategy(
  profile: EAAProfile,
  strategy: string
): { valid: boolean; reason?: string } {
  // Suggestie requires high agency
  if (strategy === 'suggestie' || strategy === 'Suggestie') {
    if (profile.agency < 0.5) {
      return { valid: false, reason: 'Agency te laag voor suggesties' };
    }
  }
  
  // Interventie requires high ownership + agency
  if (strategy === 'interventie' || strategy === 'Interventie') {
    if (profile.ownership < 0.4) {
      return { valid: false, reason: 'Ownership te laag voor interventie' };
    }
    if (profile.agency < 0.6) {
      return { valid: false, reason: 'Agency te laag voor interventie' };
    }
  }
  
  // Reflectie is always allowed
  if (strategy === 'reflectie' || strategy === 'Reflectievraag') {
    return { valid: true };
  }
  
  // Default: check baseline thresholds
  if (profile.ownership < 0.3 || profile.agency < 0.3) {
    return { valid: false, reason: 'EAA-scores te laag, gebruik reflectie' };
  }
  
  return { valid: true };
}

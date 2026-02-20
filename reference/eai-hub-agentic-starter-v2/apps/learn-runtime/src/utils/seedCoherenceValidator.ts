/**
 * Seed Coherence Validator
 * Validates that seeds are coherent, generic, and appropriate
 */

import { AdvancedSeed } from '@/types/seed';

export interface CoherenceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Validate seed coherence comprehensively
 */
export function validateSeedCoherence(seed: AdvancedSeed): CoherenceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check 1: Response contains words not in triggers (overspecific context)
  const overspecificCheck = checkOverspecificContext(seed);
  if (overspecificCheck.errors.length > 0) {
    errors.push(...overspecificCheck.errors);
    suggestions.push('Use placeholders like {timeOfDay}, {situation}, {recentEvent}');
  }
  warnings.push(...overspecificCheck.warnings);

  // Check 2: Response length appropriate for type
  const lengthCheck = checkResponseLength(seed);
  warnings.push(...lengthCheck.warnings);

  // Check 3: Type consistency
  const typeCheck = checkTypeConsistency(seed);
  errors.push(...typeCheck.errors);

  // Check 4: Trigger quality
  const triggerCheck = checkTriggerQuality(seed);
  warnings.push(...triggerCheck.warnings);

  // Check 5: Generic applicability
  const genericCheck = checkGenericApplicability(seed);
  warnings.push(...genericCheck.warnings);
  suggestions.push(...genericCheck.suggestions);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Check for overspecific context in response
 */
function checkOverspecificContext(seed: AdvancedSeed): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const response = seed.response.nl.toLowerCase();
  const triggers = seed.triggers.map(t => t.toLowerCase());

  // Patterns that indicate overspecific context
  const overspecificPatterns = [
    { pattern: /\b(vannacht|gisteren|eergisteren)\b/i, name: 'specific past time' },
    { pattern: /\b(na een goede nachtrust|na het slapen|na het wakker worden)\b/i, name: 'specific event assumption' },
    { pattern: /\b(deze ochtend|deze middag|deze avond|vanavond|vanmiddag|vanochtend)\b/i, name: 'specific time of day' },
    { pattern: /\b(op maandag|op dinsdag|op woensdag|op donderdag|op vrijdag|op zaterdag|op zondag)\b/i, name: 'specific day' },
    { pattern: /\b(vorige week|afgelopen week|volgende week)\b/i, name: 'specific week reference' }
  ];

  for (const { pattern, name } of overspecificPatterns) {
    const match = response.match(pattern);
    if (match) {
      const matchedText = match[0].toLowerCase();
      const isInTriggers = triggers.some(t => t.includes(matchedText));
      
      if (!isInTriggers) {
        errors.push(`Overspecific ${name}: "${match[0]}" not found in triggers`);
      }
    }
  }

  // Check for personal assumptions
  const assumptionPatterns = [
    /\b(je hebt|je bent net|je was net|je zult wel)\b/i,
    /\b(waarschijnlijk|misschien|vermoedelijk)\b.*\b(gebeurd|gedaan|geweest)\b/i
  ];

  for (const pattern of assumptionPatterns) {
    if (pattern.test(response)) {
      warnings.push('Response makes assumptions about user\'s situation');
      break;
    }
  }

  return { errors, warnings };
}

/**
 * Check response length is appropriate for type
 */
function checkResponseLength(seed: AdvancedSeed): { warnings: string[] } {
  const warnings: string[] = [];
  const length = seed.response.nl.length;

  const lengthGuidelines = {
    validation: { min: 30, max: 150 },
    reflection: { min: 40, max: 200 },
    suggestion: { min: 50, max: 250 },
    intervention: { min: 60, max: 300 }
  };

  const guidelines = lengthGuidelines[seed.type];
  if (!guidelines) return { warnings };

  if (length < guidelines.min) {
    warnings.push(`Response too short for ${seed.type} (${length} chars, min ${guidelines.min})`);
  } else if (length > guidelines.max) {
    warnings.push(`Response too long for ${seed.type} (${length} chars, max ${guidelines.max})`);
  }

  return { warnings };
}

/**
 * Check type consistency
 */
function checkTypeConsistency(seed: AdvancedSeed): { errors: string[] } {
  const errors: string[] = [];
  const response = seed.response.nl.toLowerCase();

  const typeIndicators = {
    validation: [/\b(begrijp|normaal|oké|acceptabel|helemaal goed)\b/i],
    reflection: [/\b(wat|hoe|waarom|zou|denk je|vraag)\b/i, /\?$/],
    suggestion: [/\b(probeer|zou kunnen|misschien|advies|tip|overweeg)\b/i],
    intervention: [/\b(belangrijk dat|moet|noodzakelijk|direct|onmiddellijk|nu)\b/i]
  };

  const indicators = typeIndicators[seed.type];
  if (indicators && !indicators.some(pattern => pattern.test(response))) {
    errors.push(`Response doesn't match ${seed.type} type indicators`);
  }

  return { errors };
}

/**
 * Check trigger quality
 */
function checkTriggerQuality(seed: AdvancedSeed): { warnings: string[] } {
  const warnings: string[] = [];

  if (seed.triggers.length < 2) {
    warnings.push('Too few triggers (recommend 3-5 for better matching)');
  }

  if (seed.triggers.length > 7) {
    warnings.push('Too many triggers (recommend 3-5 for focus)');
  }

  // Check for overly generic triggers
  const genericTriggers = ['ik', 'me', 'mijn', 'gevoel', 'emotie'];
  const hasOnlyGeneric = seed.triggers.every(t => 
    genericTriggers.some(g => t.toLowerCase().includes(g))
  );

  if (hasOnlyGeneric) {
    warnings.push('Triggers are too generic, need more specific emotional keywords');
  }

  return { warnings };
}

/**
 * Check generic applicability
 */
function checkGenericApplicability(seed: AdvancedSeed): { warnings: string[]; suggestions: string[] } {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const response = seed.response.nl;

  // Check for hardcoded names or personal details
  if (/\b[A-Z][a-z]+\b/.test(response) && !/\b(Het|Wat|Hoe|Waarom|Kun|Zou)\b/.test(response)) {
    warnings.push('Response may contain specific names or proper nouns');
  }

  // Check for conversational pronouns suggesting prior context
  if (/\b(zoals je zei|je vertelde|je noemde)\b/i.test(response)) {
    warnings.push('Response references prior conversation that may not exist');
    suggestions.push('Make response self-contained and context-independent');
  }

  // Suggest template parameters
  const contextWords = ['ochtend', 'middag', 'avond', 'nacht', 'werk', 'thuis', 'school'];
  const hasContext = contextWords.some(word => response.toLowerCase().includes(word));
  
  if (hasContext && !/\{.*\}/.test(response)) {
    suggestions.push('Consider using template parameters: {timeOfDay}, {situation}');
  }

  return { warnings, suggestions };
}
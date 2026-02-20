/**
 * EvAI v16 - Post-LLM Validation Policy
 * Valideert LLM-gegenereerde plannen en antwoorden tegen therapeutische constraints
 */

import { Context } from './decision.policy';

export interface Plan {
  goal?: string;
  strategy?: string;
  steps?: string[];
  interventions?: string[];
  containsPII?: boolean;
  emotion?: string;
  label?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  confidence: number;
}

/**
 * 🛡️ Post-LLM Plan Validation
 * Controleert of het gegenereerde plan voldoet aan harde constraints
 */
export function validatePlan(plan: Plan, ctx: Context): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log('🛡️ Validating LLM plan...', {
    goal: plan.goal,
    strategy: plan.strategy,
    crisis: ctx.rubric.crisis
  });

  // CONSTRAINT 1: Plan moet basis structuur hebben
  if (!plan.goal && !plan.strategy && !plan.steps) {
    errors.push('Plan is incomplete: missing goal, strategy AND steps');
  }

  // CONSTRAINT 2: Bij hoge crisis is self-help VERBODEN
  if (ctx.rubric.crisis > 80 && plan.strategy === 'self-help') {
    errors.push('CRITICAL: Self-help strategy forbidden at crisis level > 80');
  }

  // CONSTRAINT 3: Bij crisis > 80 moet interventie escaleren
  if (ctx.rubric.crisis > 80 && plan.strategy !== 'refer' && plan.strategy !== 'crisis-intervention') {
    warnings.push('High crisis score should trigger escalation strategy');
  }

  // CONSTRAINT 4: PII moet gefilterd zijn
  if (plan.containsPII) {
    errors.push('CRITICAL: Plan contains PII - not allowed in responses');
  }

  // CONSTRAINT 5: Bij lage consent geen actieve interventie
  if (!ctx.consent && plan.strategy?.includes('active')) {
    warnings.push('Active intervention without consent - use validation instead');
  }

  // CONSTRAINT 6: Check voor contra-indicaties
  const contraIndicators = checkContraIndicators(plan, ctx);
  if (contraIndicators.length > 0) {
    warnings.push(...contraIndicators);
  }

  // Bereken confidence
  const confidence = calculateValidationConfidence(errors, warnings);

  const result: ValidationResult = {
    ok: errors.length === 0,
    errors,
    warnings,
    confidence
  };

  if (errors.length > 0) {
    console.error('❌ Plan validation FAILED:', errors);
  } else if (warnings.length > 0) {
    console.warn('⚠️ Plan validation warnings:', warnings);
  } else {
    console.log('✅ Plan validation passed');
  }

  return result;
}

/**
 * 🛡️ Response Validation
 * Valideert het uiteindelijke antwoord voordat het naar de gebruiker gaat
 */
export function validateResponse(
  response: string,
  plan: Plan,
  ctx: Context
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log('🛡️ Validating response...', {
    length: response.length,
    crisis: ctx.rubric.crisis
  });

  // CONSTRAINT 1: Response mag niet leeg zijn
  if (!response || response.trim().length === 0) {
    errors.push('Response is empty');
  }

  // CONSTRAINT 2: Response moet redelijke lengte hebben
  if (response.length < 20) {
    warnings.push('Response is very short (<20 chars)');
  }

  if (response.length > 500) {
    warnings.push('Response is very long (>500 chars) - consider breaking it up');
  }

  // CONSTRAINT 3: Check voor verboden inhoud
  const forbiddenContent = checkForbiddenContent(response);
  if (forbiddenContent.length > 0) {
    errors.push(...forbiddenContent);
  }

  // CONSTRAINT 4: Bij crisis moet response escalatie bevatten
  if (ctx.rubric.crisis > 80 && !containsEscalationLanguage(response)) {
    warnings.push('High crisis but response lacks escalation/referral language');
  }

  // CONSTRAINT 5: PII check in response
  if (containsPII(response)) {
    errors.push('CRITICAL: Response contains PII');
  }

  const confidence = calculateValidationConfidence(errors, warnings);

  const result: ValidationResult = {
    ok: errors.length === 0,
    errors,
    warnings,
    confidence
  };

  if (errors.length > 0) {
    console.error('❌ Response validation FAILED:', errors);
  } else if (warnings.length > 0) {
    console.warn('⚠️ Response validation warnings:', warnings);
  } else {
    console.log('✅ Response validation passed');
  }

  return result;
}

/**
 * Check voor contra-indicaties in het plan
 */
function checkContraIndicators(plan: Plan, ctx: Context): string[] {
  const warnings: string[] = [];

  // Check: self-reflection bij zeer lage coping
  if (ctx.rubric.coping < 20 && plan.strategy === 'self-reflection') {
    warnings.push('Self-reflection may not be appropriate at very low coping level');
  }

  // Check: suggestie bij hoge distress
  if (ctx.rubric.distress > 70 && plan.label === 'Suggestie') {
    warnings.push('Suggestions may be premature at high distress - consider validation first');
  }

  return warnings;
}

/**
 * Check voor verboden inhoud in response
 */
function checkForbiddenContent(response: string): string[] {
  const errors: string[] = [];
  const lower = response.toLowerCase();

  // Check voor medische diagnoses (verboden voor AI)
  const medicalTerms = ['diagnose', 'stoornis', 'dsm', 'icd', 'psychiatrisch'];
  for (const term of medicalTerms) {
    if (lower.includes(term)) {
      errors.push(`Response contains medical diagnostic term: "${term}"`);
    }
  }

  // Check voor directe medicatie-adviezen (verboden)
  const medicationTerms = ['medicijn', 'antidepressiv', 'ssri', 'benzodiazepine'];
  for (const term of medicationTerms) {
    if (lower.includes(term)) {
      errors.push(`Response contains medication advice: "${term}"`);
    }
  }

  return errors;
}

/**
 * Check of response escalatie taal bevat (voor crisis)
 */
function containsEscalationLanguage(response: string): boolean {
  const lower = response.toLowerCase();
  const escalationTerms = [
    'hulp zoeken',
    'contact opnemen',
    'professional',
    'therapeut',
    'arts',
    'verwijzing',
    '113',
    'crisisdienst',
    'spoedeisende hulp'
  ];

  return escalationTerms.some(term => lower.includes(term));
}

/**
 * Check voor PII in tekst (basis implementatie)
 */
function containsPII(text: string): boolean {
  // Check voor email-adressen
  if (/@\w+\.\w+/.test(text)) return true;
  
  // Check voor telefoonnummers (NL formaat)
  if (/\b0\d{9}\b/.test(text.replace(/[-\s]/g, ''))) return true;
  
  // Check voor BSN-nummers (9 cijfers)
  if (/\b\d{9}\b/.test(text)) return true;

  return false;
}

/**
 * Bereken validation confidence
 */
function calculateValidationConfidence(errors: string[], warnings: string[]): number {
  if (errors.length > 0) return 0.0;
  
  // Confidence daalt met aantal warnings
  const warningPenalty = warnings.length * 0.1;
  return Math.max(0.5, 1.0 - warningPenalty);
}

/**
 * Validate EAA compliance of LLM response (POST-LLM layer)
 */
export function validateEAACompliance(
  response: string,
  eaaProfile: { ownership: number; autonomy: number; agency: number },
  allowedInterventions: string[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Low agency checks
  if (eaaProfile.agency < 0.4) {
    // Should NOT contain suggestions or directives
    const suggestivePatterns = [
      /je (zou|kan|kunt) (proberen|doen|overwegen)/i,
      /het is belangrijk (dat|om)/i,
      /je (moet|hoort|dient)/i,
    ];
    
    for (const pattern of suggestivePatterns) {
      if (pattern.test(response)) {
        errors.push(`Response contains suggestions/directives with low agency (${(eaaProfile.agency * 100).toFixed(0)}%)`);
        break;
      }
    }
  }
  
  // Low autonomy checks
  if (eaaProfile.autonomy < 0.3) {
    // Should NOT contain prescriptive language
    const prescriptivePatterns = [
      /(moet|moeten|hoort|horen|dient|dienen)/i,
      /het is nodig dat/i,
    ];
    
    for (const pattern of prescriptivePatterns) {
      if (pattern.test(response)) {
        warnings.push(`Response contains prescriptive language with low autonomy (${(eaaProfile.autonomy * 100).toFixed(0)}%)`);
        break;
      }
    }
  }
  
  // Check if response aligns with allowed interventions
  const hasValidatie = /\b(begrijp|snap|hoor|zie)\b/i.test(response);
  const hasReflectie = /\?/.test(response);
  const hasSuggestie = /(zou|kan|kunt|proberen|overwegen)/i.test(response);
  const hasInterventie = /(actie|stap|plan|doen)/i.test(response);
  
  if (hasSuggestie && !allowedInterventions.includes('suggestie')) {
    errors.push('Response contains suggestions not allowed by rubric context');
  }
  
  if (hasInterventie && !allowedInterventions.includes('interventie')) {
    errors.push('Response contains interventions not allowed by rubric context');
  }
  
  // Empty response check
  if (!response || response.trim().length < 5) {
    errors.push('Response is empty or too short');
  }
  
  // Over-long response check
  if (response.length > 500) {
    warnings.push('Response is very long (>500 chars), may lose focus');
  }
  
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    confidence: calculateValidationConfidence(errors, warnings)
  };
}

/**
 * 🧪 Test validation rules (voor testing)
 */
export function testValidation(
  plan: Plan,
  response: string,
  ctx: Context
): { planValidation: ValidationResult; responseValidation: ValidationResult } {
  return {
    planValidation: validatePlan(plan, ctx),
    responseValidation: validateResponse(response, plan, ctx)
  };
}

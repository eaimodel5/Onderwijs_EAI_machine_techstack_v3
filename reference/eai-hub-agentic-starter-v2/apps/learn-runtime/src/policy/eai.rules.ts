// E_AI Rules Engine - Symbolic ethical rule set
// Implements rules 001-006 from v20 specification

import type { EAIContext, EAIRule, EAIRuleResult, EAIAction } from '@/types/eaa';

/**
 * E_AI Symbolic Rules (from v20 specification)
 */
export const E_AI_RULES: EAIRule[] = [
  {
    id: 'rule_001',
    description: 'Agencyverlies bij lage autonomie en hoge taakdichtheid',
    trigger: { A: '<0.4', TD: '>0.7' },
    action: {
      type: 'seed_injection',
      seed_type: 'V_A',
      message: 'Versterk motivatie, verlaag taakbelasting'
    }
  },
  {
    id: 'rule_002',
    description: 'Biasdetectie bij ongelijkwaardige taakverdeling',
    trigger: { B: '>0.5', TD: '>0.6' },
    action: {
      type: 'alert',
      severity: 'high',
      message: 'Controleer fairness in taaktoewijzing'
    }
  },
  {
    id: 'rule_003',
    description: 'Metacognitieve reflectie bij herhaald gedragspatroon',
    trigger: { V_M: '<0.4', TD: '<0.5' },
    action: {
      type: 'reflective_prompt',
      target: 'Regisseur',
      message: 'Stimuleer reflectie op patroon'
    }
  },
  {
    id: 'rule_004',
    description: 'Verhoog agency door meer autonomie toe te staan',
    trigger: { A: '<0.5', V_A: '<0.4' },
    action: {
      type: 'context_expansion',
      message: 'Vergroot keuzeruimte voor de gebruiker'
    }
  },
  {
    id: 'rule_005',
    description: 'Compliance-check bij cumulatieve ethische afwijkingen',
    trigger: { D_Bc: '<0.3' },
    action: {
      type: 'audit_log',
      message: 'Voer audit uit, lage ethische consistentie'
    }
  },
  {
    id: 'rule_006',
    description: 'Blokkeer actie bij structureel agencyverlies',
    trigger: { A: '<0.3', TD: '>0.8' },
    action: {
      type: 'halt_output',
      message: 'Actie geblokkeerd: onvoldoende menselijke agency'
    }
  }
];

/**
 * Evaluates a single trigger condition
 */
function evaluateTrigger(
  condition: string,
  value: number | undefined
): boolean {
  if (value === undefined) return false;
  
  const match = condition.match(/([<>=]+)([\d.]+)/);
  if (!match) return false;
  
  const [, operator, thresholdStr] = match;
  const threshold = parseFloat(thresholdStr);
  
  switch (operator) {
    case '<':
      return value < threshold;
    case '>':
      return value > threshold;
    case '<=':
      return value <= threshold;
    case '>=':
      return value >= threshold;
    case '=':
    case '==':
      return Math.abs(value - threshold) < 0.01;
    default:
      return false;
  }
}

/**
 * Checks if all trigger conditions are met for a rule
 */
function checkRuleTrigger(
  rule: EAIRule,
  context: EAIContext
): boolean {
  const entries = Object.entries(rule.trigger);
  
  // All conditions must be true (AND logic)
  return entries.every(([key, condition]) => {
    const value = context[key as keyof EAIContext];
    return evaluateTrigger(condition, value);
  });
}

/**
 * Evaluates all E_AI rules against the current context
 * Returns first triggered rule (priority order)
 */
export function evaluateEAIRules(
  context: EAIContext
): EAIRuleResult {
  for (const rule of E_AI_RULES) {
    if (checkRuleTrigger(rule, context)) {
      console.log(`🔍 E_AI Rule triggered: ${rule.id} - ${rule.description}`);
      return {
        triggered: true,
        ruleId: rule.id,
        action: rule.action,
        reason: rule.description
      };
    }
  }
  
  return { triggered: false };
}

/**
 * Executes E_AI rule action
 * Returns whether the action blocks further processing
 */
export function executeEAIAction(
  action: EAIAction,
  auditLog: string[]
): boolean {
  auditLog.push(`🔍 E_AI Action: ${action.type} - ${action.message}`);
  
  switch (action.type) {
    case 'halt_output':
      auditLog.push('🚨 OUTPUT BLOCKED by E_AI rule');
      return true; // Block processing
      
    case 'alert':
      auditLog.push(`⚠️ Alert (${action.severity}): ${action.message}`);
      return false;
      
    case 'seed_injection':
      auditLog.push(`🌱 Seed injection: ${action.seed_type}`);
      return false;
      
    case 'reflective_prompt':
      auditLog.push(`💭 Reflective prompt to ${action.target}`);
      return false;
      
    case 'context_expansion':
      auditLog.push(`📈 Context expansion: ${action.message}`);
      return false;
      
    case 'audit_log':
      auditLog.push(`📋 Audit required: ${action.message}`);
      return false;
      
    default:
      return false;
  }
}

/**
 * Creates E_AI context from EAA profile and TD score
 */
export function createEAIContext(
  eaaProfile: { ownership: number; autonomy: number; agency: number },
  tdValue: number,
  rubricScores?: {
    riskScore?: number;
    protectiveScore?: number;
  }
): EAIContext {
  const { ownership, autonomy, agency } = eaaProfile;
  
  return {
    A: autonomy,                              // Autonomiecoëfficiënt
    TD: tdValue,                              // Taakdichtheid
    V: (agency + autonomy) / 2,              // Vaardigheidspotentieel
    V_M: ownership,                           // Metacognitieve vaardigheid (simplified)
    V_A: agency,                              // Motivationele vaardigheid
    D_Bc: rubricScores?.protectiveScore || 0.5, // Correctietoezicht
    B: rubricScores?.riskScore || 0          // Bias-indicator
  };
}

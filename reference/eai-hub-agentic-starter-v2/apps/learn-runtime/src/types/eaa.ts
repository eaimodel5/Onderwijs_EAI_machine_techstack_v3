// EAA Framework Type Definitions for v20

export interface EAAProfile {
  ownership: number;    // 0-1: Gebruiker voelt verbinding met onderwerp
  autonomy: number;     // 0-1: Gebruiker ervaart keuzevrijheid
  agency: number;       // 0-1: Gebruiker ervaart handelingsbekwaamheid
}

export interface ReflectiveAdvice {
  advice: string;
  reason: string;
  avgAgency: number;
  historicalContext?: string[];
}

export interface TDScore {
  value: number;        // 0-1: Taakdichtheid (AI vs menselijke agency)
  flag: '🟢 TD_balanced' | '🟠 AI_dominance' | '🚨 Agency_loss';
  shouldBlock: boolean;
  reason?: string;
}

export interface EAIContext {
  A: number;            // Autonomiecoëfficiënt
  TD: number;           // Taakdichtheid
  V: number;            // Vaardigheidspotentieel
  V_M: number;          // Metacognitieve vaardigheid
  V_A: number;          // Motivationele vaardigheid
  D_Bc: number;         // Correctietoezicht
  B?: number;           // Bias-indicator (optioneel)
}

export interface EAIRule {
  id: string;
  description: string;
  trigger: Record<string, string>;  // bijv. { "A": "<0.4", "TD": ">0.7" }
  action: EAIAction;
}

export interface EAIAction {
  type: 'seed_injection' | 'alert' | 'reflective_prompt' | 'context_expansion' | 'audit_log' | 'halt_output';
  severity?: 'low' | 'medium' | 'high';
  message: string;
  seed_type?: string;
  target?: string;
}

export interface EAIRuleResult {
  triggered: boolean;
  ruleId?: string;
  action?: EAIAction;
  reason?: string;
}

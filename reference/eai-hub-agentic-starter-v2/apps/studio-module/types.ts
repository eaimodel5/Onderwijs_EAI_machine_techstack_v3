
export interface LearnerProfile {
  name: string | null;
  subject: string | null; // Vak
  level: string | null;   // Niveau (VWO, HAVO, etc.)
  grade: string | null;   // Leerjaar
  goal?: string | null;   // Persistent Learning Goal (Context Pinning)
}

export type CognitiveMode = 'ANALYTISCH' | 'REFLECTIEF' | 'SYSTEMISCH' | 'PRAGMATISCH' | 'CREATIEF' | 'NORMATIEF' | 'ONBEKEND';
export type SRLState = 'PLAN' | 'MONITOR' | 'REFLECT' | 'ADJUST' | 'UNKNOWN';

// PHASE 4: SCAFFOLDING TYPES
export interface ScaffoldingState {
    agency_score: number; // 0-100 (100 = full student autonomy)
    trend: 'RISING' | 'STABLE' | 'FALLING';
    advice: string | null; // e.g. "INITIATE FADING"
    history_window: number[]; // Last 5 agency scores
}

export interface EAIAnalysis {
  process_phases: string[]; 
  coregulation_bands: string[]; 
  task_densities: string[]; 
  secondary_dimensions: string[]; // Still captures all, but we will parse E and T specifically in dashboard
  active_fix: string | null; 
  reasoning: string;
  current_profile: LearnerProfile;
  task_density_balance: number; // 0 (Full AI) to 100 (Full Learner)
  epistemic_status: 'FEIT' | 'INTERPRETATIE' | 'SPECULATIE' | 'ONBEKEND';
  cognitive_mode: CognitiveMode;
  srl_state: SRLState;
  scaffolding?: ScaffoldingState; // Phase 4 Addition
}

export interface RepairLog {
  timestamp: number;
  error: string;
  brokenPayload: string;
}

// PHASE 3: LOGIC GATES & SUPERVISOR TYPES
export interface LogicGateBreach {
  trigger_band: string;     // e.g., "K1"
  rule_description: string; // e.g., "MAX_TD = TD2"
  detected_value: string | null; // e.g., "TD5"
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface SupervisorLog {
    timestamp: number;
    breach: LogicGateBreach;
    original_reasoning: string;
    correction_prompt: string;
}

export interface RouterDecision {
    target_model: string;
    thinking_budget: number;
    intent_category: 'FAST' | 'MID' | 'SLOW';
    reasoning: string;
}

// PHASE 3: SEMANTIC INTEGRITY (G-FACTOR)
export interface SemanticValidation {
    gFactor: number; // 0.0 to 1.0 (1.0 = Perfect Semantic Integrity)
    penalties: string[]; // Reasons for score deduction
    alignment_status: 'OPTIMAL' | 'DRIFT' | 'CRITICAL';
}

export interface MechanicalState {
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  model: string;
  temperature: number;
  timestamp: Date;
  repairAttempts?: number; 
  repairLog?: RepairLog; // Hard Failures (JSON Syntax)
  supervisorLog?: SupervisorLog; // Phase 3: Didactic Interventions (Logic Gates)
  softValidationLog?: string[]; // Soft Failures (Auto-Healed)
  logicGateBreach?: LogicGateBreach; // Phase 1: Hardening
  routerDecision?: RouterDecision; // Phase 2: Intent Routing
  semanticValidation?: SemanticValidation; // Phase 3: The G-Factor
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
  analysis?: EAIAnalysis;
  mechanical?: MechanicalState;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  showDashboard: boolean;
  currentAnalysis: EAIAnalysis | null;
  currentMechanical: MechanicalState | null;
}

// --- DIAGNOSTIC TYPES ---
export type DiagnosticStatus = 'OK' | 'WARNING' | 'CRITICAL';

export interface DiagnosticResult {
  id: string;
  category: 'ENV' | 'SSOT' | 'LOGIC';
  label: string;
  status: DiagnosticStatus;
  message: string;
  timestamp: number;
}

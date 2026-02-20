export type BlindspotType = 'assumption' | 'missing_context' | 'overconfidence' | 'bias' | 'novel_situation';
export type BlindspotSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Blindspot {
  type: BlindspotType;
  severity: BlindspotSeverity;
  description: string;
  confidence: number;
  recommendation?: string;
  metadata?: Record<string, any>;
}

export interface NGBSEResult {
  blindspots: Blindspot[];
  adjustedConfidence: number;
  shouldTriggerHITL: boolean;
  reasoning: string[];
}

export interface BiasReport {
  detected: boolean;
  types: string[];
  severity: BlindspotSeverity;
  description: string;
  confidence: number;
}

export interface ContextGap {
  type: string;
  description: string;
  severity: BlindspotSeverity;
}

export interface ConfidenceAdjustment {
  original: number;
  adjusted: number;
  reasoning: string;
  factors: string[];
}

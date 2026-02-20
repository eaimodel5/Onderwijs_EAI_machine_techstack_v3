export type HITLTriggerType = 'crisis' | 'novel_situation' | 'low_confidence' | 'td_critical' | 'repeated_failure' | 'ngbse_blindspot';
export type HITLSeverity = 'medium' | 'high' | 'critical';
export type HITLStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'override';

export interface HITLQueueItem {
  id: string;
  created_at: string;
  user_id: string;
  user_input: string;
  ai_response: string;
  trigger_type: HITLTriggerType;
  severity: HITLSeverity;
  reason: string;
  context: Record<string, any>;
  status: HITLStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  admin_response?: string;
  conversation_id?: string;
}

export interface HITLTriggerContext {
  crisisScore?: number;
  tdValue?: number;
  confidence: number;
  emotion: string;
  rubrics?: any;
  blindspots?: any[];
  failureCount?: number;
}

export interface HITLDecision {
  shouldTrigger: boolean;
  triggerType?: HITLTriggerType;
  severity?: HITLSeverity;
  reason?: string;
  blockOutput?: boolean;
}

import { supabase } from '@/integrations/supabase/client';

export type FlowNodeName = 
  | 'Safety Check'
  | 'Rubrics Assessment'
  | 'EAA Evaluation'
  | 'Regisseur Briefing'
  | 'Policy Decision'
  | 'Semantic Graph'
  | 'TD-Matrix'
  | 'E_AI Rules'
  | 'NGBSE Check'
  | 'HITL Check'
  | 'Response Generation'
  | 'Validation'
  | 'FUSION_ASSEMBLY'
  | 'FUSION_VALIDATION'
  | 'SEED_PRESERVATION_CHECK';

export async function logFlowEvent(
  sessionId: string,
  nodeName: FlowNodeName | string,
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped',
  processingTime?: number,
  metadata?: Record<string, any>
) {
  try {
    await supabase.from('processing_flow_events').insert({
      session_id: sessionId,
      node_name: nodeName,
      status,
      processing_time_ms: processingTime,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('Failed to log flow event:', error);
  }
}

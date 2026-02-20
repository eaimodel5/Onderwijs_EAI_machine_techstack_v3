/**
 * Audit Service for EvAI v16
 * Fetches and aggregates decision logs for admin dashboard
 */

import { supabase } from '@/integrations/supabase/client';

export interface AuditStats {
  seedCoverage: number;
  policyHits: number;
  constraintsBlocked: number;
  totalDecisions: number;
  llmBypassRatio: number;
  avgResponseTime: number;
  totalLLMCalls: number;
  sessions: number;
}

export interface DecisionLog {
  id: string;
  userInput: string;
  finalResponse: string;
  outcome: 'OK' | 'BLOCKED';
  processingPath?: string;
  processingTime?: number;
  validated?: boolean;
  constraintsOK?: boolean;
  createdAt: string;
  auditLog?: string[];
  fusionMetadata?: any;
  eaaProfile?: any;
  tdMatrix?: any;
  eaiRules?: any;
  safetyCheck?: any;
  rubricsAnalysis?: any;
}

/**
 * Get aggregated audit statistics
 */
export async function getAuditStats(userId: string, limit = 100): Promise<AuditStats> {
  try {
    // Fetch recent decision logs
    const { data: decisions, error } = await supabase
      .from('decision_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const totalDecisions = decisions?.length || 0;
    if (totalDecisions === 0) {
      return {
        seedCoverage: 0,
        policyHits: 0,
        constraintsBlocked: 0,
        totalDecisions: 0,
        llmBypassRatio: 0,
        avgResponseTime: 0,
        totalLLMCalls: 0,
        sessions: 0
      };
    }

    // Extract v16 metadata from hybrid_decision
    const decisionsWithMeta = decisions?.map(d => {
      const hybridDecision = d.hybrid_decision as Record<string, unknown> | null;
      return {
        ...d,
        processingPath: (hybridDecision as { metadata?: { processingPath?: string } })?.metadata?.processingPath || 'unknown',
        outcome: (hybridDecision as { outcome?: string })?.outcome || 'OK',
      };
    }) || [];

    // Count processing paths
    const seedDecisions = decisionsWithMeta.filter(d => d.processingPath === 'seed').length;
    const templateDecisions = decisionsWithMeta.filter(d => d.processingPath === 'template').length;
    const llmDecisions = decisionsWithMeta.filter(d => d.processingPath === 'llm').length;
    const blockedDecisions = decisionsWithMeta.filter(d => d.outcome === 'BLOCKED').length;

    // Calculate metrics
    const seedCoverage = (seedDecisions / totalDecisions) * 100;
    const policyHits = seedDecisions + templateDecisions; // Decisions made by rules
    const llmBypassRatio = ((totalDecisions - llmDecisions) / totalDecisions) * 100;
    
    // Calculate average response time
    const responseTimes = decisions?.map(d => d.processing_time_ms || 0).filter(t => t > 0) || [];
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length)
      : 0;

    // Estimate sessions (simplified: count unique hour-based windows)
    const sessions = new Set(
      decisions?.map(d => 
        new Date(d.created_at).toISOString().substring(0, 13) // Group by hour
      )
    ).size;

    return {
      seedCoverage,
      policyHits,
      constraintsBlocked: blockedDecisions,
      totalDecisions,
      llmBypassRatio,
      avgResponseTime,
      totalLLMCalls: llmDecisions,
      sessions: Math.max(1, sessions)
    };

  } catch (error) {
    console.error('Error fetching audit stats:', error);
    return {
      seedCoverage: 0,
      policyHits: 0,
      constraintsBlocked: 0,
      totalDecisions: 0,
      llmBypassRatio: 0,
      avgResponseTime: 0,
      totalLLMCalls: 0,
      sessions: 0
    };
  }
}

/**
 * Get recent decision logs with details
 */
export async function getDecisionLogs(userId: string, limit = 50): Promise<DecisionLog[]> {
  try {
    const { data: decisions, error } = await supabase
      .from('decision_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (decisions || []).map(d => {
      const hybridDecision = d.hybrid_decision as Record<string, unknown> | null;
      const metadata = (hybridDecision as { metadata?: Record<string, unknown> })?.metadata || {};
      
      return {
        id: d.id,
        userInput: d.user_input || '',
        finalResponse: d.final_response || '',
        outcome: (metadata.outcome || 'OK') as 'OK' | 'BLOCKED',
        processingPath: String(metadata.processingPath || 'unknown'),
        processingTime: d.processing_time_ms || 0,
        validated: Boolean(metadata.validated),
        constraintsOK: Boolean(metadata.constraintsOK),
        createdAt: d.created_at,
        auditLog: metadata.auditLog ? (Array.isArray(metadata.auditLog) ? metadata.auditLog : []) : [],
        fusionMetadata: d.fusion_metadata,
        eaaProfile: d.eaa_profile,
        tdMatrix: d.td_matrix,
        eaiRules: d.eai_rules,
        safetyCheck: d.safety_check,
        rubricsAnalysis: d.rubrics_analysis
      };
    });

  } catch (error) {
    console.error('Error fetching decision logs:', error);
    return [];
  }
}

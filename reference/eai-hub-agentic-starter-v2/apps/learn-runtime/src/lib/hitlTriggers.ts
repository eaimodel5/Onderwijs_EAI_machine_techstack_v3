import { supabase } from '@/integrations/supabase/client';
import type { HITLTriggerContext, HITLDecision, HITLQueueItem } from '@/types/hitl';

/**
 * Determines if HITL (Human-In-The-Loop) should be triggered based on various criteria
 */
export async function shouldTriggerHITL(context: HITLTriggerContext): Promise<HITLDecision> {
  const checks: HITLDecision[] = [];

  // Check 1: Crisis score
  if (context.crisisScore && context.crisisScore > 90) {
    checks.push({
      shouldTrigger: true,
      triggerType: 'crisis',
      severity: 'critical',
      reason: `Crisis score van ${context.crisisScore} overschrijdt veiligheidsdrempel`,
      blockOutput: true, // Block output for critical crisis
    });
  }

  // Check 2: TD-Matrix critical (high AI dominance with low agency)
  if (context.tdValue && context.tdValue > 0.9 && context.rubrics?.autonomy < 0.3) {
    checks.push({
      shouldTrigger: true,
      triggerType: 'td_critical',
      severity: 'high',
      reason: 'TD-waarde te hoog bij lage gebruikersautonomie - risico op overmatige AI-dominantie',
      blockOutput: false,
    });
  }

  // Check 3: Critical blindspot from NGBSE
  if (context.blindspots && context.blindspots.some(b => b.severity === 'critical')) {
    checks.push({
      shouldTrigger: true,
      triggerType: 'ngbse_blindspot',
      severity: 'critical',
      reason: 'NGBSE detecteerde kritieke blinde vlek in AI-redenering',
      blockOutput: true,
    });
  }

  // Check 4: Extremely low confidence
  if (context.confidence < 0.3) {
    checks.push({
      shouldTrigger: true,
      triggerType: 'low_confidence',
      severity: 'medium',
      reason: `Confidence van ${context.confidence.toFixed(2)} te laag voor autonome response`,
      blockOutput: false,
    });
  }

  // Check 5: Repeated failure
  if (context.failureCount && context.failureCount >= 3) {
    checks.push({
      shouldTrigger: true,
      triggerType: 'repeated_failure',
      severity: 'high',
      reason: `${context.failureCount} opeenvolgende fouten - auto-healing gefaald`,
      blockOutput: true,
    });
  }

  // Return highest severity trigger
  if (checks.length === 0) {
    return { shouldTrigger: false };
  }

  const severityOrder = { critical: 3, high: 2, medium: 1 };
  checks.sort((a, b) => severityOrder[b.severity!] - severityOrder[a.severity!]);

  return checks[0];
}

/**
 * Adds an item to the HITL queue and creates a notification
 */
export async function triggerHITL(
  userInput: string,
  aiResponse: string,
  decision: HITLDecision,
  context: Record<string, any> = {}
): Promise<string | null> {
  if (!decision.shouldTrigger) return null;

  try {
    // Insert into HITL queue
    const { data: queueItem, error: queueError } = await supabase
      .from('hitl_queue')
      .insert({
        user_input: userInput,
        ai_response: aiResponse,
        trigger_type: decision.triggerType!,
        severity: decision.severity!,
        reason: decision.reason!,
        context: context,
        conversation_id: context.sessionId || '',
      })
      .select()
      .single();

    if (queueError) {
      console.error('❌ HITL queue insert failed:', queueError);
      return null;
    }

    // Create notification
    const notificationMessage = `${decision.severity === 'critical' ? '🚨' : '⚠️'} HITL Review Nodig: ${decision.reason}`;
    
    const { error: notifError } = await supabase
      .from('hitl_notifications')
      .insert({
        queue_item_id: queueItem.id,
        severity: decision.severity!,
        message: notificationMessage,
      });

    if (notifError) {
      console.error('❌ HITL notification failed:', notifError);
    }

    console.log(`✅ HITL triggered: ${decision.triggerType} (${decision.severity})`);
    return queueItem.id;
  } catch (error) {
    console.error('❌ HITL trigger error:', error);
    return null;
  }
}

/**
 * Fetches pending HITL items
 */
export async function getPendingHITLItems(): Promise<HITLQueueItem[]> {
  const { data, error } = await supabase
    .from('hitl_queue')
    .select('*')
    .eq('status', 'pending')
    .order('severity', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to fetch HITL queue:', error);
    return [];
  }

  return (data || []) as HITLQueueItem[];
}

/**
 * Updates HITL item status after review
 */
export async function resolveHITL(
  itemId: string,
  status: 'approved' | 'rejected' | 'override',
  adminResponse: string
): Promise<boolean> {
  const { error } = await supabase
    .from('hitl_queue')
    .update({
      status,
      admin_response: adminResponse,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', itemId);

  if (error) {
    console.error('❌ Failed to resolve HITL item:', error);
    return false;
  }

  console.log('✅ HITL item resolved:', itemId, status);
  
  // ✅ NEW: Trigger Meta-Learner (async, non-blocking)
  void (async () => {
    try {
      const { data: item } = await supabase
        .from('hitl_queue')
        .select('*')
        .eq('id', itemId)
        .single();
      
      if (!item) return;
      
      const { FusionWeightCalibrator } = await import('@/lib/fusionWeightCalibrator');
      const calibrator = new FusionWeightCalibrator();
      
      // Parse context JSONB safely
      const ctx = (item.context as any) || {};
      
      await calibrator.learnFromHITL(itemId, status, {
        contextType: item.trigger_type,
        confidence: typeof ctx.confidence === 'number' ? ctx.confidence : 0.5,
        tdScore: typeof ctx.tdScore === 'number' ? ctx.tdScore : 0.5
      });
    } catch (e) {
      console.error('❌ Meta-Learner HITL integration failed:', e);
    }
  })();
  
  return true;
}

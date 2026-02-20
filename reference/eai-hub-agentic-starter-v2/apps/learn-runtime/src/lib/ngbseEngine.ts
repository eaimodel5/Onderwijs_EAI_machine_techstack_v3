import { supabase } from '@/integrations/supabase/client';
import { detectAssumptions } from './ngbse/assumptionDetector';
import { calibrateConfidence, isNovelSituation } from './ngbse/confidenceCalibrator';
import { detectContextGaps, shouldAskMoreQuestions } from './ngbse/contextGapDetector';
import { checkForBias, detectBiasHeuristic } from './ngbse/biasChecker';
import type { NGBSEResult, Blindspot } from '@/types/ngbse';

interface NGBSEContext {
  userInput: string;
  aiResponse: string;
  confidence: number;
  emotion: string;
  seedMatchCount: number;
  rubricScores?: Record<string, number>;
  conversationHistory: any[];
  sessionId: string;
}

/**
 * Main NGBSE Engine - orchestrates all blind spot detection checks
 */
export async function performNGBSECheck(context: NGBSEContext): Promise<NGBSEResult> {
  const startTime = Date.now();
  const allBlindspots: Blindspot[] = [];
  const reasoning: string[] = [];

  try {
    // Check 1: Assumption Detection
    const assumptions = detectAssumptions(
      context.userInput,
      context.aiResponse,
      context.emotion
    );
    allBlindspots.push(...assumptions);
    if (assumptions.length > 0) {
      reasoning.push(`${assumptions.length} assumptie(s) gedetecteerd`);
    }

    // Check 2: Context Gap Detection
    const contextGaps = detectContextGaps(
      context.userInput,
      context.aiResponse,
      context.conversationHistory
    );
    
    // Convert context gaps to blindspots
    const gapBlindspots: Blindspot[] = contextGaps.map(gap => ({
      type: 'missing_context',
      severity: gap.severity,
      description: gap.description,
      confidence: 0.80,
      recommendation: 'Stel verdiepende vragen voordat je verder gaat',
      metadata: { gapType: gap.type },
    }));
    allBlindspots.push(...gapBlindspots);
    
    if (gapBlindspots.length > 0) {
      reasoning.push(`${gapBlindspots.length} context gap(s) gedetecteerd`);
    }

    // Check 3: Novel Situation Detection
    const isNovel = isNovelSituation(
      context.emotion,
      context.userInput,
      context.conversationHistory
    );
    
    if (isNovel) {
      allBlindspots.push({
        type: 'novel_situation',
        severity: 'high',
        description: 'Dit is een nieuwe/onbekende situatie die extra voorzichtigheid vereist',
        confidence: 0.85,
        recommendation: 'Overweeg HITL review voor deze novel situation',
      });
      reasoning.push('Novel situation gedetecteerd');
    }

    // Check 4: Bias Detection (try LLM first, fallback to heuristic)
    let biasReport;
    try {
      biasReport = await checkForBias(context.userInput, context.aiResponse);
    } catch (error) {
      console.warn('⚠️ LLM bias check failed, using heuristic fallback');
      biasReport = detectBiasHeuristic(context.aiResponse);
    }

    if (biasReport.detected) {
      allBlindspots.push({
        type: 'bias',
        severity: biasReport.severity,
        description: biasReport.description,
        confidence: biasReport.confidence,
        recommendation: 'Herformuleer response om bias te vermijden',
        metadata: { biasTypes: biasReport.types },
      });
      reasoning.push(`Bias gedetecteerd: ${biasReport.types.join(', ')}`);
    }

    // Check 5: Confidence Calibration
    const calibration = calibrateConfidence({
      originalConfidence: context.confidence,
      seedMatchCount: context.seedMatchCount,
      rubricScores: context.rubricScores,
      emotion: context.emotion,
      conversationLength: context.conversationHistory.length,
    });

    if (calibration.factors.length > 0) {
      allBlindspots.push({
        type: 'overconfidence',
        severity: calibration.adjusted < 0.5 ? 'medium' : 'low',
        description: calibration.reasoning,
        confidence: 0.75,
        recommendation: `Adjusted confidence van ${context.confidence.toFixed(2)} naar ${calibration.adjusted.toFixed(2)}`,
        metadata: { factors: calibration.factors },
      });
      reasoning.push(`Confidence aangepast: ${calibration.original.toFixed(2)} → ${calibration.adjusted.toFixed(2)}`);
    }

    // Determine if HITL should be triggered
    const criticalBlindspots = allBlindspots.filter(b => b.severity === 'critical');
    const shouldTriggerHITL = criticalBlindspots.length > 0 || 
                              (isNovel && calibration.adjusted < 0.4);

    // Log to database
    await logBlindspots(
      allBlindspots,
      context.userInput,
      context.aiResponse,
      context.sessionId
    );

    const processingTime = Date.now() - startTime;
    console.log(`✅ NGBSE check completed in ${processingTime}ms - ${allBlindspots.length} blindspot(s) found`);

    return {
      blindspots: allBlindspots,
      adjustedConfidence: calibration.adjusted,
      shouldTriggerHITL,
      reasoning,
    };
  } catch (error) {
    console.error('❌ NGBSE check failed:', error);
    
    // Notify about NGBSE failure (silent failure is dangerous)
    if (typeof window !== 'undefined') {
      const { toast } = await import('sonner');
      toast.warning('Blind spot detectie uitgevallen', {
        description: 'Systeem gebruikt standaard confidence levels'
      });
    }
    
    return {
      blindspots: [],
      adjustedConfidence: context.confidence,
      shouldTriggerHITL: false,
      reasoning: ['NGBSE check failed - using original confidence'],
    };
  }
}

/**
 * Logs detected blindspots to database for analysis
 */
async function logBlindspots(
  blindspots: Blindspot[],
  userInput: string,
  aiResponse: string,
  sessionId: string
): Promise<void> {
  if (blindspots.length === 0) return;

  try {
    const inserts = blindspots.map(blindspot => ({
      session_id: sessionId,
      user_input: userInput,
      ai_response: aiResponse,
      blindspot_type: blindspot.type,
      description: blindspot.description,
      confidence: blindspot.confidence,
      severity: blindspot.severity,
      recommendation: blindspot.recommendation || '',
      metadata: blindspot.metadata || {},
    }));

    const { error } = await supabase.from('blindspot_logs').insert(inserts);

    if (error) {
      console.error('❌ Failed to log blindspots:', error);
    }
  } catch (error) {
    console.error('❌ Blindspot logging error:', error);
  }
}

/**
 * Gets recent blindspot statistics for admin dashboard
 */
export async function getBlindspotStats(limit: number = 100) {
  const { data, error } = await supabase
    .from('blindspot_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Failed to fetch blindspot stats:', error);
    return null;
  }

  // Calculate statistics
  const stats = {
    total: data.length,
    bySeverity: {
      critical: data.filter(b => b.severity === 'critical').length,
      high: data.filter(b => b.severity === 'high').length,
      medium: data.filter(b => b.severity === 'medium').length,
      low: data.filter(b => b.severity === 'low').length,
    },
    byType: data.reduce((acc, b) => {
      acc[b.blindspot_type] = (acc[b.blindspot_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    avgConfidence: data.reduce((sum, b) => sum + Number(b.confidence), 0) / data.length,
  };

  return { stats, logs: data };
}

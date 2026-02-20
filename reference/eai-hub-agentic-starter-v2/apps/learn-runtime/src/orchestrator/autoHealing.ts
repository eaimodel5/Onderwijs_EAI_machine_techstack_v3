import { supabase } from '@/integrations/supabase/client';
import type { HealingContext, HealingResult, ErrorType } from '@/types/autoHealing';

const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY = 2000; // 2 seconds

/**
 * Classifies error type for appropriate healing strategy
 */
function classifyError(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  
  if (message.includes('timeout') || message.includes('network')) {
    return 'api_timeout';
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation_fail';
  }
  
  if (message.includes('database') || message.includes('supabase')) {
    return 'db_error';
  }
  
  if (message.includes('openai') || message.includes('llm') || message.includes('model')) {
    return 'llm_error';
  }
  
  return 'unknown';
}

/**
 * Waits with exponential backoff
 */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Attempts to auto-heal from errors with retry, fallback, or HITL escalation
 */
export async function attemptAutoHeal(
  context: HealingContext,
  originalFunction: () => Promise<any>
): Promise<HealingResult> {
  const errorType = classifyError(context.error);
  const startTime = Date.now();
  
  console.log(`🔧 Auto-healing attempt ${context.attemptNumber}/${MAX_RETRY_ATTEMPTS} for ${errorType}`);

  // Strategy 1: Retry with exponential backoff (for transient errors)
  if (errorType === 'api_timeout' || errorType === 'db_error') {
    if (context.attemptNumber < MAX_RETRY_ATTEMPTS) {
      const delay = BASE_RETRY_DELAY * Math.pow(2, context.attemptNumber - 1);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await wait(delay);
      
      try {
        const result = await originalFunction();
        
        // Log successful healing
        await logHealingAttempt({
          sessionId: context.sessionId,
          errorType,
          strategy: 'retry',
          attemptNumber: context.attemptNumber,
          success: true,
          processingTime: Date.now() - startTime,
          context: { delay },
        });
        
        console.log('✅ Auto-healing successful via retry');
        return {
          success: true,
          strategy: 'retry',
          response: result,
        };
      } catch (retryError) {
        console.warn(`❌ Retry ${context.attemptNumber} failed:`, retryError);
        
        // Log failed attempt
        await logHealingAttempt({
          sessionId: context.sessionId,
          errorType,
          strategy: 'retry',
          attemptNumber: context.attemptNumber,
          success: false,
          processingTime: Date.now() - startTime,
          errorMessage: (retryError as Error).message,
        });
        
        // If max retries reached, escalate
        if (context.attemptNumber >= MAX_RETRY_ATTEMPTS) {
          return {
            success: false,
            strategy: 'escalate_hitl',
            escalateToHITL: true,
            error: `Max retries (${MAX_RETRY_ATTEMPTS}) exhausted`,
          };
        }
        
        // Recursive retry
        return attemptAutoHeal(
          { ...context, attemptNumber: context.attemptNumber + 1 },
          originalFunction
        );
      }
    }
  }

  // Strategy 2: Fallback to template response (for validation/LLM errors)
  if (errorType === 'validation_fail' || errorType === 'llm_error') {
    const fallbackResponse = generateFallbackResponse(
      context.userInput,
      context.conversationHistory
    );
    
    await logHealingAttempt({
      sessionId: context.sessionId,
      errorType,
      strategy: 'fallback',
      attemptNumber: context.attemptNumber,
      success: true,
      processingTime: Date.now() - startTime,
    });
    
    console.log('✅ Auto-healing via fallback template');
    return {
      success: true,
      strategy: 'fallback',
      response: fallbackResponse,
    };
  }

  // Strategy 3: Escalate to HITL (for unknown or persistent errors)
  const hitlFallbackResponse = {
    content: "Er is een probleem opgetreden bij het verwerken van je bericht. Een specialist bekijkt dit zo snel mogelijk. Je hoeft niets te doen - we nemen contact op zodra we meer weten.",
    emotion: "onzekerheid",
    confidence: 0.30,
    label: "Reflectievraag" as const,
    reasoning: "Auto-healing escalated to HITL - safe fallback response",
    symbolicInferences: ["auto_healing_hitl_escalation"],
    metadata: {
      processingPath: "error" as const,
      totalProcessingTime: Date.now() - startTime,
      componentsUsed: ["auto_healing", "hitl_escalation"],
      hitlBlocked: true,
      fallback: true,
    },
  };

  await logHealingAttempt({
    sessionId: context.sessionId,
    errorType,
    strategy: 'escalate_hitl',
    attemptNumber: context.attemptNumber,
    success: false,
    processingTime: Date.now() - startTime,
    errorMessage: context.error.message,
  });
  
  console.log('⚠️ Auto-healing escalating to HITL with fallback response');
  return {
    success: true, // Changed from false - we do provide a response
    strategy: 'escalate_hitl',
    escalateToHITL: true,
    response: hitlFallbackResponse,
    error: context.error.message,
  };
}

/**
 * Generates a safe fallback response when healing fails
 */
function generateFallbackResponse(
  userInput: string,
  conversationHistory: any[]
): any {
  // Simple empathetic fallback that doesn't make assumptions
  return {
    content: "Ik merk dat ik moeite heb om je op dit moment goed te ondersteunen. Zou je me kunnen helpen door wat meer context te geven over wat je ervaart?",
    emotion: "onzekerheid",
    confidence: 0.40,
    label: "Reflectievraag" as const,
    reasoning: "Fallback response - veilige reflectievraag zonder aannames",
    symbolicInferences: ["auto_healing_fallback"],
    metadata: {
      processingPath: "error" as const,
      totalProcessingTime: 0,
      componentsUsed: ["auto_healing"],
      fallback: true,
    },
  };
}

/**
 * Logs healing attempt to database
 */
async function logHealingAttempt(params: {
  sessionId: string;
  errorType: ErrorType;
  strategy: 'retry' | 'fallback' | 'escalate_hitl';
  attemptNumber: number;
  success: boolean;
  processingTime: number;
  context?: Record<string, any>;
  errorMessage?: string;
}): Promise<void> {
  try {
    const { error } = await supabase.from('healing_attempts').insert({
      session_id: params.sessionId,
      error_type: params.errorType,
      strategy: params.strategy,
      attempt_number: params.attemptNumber,
      success: params.success,
      processing_time_ms: params.processingTime,
      context: params.context || {},
      error_message: params.errorMessage,
    });

    if (error) {
      console.error('❌ Failed to log healing attempt:', error);
    }
  } catch (error) {
    console.error('❌ Healing log error:', error);
  }
}

/**
 * Gets healing statistics for admin dashboard
 */
export async function getHealingStats(limit: number = 100) {
  const { data, error } = await supabase
    .from('healing_attempts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Failed to fetch healing stats:', error);
    return null;
  }

  const stats = {
    total: data.length,
    successRate: (data.filter(h => h.success).length / data.length) * 100,
    byStrategy: {
      retry: data.filter(h => h.strategy === 'retry').length,
      fallback: data.filter(h => h.strategy === 'fallback').length,
      escalate_hitl: data.filter(h => h.strategy === 'escalate_hitl').length,
    },
    byErrorType: data.reduce((acc, h) => {
      acc[h.error_type] = (acc[h.error_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    avgProcessingTime: data.reduce((sum, h) => sum + (h.processing_time_ms || 0), 0) / data.length,
  };

  return { stats, logs: data };
}

export type ErrorType = 'api_timeout' | 'validation_fail' | 'db_error' | 'llm_error' | 'unknown';
export type HealingStrategy = 'retry' | 'fallback' | 'escalate_hitl';

export interface HealingContext {
  error: Error;
  sessionId: string;
  userInput: string;
  attemptNumber: number;
  conversationHistory: any[];
}

export interface HealingResult {
  success: boolean;
  strategy: HealingStrategy;
  response?: any;
  escalateToHITL?: boolean;
  error?: string;
}

export interface HealingAttempt {
  id: string;
  created_at: string;
  error_type: ErrorType;
  strategy: HealingStrategy;
  attempt_number: number;
  success: boolean;
  processing_time_ms?: number;
  context: Record<string, any>;
  error_message?: string;
}

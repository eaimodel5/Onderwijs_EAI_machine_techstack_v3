
import { AdvancedSeed } from './seed';
import type { Message } from './index';

export interface SeedGenerationRequest {
  emotion: string;
  context: string;
  conversationHistory?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface OpenAISeedGeneratorConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  defaultTTL: number;
}

export interface ConversationAnalysisResult {
  missingEmotions: string[];
  confidence: number;
}

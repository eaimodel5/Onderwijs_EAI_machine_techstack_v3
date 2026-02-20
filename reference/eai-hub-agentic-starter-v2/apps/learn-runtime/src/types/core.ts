
export interface ProcessingContext {
  userInput: string;
  conversationHistory?: ChatHistoryItem[];
  sessionId?: string;
  sessionMetadata?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface UnifiedResponse {
  content: string;
  emotion: string;
  confidence: number;
  label: 'Valideren' | 'Reflectievraag' | 'Suggestie' | 'Interventie' | 'Fout';
  reasoning: string;
  symbolicInferences: string[];
  secondaryInsights?: string[];
  metadata?: {
    processingPath: 'symbolic' | 'hybrid' | 'neural' | 'error';
    totalProcessingTime: number;
    componentsUsed: string[];
    fallback?: boolean;
    fusionMetadata?: {
      symbolicWeight: number;
      neuralWeight: number;
      preservationScore: number;
      strategy: 'neural_enhanced' | 'weighted_blend' | 'symbolic_fallback';
      tdMatrixFlag?: string;
      safetyScore?: number;
      eaaScores?: {
        ownership: number;
        autonomy: number;
        agency: number;
      };
    };
    apiCollaboration?: {
      api1Used: boolean;
      api2Used: boolean;
      vectorApiUsed: boolean;
      googleApiUsed: boolean;
      seedGenerated: boolean;
      secondaryAnalysis: boolean;
    };
  };
}

export interface NeurosymbolicDecision {
  type: 'symbolic' | 'neural' | 'hybrid';
  confidence: number;
  reasoning: string[];
  source: string;
  processingTime: number;
  metadata: {
    processingTime: number;
    fallbackUsed: boolean;
    priority: 'high' | 'medium' | 'low';
    componentsUsed: string[];
    apiCollaboration?: {
      api1Used: boolean;
      api2Used: boolean;
      vectorApiUsed: boolean;
      googleApiUsed: boolean;
      seedGenerated: boolean;
      secondaryAnalysis: boolean;
    };
  };
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  from?: string;
  timestamp?: Date;
}

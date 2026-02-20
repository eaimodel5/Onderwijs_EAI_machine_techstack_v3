
export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface MessageMeta {
  explainText?: string;
  processingPath?: string;
  totalProcessingTime?: number;
  componentsUsed?: string[];
  [key: string]: unknown;
}

export interface Message {
  id: string;
  from: 'user' | 'ai';
  content: string;
  timestamp: Date;
  emotionSeed?: string | null;
  confidence?: number;
  label?:
    | 'Valideren'
    | 'Reflectievraag'
    | 'Suggestie'
    | 'Interventie'
    | 'Fout'
    | null;
  explainText?: string;
  feedback?: 'like' | 'dislike' | null;
  animate?: boolean;
  meta?: MessageMeta;
  symbolicInferences?: string[];
  secondaryInsights?: string[];
  v20Metadata?: {
    tdMatrixFlag?: string;
    fusionStrategy?: string;
    safetyScore?: number;
    eaaScores?: { ownership: number; autonomy: number; agency: number };
  };
}
export * from './orchestration';
export * from './core';

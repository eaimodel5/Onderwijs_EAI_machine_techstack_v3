
export interface NeurosymbolicDecision {
  finalEmotion: string;
  confidence: number;
  processingPath: 'neural' | 'symbolic' | 'hybrid';
  componentsUsed: string;
  processingTime: number;
}

export interface NeurosymbolicData {
  symbolicMatches: {
    pattern: string;
    confidence: number;
    source: string;
  }[];
  neuralAnalysis: {
    emotion: string;
    confidence: number;
    reasoning: string;
  };
  hybridDecision: NeurosymbolicDecision;
}

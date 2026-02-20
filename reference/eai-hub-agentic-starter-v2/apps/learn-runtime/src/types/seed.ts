
export interface SeedResponse {
  nl: string;
  en?: string;
  fr?: string;
}

export interface SeedMeta {
  context?: {
    userAge?: 'child' | 'teen' | 'adult' | 'senior';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    situation?: 'work' | 'home' | 'school' | 'social' | 'therapy';
  };
  triggers?: string[];
  tags?: string[];
  type?: 'validation' | 'reflection' | 'suggestion' | 'intervention';
  createdBy?: 'system' | 'admin' | 'ai' | 'ai-api2';
  version?: string;
  priority?: number;
  ttl?: number;
  weight?: number;
  confidence?: number;
  lastUsed?: Date | string;
  usageCount?: number;
}

export interface AdvancedSeed {
  id: string;
  emotion: string;
  type: 'validation' | 'reflection' | 'suggestion' | 'intervention' | 'error';
  label: 'Valideren' | 'Reflectievraag' | 'Suggestie' | 'Interventie' | 'Fout';
  triggers: string[];
  response: SeedResponse;
  context: {
    userAge?: 'child' | 'teen' | 'adult' | 'senior';
    severity: 'low' | 'medium' | 'high' | 'critical';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    situation?: 'work' | 'home' | 'school' | 'social' | 'therapy';
  };
  meta: {
    priority: number;
    weight: number;
    confidence: number;
    usageCount: number;
    ttl?: number;
    lastUsed?: Date | string;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: 'ai' | 'system' | 'admin' | 'ai-api2';
  isActive: boolean;
  version: string;
}

export interface LegacySeed {
  emotion: string;
  label: "Valideren" | "Reflectievraag" | "Suggestie";
  triggers: string[];
  response: string;
  meta: string;
}

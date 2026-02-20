
export interface EnhancedEmotionConfig {
  emotion: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  expectedType: 'intervention' | 'reflection' | 'suggestion' | 'validation';
}

export const enhancedEmotionList: EnhancedEmotionConfig[] = [
  // High-variety emotions for better type distribution
  { emotion: 'paniek', severity: 'critical', expectedType: 'intervention' },
  { emotion: 'onzekerheid', severity: 'medium', expectedType: 'reflection' },
  { emotion: 'motivatie', severity: 'low', expectedType: 'suggestion' },
  { emotion: 'verdriet', severity: 'medium', expectedType: 'validation' },
  { emotion: 'frustratie', severity: 'high', expectedType: 'suggestion' },
  { emotion: 'eenzaamheid', severity: 'high', expectedType: 'reflection' },
  { emotion: 'stress', severity: 'high', expectedType: 'intervention' },
  { emotion: 'teleurstelling', severity: 'medium', expectedType: 'reflection' },
  { emotion: 'angst', severity: 'high', expectedType: 'intervention' },
  { emotion: 'blijdschap', severity: 'low', expectedType: 'validation' },
  { emotion: 'woede', severity: 'high', expectedType: 'suggestion' },
  { emotion: 'schaamte', severity: 'medium', expectedType: 'reflection' }
];

export const commonMissingEmotions = [
  'faalangst', 'perfectionalisme', 'eenzaamheid', 'overweldiging', 
  'teleurstelling', 'onmacht', 'schaamte', 'schuld', 'rouw',
  'jaloezie', 'frustratie', 'onzekerheid', 'angst', 'paniek'
];

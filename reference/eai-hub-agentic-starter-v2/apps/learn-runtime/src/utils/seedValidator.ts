/**
 * Seed Validator - Neurosymbolic Chatbot Database Integrity
 * Validates emotions, triggers, and responses to prevent database contamination
 */

export const VALID_EMOTIONS = [
  'angst',
  'verdriet',
  'woede',
  'stress',
  'eenzaamheid',
  'onzekerheid',
  'blijdschap',
  'trots',
  'vreugde',
  'geluk',
  'rust',
  'opluchting',
  'teleurstelling',
  'schaamte',
  'schuld',
  'jaloezie',
  'frustratie',
  'verwarring',
  'hoop',
  'nieuwsgierigheid',
  'verbazing',
  'acceptatie',
  'liefde'
] as const;

export type ValidEmotion = typeof VALID_EMOTIONS[number];

/**
 * Check if a string is a valid emotion
 * Rejects: full sentences, long texts, unknown emotions
 */
export function isValidEmotion(emotion: string): emotion is ValidEmotion {
  if (!emotion || typeof emotion !== 'string') return false;
  
  // Reject if too long (emotions should be single words or short phrases)
  if (emotion.length > 50) return false;
  
  // Reject if contains multiple sentences
  if (emotion.includes('.') || emotion.includes('!') || emotion.includes('?')) return false;
  
  // Check if it's in the valid list (case-insensitive)
  const normalized = emotion.toLowerCase().trim();
  return VALID_EMOTIONS.includes(normalized as ValidEmotion);
}

/**
 * Sanitize and validate a seed object
 * Returns null if seed is invalid
 */
export function sanitizeSeed(seed: any): any | null {
  if (!seed || typeof seed !== 'object') return null;
  
  // Validate emotion
  if (!seed.emotion || !isValidEmotion(seed.emotion)) {
    console.warn(`❌ Invalid emotion detected: "${seed.emotion}"`);
    return null;
  }
  
  // Validate response
  if (seed.response) {
    const responseNl = typeof seed.response === 'string' ? seed.response : seed.response.nl;
    if (!responseNl || typeof responseNl !== 'string' || responseNl.length < 10) {
      console.warn(`❌ Invalid response for emotion "${seed.emotion}"`);
      return null;
    }
    
    // Response shouldn't be longer than 500 characters for seeds
    if (responseNl.length > 500) {
      console.warn(`⚠️ Response too long for emotion "${seed.emotion}" (${responseNl.length} chars)`);
    }
  }
  
  // Validate triggers
  if (seed.triggers) {
    if (!Array.isArray(seed.triggers)) {
      console.warn(`❌ Invalid triggers format for emotion "${seed.emotion}"`);
      return null;
    }
    
    // Each trigger should be short (< 100 chars)
    const invalidTriggers = seed.triggers.filter((t: any) => 
      typeof t !== 'string' || t.length > 100
    );
    
    if (invalidTriggers.length > 0) {
      console.warn(`❌ Invalid triggers detected for emotion "${seed.emotion}":`, invalidTriggers);
      return null;
    }
  }
  
  return seed;
}

/**
 * Normalize emotion to standard format
 * Maps common variations to canonical emotion names
 */
export function normalizeEmotion(emotion: string): ValidEmotion | null {
  if (!emotion || typeof emotion !== 'string') return null;
  
  const normalized = emotion.toLowerCase().trim();
  
  // Direct match
  if (VALID_EMOTIONS.includes(normalized as ValidEmotion)) {
    return normalized as ValidEmotion;
  }
  
  // Common variations
  const variations: Record<string, ValidEmotion> = {
    'neutral': 'onzekerheid',
    'neutraal': 'onzekerheid',
    'uncertain': 'onzekerheid',
    'anxiety': 'angst',
    'fear': 'angst',
    'sad': 'verdriet',
    'sadness': 'verdriet',
    'angry': 'woede',
    'anger': 'woede',
    'stressed': 'stress',
    'lonely': 'eenzaamheid',
    'happy': 'blijdschap',
    'joy': 'vreugde',
    'proud': 'trots',
    'calm': 'rust',
    'relief': 'opluchting',
    'disappointed': 'teleurstelling',
    'shame': 'schaamte',
    'guilt': 'schuld',
    'jealous': 'jaloezie',
    'frustrated': 'frustratie',
    'confused': 'verwarring',
    'hope': 'hoop',
    'curious': 'nieuwsgierigheid',
    'surprised': 'verbazing',
    'acceptance': 'acceptatie',
    'love': 'liefde'
  };
  
  return variations[normalized] || null;
}

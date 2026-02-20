/**
 * Context Parameter Extractor
 * Extracts dynamic context from user input for template compilation
 */

export interface ExtractedContext {
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  situation?: 'work' | 'home' | 'school' | 'social' | 'therapy';
  recentEvent?: string;
  temporalRef?: string;
}

/**
 * Extract context parameters from user input and conversation history
 */
export function extractContextParams(
  userInput: string,
  conversationHistory?: any[]
): Record<string, string> {
  const params: Record<string, string> = {};
  const lowerInput = userInput.toLowerCase();

  // Extract time of day
  const timeOfDay = extractTimeOfDay(lowerInput);
  if (timeOfDay) {
    params.timeOfDay = timeOfDay;
  }

  // Extract situation
  const situation = extractSituation(lowerInput);
  if (situation) {
    params.situation = situation;
  }

  // Extract recent event references
  const recentEvent = extractRecentEvent(lowerInput);
  if (recentEvent) {
    params.recentEvent = recentEvent;
  }

  // Extract temporal references
  const temporalRef = extractTemporalReference(lowerInput);
  if (temporalRef) {
    params.temporalRef = temporalRef;
  }

  return params;
}

/**
 * Extract time of day from input
 */
function extractTimeOfDay(input: string): string | null {
  const timePatterns = {
    morning: /\b(ochtend|morgen|vroeg|ontbijt|wakker worden)\b/i,
    afternoon: /\b(middag|lunch|namiddag)\b/i,
    evening: /\b(avond|vanavond|diner|eten)\b/i,
    night: /\b(nacht|vannacht|slapen|bed)\b/i
  };

  for (const [time, pattern] of Object.entries(timePatterns)) {
    if (pattern.test(input)) {
      return time;
    }
  }

  // If no explicit mention, infer from current time
  const currentHour = new Date().getHours();
  if (currentHour >= 6 && currentHour < 12) return 'de ochtend';
  if (currentHour >= 12 && currentHour < 18) return 'de middag';
  if (currentHour >= 18 && currentHour < 22) return 'de avond';
  return 'de nacht';
}

/**
 * Extract situation context from input
 */
function extractSituation(input: string): string | null {
  const situationPatterns = {
    work: /\b(werk|baan|baas|collega|kantoor|vergadering)\b/i,
    home: /\b(thuis|huis|familie|ouders)\b/i,
    school: /\b(school|studie|les|docent|klas|tentamen|huiswerk)\b/i,
    social: /\b(vrienden|feest|uitgaan|date|afspraak)\b/i
  };

  for (const [situation, pattern] of Object.entries(situationPatterns)) {
    if (pattern.test(input)) {
      return situation;
    }
  }

  return null;
}

/**
 * Extract recent event references
 */
function extractRecentEvent(input: string): string | null {
  const eventPatterns = [
    /na (een |mijn )?(.*?)(voelde|was|had|ging)/i,
    /sinds (.*?)(voel|ben|heb)/i,
    /door (.*?)(kan|wil|moet)/i
  ];

  for (const pattern of eventPatterns) {
    const match = input.match(pattern);
    if (match && match[2]) {
      return match[2].trim();
    }
  }

  return null;
}

/**
 * Extract temporal references (generic)
 */
function extractTemporalReference(input: string): string | null {
  const temporalPatterns = [
    { pattern: /\b(vannacht|gisteren|vanochtend|vanmiddag|vanavond)\b/i, replace: 'recent' },
    { pattern: /\b(vorige week|afgelopen week|laatst)\b/i, replace: 'recent' },
    { pattern: /\b(nu|momenteel|op dit moment)\b/i, replace: 'op dit moment' },
    { pattern: /\b(altijd|vaak|regelmatig)\b/i, replace: 'vaak' }
  ];

  for (const { pattern, replace } of temporalPatterns) {
    if (pattern.test(input)) {
      return replace;
    }
  }

  return null;
}

/**
 * Validate that a response doesn't contain overspecific context
 */
export function isResponseOverspecific(response: string, triggers: string[]): boolean {
  const overspecificPatterns = [
    /\b(vannacht|gisteren|eergisteren|vorige week)\b/i,
    /\b(na een goede nachtrust|na het slapen|na het wakker worden)\b/i,
    /\b(deze ochtend|deze middag|deze avond)\b/i,
    /\b(op maandag|op dinsdag|op woensdag|op donderdag|op vrijdag|op zaterdag|op zondag)\b/i
  ];

  for (const pattern of overspecificPatterns) {
    const match = response.match(pattern);
    if (match) {
      // Check if this specific context is in triggers
      const matchedText = match[0].toLowerCase();
      const isInTriggers = triggers.some(t => t.toLowerCase().includes(matchedText));
      
      if (!isInTriggers) {
        console.warn(`⚠️ Overspecific context detected: "${match[0]}" not in triggers`);
        return true;
      }
    }
  }

  return false;
}
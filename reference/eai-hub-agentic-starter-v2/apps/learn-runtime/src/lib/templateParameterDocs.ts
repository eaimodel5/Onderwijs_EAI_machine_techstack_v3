/**
 * Template Parameter Documentation for EvAI v16
 * 
 * This file documents all available template parameters that can be used
 * in seed responses for dynamic context substitution.
 */

export interface TemplateParameter {
  name: string;
  description: string;
  examples: string[];
  fallback: string;
}

/**
 * All available template parameters
 */
export const TEMPLATE_PARAMETERS: Record<string, TemplateParameter> = {
  timeOfDay: {
    name: 'timeOfDay',
    description: 'Time of day extracted from user input or inferred from current time',
    examples: [
      'de ochtend',
      'de middag', 
      'de avond',
      'de nacht'
    ],
    fallback: 'nu'
  },
  
  situation: {
    name: 'situation',
    description: 'Situational context where the emotion is experienced',
    examples: [
      'op het werk',
      'thuis',
      'op school',
      'in een sociale situatie'
    ],
    fallback: 'in deze situatie'
  },
  
  recentEvent: {
    name: 'recentEvent',
    description: 'Recent event or trigger mentioned by the user',
    examples: [
      'het gesprek',
      'de deadline',
      'het conflict',
      'de feedback'
    ],
    fallback: 'recent'
  },
  
  temporalRef: {
    name: 'temporalRef',
    description: 'Generic temporal reference for when things happened',
    examples: [
      'recent',
      'op dit moment',
      'vaak'
    ],
    fallback: 'op dit moment'
  }
};

/**
 * Get documentation for a specific parameter
 */
export function getParameterDocs(paramName: string): TemplateParameter | null {
  return TEMPLATE_PARAMETERS[paramName] || null;
}

/**
 * Get all parameter names
 */
export function getAllParameterNames(): string[] {
  return Object.keys(TEMPLATE_PARAMETERS);
}

/**
 * Validate that a seed response uses parameters correctly
 */
export function validateTemplateUsage(responseText: string): {
  valid: boolean;
  unknownParams: string[];
  suggestions: string[];
} {
  const paramPattern = /\{([a-zA-Z_]+)\}/g;
  const foundParams = [...responseText.matchAll(paramPattern)].map(m => m[1]);
  
  const unknownParams = foundParams.filter(
    param => !TEMPLATE_PARAMETERS[param]
  );
  
  const suggestions: string[] = [];
  
  // Check for hardcoded time references that should use {timeOfDay}
  if (/\b(ochtend|middag|avond|nacht)\b/i.test(responseText) && !foundParams.includes('timeOfDay')) {
    suggestions.push('Consider using {timeOfDay} for time references');
  }
  
  // Check for hardcoded situations that should use {situation}
  if (/\b(werk|school|thuis)\b/i.test(responseText) && !foundParams.includes('situation')) {
    suggestions.push('Consider using {situation} for situational context');
  }
  
  return {
    valid: unknownParams.length === 0,
    unknownParams,
    suggestions
  };
}

/**
 * Generate example response with all parameters
 */
export function generateExampleResponse(): string {
  return `Het is begrijpelijk dat je je zo voelt {timeOfDay}. {situation} kan het soms moeilijk maken om met deze emoties om te gaan. {temporalRef} heb je gemerkt dat {recentEvent} je beïnvloedt.`;
}

/**
 * Format documentation as markdown for admin panel
 */
export function formatDocsAsMarkdown(): string {
  let markdown = '# Template Parameters voor EvAI Seeds\n\n';
  markdown += 'Gebruik deze parameters in seed responses voor dynamische context substitutie.\n\n';
  
  Object.entries(TEMPLATE_PARAMETERS).forEach(([key, param]) => {
    markdown += `## {${key}}\n\n`;
    markdown += `**Beschrijving:** ${param.description}\n\n`;
    markdown += `**Fallback:** "${param.fallback}"\n\n`;
    markdown += `**Voorbeelden:**\n`;
    param.examples.forEach(ex => {
      markdown += `- ${ex}\n`;
    });
    markdown += '\n';
  });
  
  markdown += '## Voorbeeld Gebruik\n\n';
  markdown += '```\n';
  markdown += generateExampleResponse();
  markdown += '\n```\n\n';
  markdown += 'Bij compilatie wordt dit:\n\n';
  markdown += '```\n';
  markdown += 'Het is begrijpelijk dat je je zo voelt deze ochtend. Op het werk kan het soms moeilijk maken om met deze emoties om te gaan. Recent heb je gemerkt dat de deadline je beïnvloedt.\n';
  markdown += '```\n';
  
  return markdown;
}
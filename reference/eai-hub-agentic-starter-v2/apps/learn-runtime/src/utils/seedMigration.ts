
import { AdvancedSeed, LegacySeed } from '../types/seed';
import { v4 as uuidv4 } from 'uuid';

export function migrateLegacySeeds(legacySeeds: LegacySeed[]): AdvancedSeed[] {
  return legacySeeds.map((seed, index) => {
    // Parse meta information
    const metaParts = seed.meta.split(' – ');
    const timeMatch = metaParts[0]?.match(/(\d+)m/);
    const ttl = timeMatch ? parseInt(timeMatch[1]) : 30;
    const severityText = metaParts[1]?.toLowerCase() || 'normaal';
    
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (severityText.includes('laag')) severity = 'low';
    else if (severityText.includes('hoog')) severity = 'high';
    else if (severityText.includes('kritiek')) severity = 'critical';

    // Determine type based on label
    let type: AdvancedSeed['type'] = 'validation';
    if (seed.label === 'Reflectievraag') type = 'reflection';
    else if (seed.label === 'Suggestie') type = 'suggestion';

    return {
      id: uuidv4(),
      emotion: seed.emotion,
      type,
      label: seed.label,
      triggers: seed.triggers,
      response: {
        nl: seed.response
      },
      context: {
        severity,
        situation: 'therapy'
      },
      meta: {
        priority: index + 1,
        ttl,
        weight: 1.0,
        confidence: 0.8,
        usageCount: 0
      },
      tags: [seed.emotion, seed.label.toLowerCase()],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      isActive: true,
      version: '1.0.0'
    };
  });
}

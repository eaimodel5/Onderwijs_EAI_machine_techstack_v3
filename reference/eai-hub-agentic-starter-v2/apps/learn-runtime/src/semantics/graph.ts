/**
 * EvAI v16 - Semantic Knowledge Graph
 * Lichtgewicht ontologie voor emotions, interventions en relaties
 * Later uitbreidbaar naar RDF/OWL als nodig
 */

/**
 * 🎭 Core Emotion Concepts
 * Nederlandse emoties die EvAI herkent en behandelt
 */
export const Concepts = {
  Emotion: [
    'verdriet',
    'angst',
    'boosheid',
    'vreugde',
    'stress',
    'eenzaamheid',
    'onzekerheid',
    'blijdschap',
    'trots',
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
  ] as const,

  /**
   * 💡 Therapeutische Interventies
   * Acties die EvAI kan inzetten
   */
  Intervention: [
    'valideren',          // Bevestigen van gevoelens
    'normaliseren',       // Universaliseren van ervaring
    'reflectievraag',     // Verdieping zoeken
    'psycho-educatie',    // Uitleg/informatie geven
    'coping-suggestie',   // Concrete handvatten bieden
    'verwijzing',         // Doorverwijzen naar hulp
    'veiligheid',         // Safety planning
    'empathie',           // Emotionele afstemming
    'herkaderen',         // Perspectief verschuiving
    'grounding'           // Mindfulness/grounding
  ] as const,

  /**
   * 🚫 Contra-indicaties
   * Interventies die NIET mogen in bepaalde situaties
   */
  Contra: [
    'zelfhulpVerbodenBijCrisis',
    'reflectieVerbodenBijLageCoping',
    'suggestieVerbodenBijHighDistress',
    'confrontatieVerbodenBijTrauma'
  ] as const
} as const;

export type EmotionType = typeof Concepts.Emotion[number];
export type InterventionType = typeof Concepts.Intervention[number];
export type ContraType = typeof Concepts.Contra[number];

/**
 * 🔗 Knowledge Graph Edge
 * Relatie tussen concepten met weight
 */
export interface Edge {
  from: string;
  to: string;
  rel: 'helps' | 'contra' | 'requires' | 'triggers' | 'compatible';
  weight?: number;
  context?: string;
}

/**
 * 📊 Knowledge Graph Edges
 * Semantische relaties tussen emoties en interventies
 */
export const Edges: Edge[] = [
  // VERDRIET interventies
  { from: 'verdriet', to: 'valideren', rel: 'helps', weight: 0.95, context: 'Primaire interventie' },
  { from: 'verdriet', to: 'empathie', rel: 'helps', weight: 0.90 },
  { from: 'verdriet', to: 'normaliseren', rel: 'helps', weight: 0.80 },
  { from: 'verdriet', to: 'reflectievraag', rel: 'helps', weight: 0.70 },

  // ANGST interventies
  { from: 'angst', to: 'psycho-educatie', rel: 'helps', weight: 0.85 },
  { from: 'angst', to: 'grounding', rel: 'helps', weight: 0.90 },
  { from: 'angst', to: 'valideren', rel: 'helps', weight: 0.85 },
  { from: 'angst', to: 'coping-suggestie', rel: 'helps', weight: 0.75 },

  // BOOSHEID interventies
  { from: 'boosheid', to: 'valideren', rel: 'helps', weight: 0.90 },
  { from: 'boosheid', to: 'normaliseren', rel: 'helps', weight: 0.80 },
  { from: 'boosheid', to: 'grounding', rel: 'helps', weight: 0.75 },
  { from: 'boosheid', to: 'reflectievraag', rel: 'helps', weight: 0.70 },

  // STRESS interventies
  { from: 'stress', to: 'grounding', rel: 'helps', weight: 0.90 },
  { from: 'stress', to: 'coping-suggestie', rel: 'helps', weight: 0.85 },
  { from: 'stress', to: 'psycho-educatie', rel: 'helps', weight: 0.75 },

  // EENZAAMHEID interventies
  { from: 'eenzaamheid', to: 'valideren', rel: 'helps', weight: 0.90 },
  { from: 'eenzaamheid', to: 'empathie', rel: 'helps', weight: 0.85 },
  { from: 'eenzaamheid', to: 'coping-suggestie', rel: 'helps', weight: 0.75 },

  // ONZEKERHEID interventies
  { from: 'onzekerheid', to: 'valideren', rel: 'helps', weight: 0.85 },
  { from: 'onzekerheid', to: 'normaliseren', rel: 'helps', weight: 0.80 },
  { from: 'onzekerheid', to: 'reflectievraag', rel: 'helps', weight: 0.75 },

  // POSITIEVE EMOTIES
  { from: 'vreugde', to: 'valideren', rel: 'helps', weight: 0.90 },
  { from: 'blijdschap', to: 'valideren', rel: 'helps', weight: 0.90 },
  { from: 'trots', to: 'valideren', rel: 'helps', weight: 0.95 },

  // CONTRA-INDICATIES
  { from: 'zelfhulpVerbodenBijCrisis', to: 'coping-suggestie', rel: 'contra', weight: 1.0 },
  { from: 'reflectieVerbodenBijLageCoping', to: 'reflectievraag', rel: 'contra', weight: 0.9 },
  { from: 'suggestieVerbodenBijHighDistress', to: 'coping-suggestie', rel: 'contra', weight: 0.85 }
];

/**
 * 💡 Suggereer interventies voor een emotie
 * Retourneert gesorteerde lijst van interventies met weight
 */
export function suggestInterventions(
  emotion: string,
  minWeight: number = 0.7
): Array<{ intervention: string; weight: number; context?: string }> {
  const emotionLower = emotion.toLowerCase();
  
  return Edges
    .filter(e => 
      e.from.toLowerCase() === emotionLower && 
      e.rel === 'helps' &&
      (e.weight ?? 0) >= minWeight
    )
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
    .map(e => ({
      intervention: e.to,
      weight: e.weight ?? 0,
      context: e.context
    }));
}

/**
 * 🚫 Check contra-indicaties voor een interventie
 * Retourneert lijst van contra's die van toepassing zijn
 */
export function checkContraIndications(
  intervention: string,
  context: {
    crisis: number;
    coping: number;
    distress: number;
  }
): string[] {
  const contras: string[] = [];

  // Crisis-gerelateerde contra's
  if (context.crisis > 80) {
    const crisisContras = Edges
      .filter(e => 
        e.from === 'zelfhulpVerbodenBijCrisis' &&
        e.to === intervention &&
        e.rel === 'contra'
      );
    if (crisisContras.length > 0) {
      contras.push('Crisis level te hoog voor deze interventie');
    }
  }

  // Coping-gerelateerde contra's
  if (context.coping < 20 && intervention === 'reflectievraag') {
    contras.push('Coping level te laag voor reflectie');
  }

  // Distress-gerelateerde contra's
  if (context.distress > 70 && intervention === 'coping-suggestie') {
    contras.push('Distress level te hoog voor suggesties');
  }

  return contras;
}

/**
 * 🎯 Filter allowed interventions op basis van context
 * Retourneert alleen interventies die veilig zijn in deze situatie
 */
export function getAllowedInterventions(
  emotion: string,
  context: {
    crisis: number;
    coping: number;
    distress: number;
  }
): InterventionType[] {
  const suggested = suggestInterventions(emotion);
  
  return suggested
    .filter(s => {
      const contras = checkContraIndications(s.intervention, context);
      return contras.length === 0;
    })
    .map(s => s.intervention) as InterventionType[];
}

/**
 * 🔍 Zoek gerelateerde emoties
 * Vindt emoties die vergelijkbare interventies hebben
 */
export function findRelatedEmotions(
  emotion: string,
  minSimilarity: number = 0.6
): string[] {
  const emotionInterventions = suggestInterventions(emotion);
  const emotionSet = new Set(emotionInterventions.map(i => i.intervention));

  const relatedScores = new Map<string, number>();

  // Bereken overlap met andere emoties
  for (const otherEmotion of Concepts.Emotion) {
    if (otherEmotion === emotion) continue;

    const otherInterventions = suggestInterventions(otherEmotion);
    const otherSet = new Set(otherInterventions.map(i => i.intervention));

    // Jaccard similarity
    const intersection = [...emotionSet].filter(i => otherSet.has(i)).length;
    const union = new Set([...emotionSet, ...otherSet]).size;
    const similarity = union > 0 ? intersection / union : 0;

    if (similarity >= minSimilarity) {
      relatedScores.set(otherEmotion, similarity);
    }
  }

  return Array.from(relatedScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([e]) => e);
}

/**
 * 📊 Graph statistieken
 */
export function getGraphStats() {
  return {
    emotions: Concepts.Emotion.length,
    interventions: Concepts.Intervention.length,
    contras: Concepts.Contra.length,
    edges: Edges.length,
    avgInterventionsPerEmotion: Edges.filter(e => e.rel === 'helps').length / Concepts.Emotion.length
  };
}

/**
 * 🧪 Export voor testing
 */
export function testSemanticGraph() {
  console.log('🧪 Testing Semantic Graph...');
  console.log('Stats:', getGraphStats());
  console.log('Verdriet interventions:', suggestInterventions('verdriet'));
  console.log('Angst interventions:', suggestInterventions('angst'));
  console.log('Related to verdriet:', findRelatedEmotions('verdriet'));
}

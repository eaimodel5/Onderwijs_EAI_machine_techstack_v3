
import { useRubricSettings } from './useRubricSettings';

export interface EvAI56Rubric {
  id: string;
  name: string;
  description: string;
  category: "emotional" | "cognitive" | "behavioral" | "interpersonal";
  riskFactors: string[];
  protectiveFactors: string[];
  interventions: string[];
  scoreWeights: {
    risk: number;
    protective: number;
  };
}

// EvAI 5.6 Rubrics - Enhanced with broader vocabulary for better matching
export const evai56Rubrics: EvAI56Rubric[] = [
  {
    id: "emotional-regulation",
    name: "Emotionele Regulatie",
    description: "Vermogen om emoties te herkennen, begrijpen en reguleren",
    category: "emotional",
    riskFactors: [
      "overweldigd", "overweldigende emoties", "paniek", "paniekerig", "woede", "boos", "kwaad",
      "gefrustreerd", "opvliegend", "emotionele labiliteit", "verlies van controle",
      "extreme gevoelens", "kan het niet aan", "te veel", "chaos", "stress", "gestrest",
      "zenuwachtig", "angstig", "bang", "trillen", "hartkloppingen", "ademnood"
    ],
    protectiveFactors: [
      "bewust van emoties", "kan mijn gevoelens benoemen", "zelfregulatie",
      "mindfulness", "ademhalingsoefening", "emotioneel stabiel", "rustig blijven",
      "het een plek geven", "kalm", "ontspannen", "in balans", "sereen"
    ],
    interventions: [
      "Emotieregulatie technieken aanleren",
      "Mindfulness oefeningen",
      "Cognitieve herstructurering",
      "Grounding technieken"
    ],
    scoreWeights: { risk: 1.2, protective: 0.8 }
  },
  {
    id: "self-awareness",
    name: "Zelfbewustzijn",
    description: "Inzicht in eigen gedachten, gevoelens en gedragingen",
    category: "cognitive",
    riskFactors: [
      "geen inzicht", "ontkenning", "zelfverwijt", "negatief zelfbeeld", "niets waard",
      "perfectionistisch", "zelfkritiek", "strenge innerlijke criticus", "ik faal",
      "waardeloos", "incompetent", "nutteloos", "dom", "slecht", "verkeerd"
    ],
    protectiveFactors: [
      "zelfkennis", "reflecteer", "reflectie", "acceptatie", "realistisch zelfbeeld",
      "groei mindset", "zelfcompassie", "lief voor mezelf zijn", "begrijp mezelf",
      "eerlijk tegen mezelf", "zelfbewust", "introspectie"
    ],
    interventions: [
      "Zelfobservatie opdrachten",
      "Reflectieve gesprekken",
      "Journaling",
      "Metacognitieve training"
    ],
    scoreWeights: { risk: 1.0, protective: 1.0 }
  },
  {
    id: "coping-strategies",
    name: "Copingstrategieën",
    description: "Effectieve strategieën voor omgang met stress en uitdagingen",
    category: "behavioral",
    riskFactors: [
      "vermijden", "ontsnappen", "destructieve coping", "isoleren", "isoleer me",
      "zelfmedicatie", "te veel drinken", "te veel eten", "niets doen", "passief",
      "procrastineren", "uitstellen", "vluchten", "wegrennen", "opgeven"
    ],
    protectiveFactors: [
      "problemen oplossen", "hulp gezocht", "hulp vragen", "sociale steun",
      "gezonde gewoontes", "actieve coping", "aanpassingsvermogen", "sport",
      "beweging", "creatief", "hobby", "afleiding zoeken", "actie ondernemen"
    ],
    interventions: [
      "Copingstrategieën ontwikkelen",
      "Probleemoplossing training",
      "Stressmanagement",
      "Sociale vaardigheden training"
    ],
    scoreWeights: { risk: 1.1, protective: 0.9 }
  },
  {
    id: "social-connection",
    name: "Sociale Verbinding",
    description: "Kwaliteit van relaties en sociale ondersteuning",
    category: "interpersonal",
    riskFactors: [
      "eenzaam", "alleen voelen", "sociale angst", "conflicten", "ruzies", "isolatie",
      "geen steun", "relatieproblemen", "niemand begrijpt me", "afgewezen",
      "buitengesloten", "onbegrepen", "ruzie", "verbroken relatie", "geen vrienden"
    ],
    protectiveFactors: [
      "ondersteunende relaties", "goede vrienden", "empathie", "goede communicatie",
      "vertrouwen", "betrokkenheid", "intimiteit", "steun van partner", "familie",
      "verbonden", "begrepen", "geaccepteerd", "geliefd", "waardering"
    ],
    interventions: [
      "Sociale vaardigheden training",
      "Communicatie training",
      "Relatiewerk",
      "Groepstherapie"
    ],
    scoreWeights: { risk: 0.9, protective: 1.1 }
  },
  {
    id: "meaning-purpose",
    name: "Betekenis & Doel",
    description: "Gevoel van richting en betekenis in het leven",
    category: "cognitive",
    riskFactors: [
      "zinloos", "leeg gevoel", "doelloos", "existentiële crisis", "geen motivatie",
      "hopeloos", "geen toekomst zien", "nutteloos bestaan", "geen richting",
      "verloren", "geen doel", "verveling", "apathie", "gedemotiveerd"
    ],
    protectiveFactors: [
      "levensdoel", "mijn waarden", "zingeving", "spiritualiteit", "hoopvol",
      "toekomstperspectief", "betekenisvolle activiteiten", "dankbaarheid",
      "passie", "gedreven", "gemotiveerd", "inspiratie", "doelgericht"
    ],
    interventions: [
      "Waardenverheldering",
      "Doelgerichte planning",
      "Betekenistherapie",
      "Spirituele exploratie"
    ],
    scoreWeights: { risk: 1.0, protective: 1.2 }
  }
];

export interface RubricAssessment {
  rubricId: string;
  riskScore: number;
  protectiveScore: number;
  overallScore: number;
  triggers: string[];
  timestamp: Date;
}

export function useEvAI56Rubrics() {
  const { config } = useRubricSettings();

  const synonymMap: Record<string, string[]> = {
    overweldigende: ["overweldigend"],
    overweldigend: ["overweldigende"],
    boos: ["kwaad", "woedend"],
    kwaad: ["boos", "woedend"],
    eenzaam: ["alleen"],
    alleen: ["eenzaam"],
    gestrest: ["stress"],
    stress: ["gestrest"]
  };

  const tokenize = (text: string): string[] =>
    text.toLowerCase().match(/[\p{L}\d']+/gu) || [];

  const wordMatches = (word: string, tokens: Set<string>): boolean => {
    if (tokens.has(word)) return true;
    const syns = synonymMap[word] || [];
    return syns.some(s => tokens.has(s));
  };

  const factorMatches = (factor: string, tokens: Set<string>): boolean => {
    const words = tokenize(factor);
    
    // Apply strictness level logic based on current configuration
    switch (config.level) {
      case 'strict':
        // Strict mode: require all words in a factor to match for higher precision
        return words.every(w => wordMatches(w, tokens));
      
      case 'moderate':
        // Moderate mode: require at least half of the words to match
        const moderateThreshold = Math.ceil(words.length / 2);
        const moderateMatches = words.filter(w => wordMatches(w, tokens)).length;
        return moderateMatches >= moderateThreshold;
      
      case 'flexible':
      default:
        // Flexible mode: any word match is sufficient for broader interpretation
        return words.some(w => wordMatches(w, tokens));
    }
  };

  const assessMessage = (content: string): RubricAssessment[] => {
    const assessments: RubricAssessment[] = [];
    const tokens = new Set(tokenize(content));

    evai56Rubrics.forEach(rubric => {
      const riskTriggers = rubric.riskFactors.filter(factor =>
        factorMatches(factor, tokens)
      );
      const protectiveTriggers = rubric.protectiveFactors.filter(factor =>
        factorMatches(factor, tokens)
      );

      if (riskTriggers.length > 0 || protectiveTriggers.length > 0) {
        // Apply strictness weights from configuration
        const riskScore = riskTriggers.length * rubric.scoreWeights.risk * config.weights.riskMultiplier;
        const protectiveScore = protectiveTriggers.length * rubric.scoreWeights.protective * config.weights.protectiveMultiplier;
        const overallScore = Math.max(0, riskScore - protectiveScore);

        // Only include assessment if it meets the intervention trigger threshold
        if (overallScore >= config.thresholds.interventionTrigger) {
          assessments.push({
            rubricId: rubric.id,
            riskScore,
            protectiveScore,
            overallScore,
            triggers: [...riskTriggers, ...protectiveTriggers],
            timestamp: new Date()
          });
        }
      }
    });

    return assessments;
  };

  const getRubricById = (id: string) => evai56Rubrics.find(r => r.id === id);

  const calculateOverallRisk = (assessments: RubricAssessment[]): number => {
    if (assessments.length === 0) return 0;
    const totalScore = assessments.reduce((sum, a) => sum + a.overallScore, 0);
    const maxPossibleScore = assessments.length * 5; // Assuming max 5 risk factors per rubric
    const riskPercentage = Math.min(100, (totalScore / maxPossibleScore) * 100);
    
    // Apply risk categorization based on strictness configuration
    if (riskPercentage >= config.thresholds.overallRiskHigh) {
      return Math.min(100, riskPercentage * 1.2); // Amplify high risk
    } else if (riskPercentage >= config.thresholds.overallRiskModerate) {
      return riskPercentage;
    } else {
      return Math.max(0, riskPercentage * 0.8); // Dampen low risk
    }
  };

  return {
    evai56Rubrics,
    assessMessage,
    getRubricById,
    calculateOverallRisk,
    config // Expose current configuration for debugging/monitoring
  };
}

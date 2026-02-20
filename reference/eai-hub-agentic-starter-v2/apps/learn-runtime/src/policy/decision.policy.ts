/**
 * EvAI v16 - Neurosymbolic Policy & Rule Engine (Pre-LLM)
 * Deterministisch beslissen WANNEER seeds/templates worden gebruikt
 * en de LLM wordt overgeslagen voor efficiency en controleerbaarheid.
 */

export type Context = {
  rubric: {
    crisis: number;
    distress: number;
    support: number;
    coping: number;
  };
  seed: {
    matchScore: number;
    templateId?: string;
    emotion?: string;
  };
  consent: boolean;
  inputComplexity: {
    length: number;
    isGreeting: boolean;
    isComplex: boolean;
  };
};

export type DecisionType = 
  | 'USE_SEED'              // Direct seed gebruiken (hoogste match)
  | 'TEMPLATE_ONLY'         // Template zonder LLM (lage distress)
  | 'ESCALATE_INTERVENTION' // Crisis interventie (hoog risico)
  | 'LLM_PLANNING'          // LLM inschakelen voor complexe gevallen
  | 'FAST_PATH';            // Snelle response voor greetings

export interface PolicyRule {
  id: string;
  priority: number;
  conditions: (ctx: Context) => boolean;
  action: DecisionType;
  reasoning: string;
}

/**
 * Policy Rules (hoogste prioriteit eerst)
 * BELANGRIJK: Regels worden in volgorde geëvalueerd tot match
 */
const POLICY_RULES: PolicyRule[] = [
  // 🚨 REGEL 1: CRISIS ESCALATIE (hoogste prioriteit)
  {
    id: 'crisis_escalation',
    priority: 100,
    conditions: (ctx) => ctx.rubric.crisis > 80 && ctx.consent,
    action: 'ESCALATE_INTERVENTION',
    reasoning: 'Crisis score > 80 met toestemming vereist directe interventie'
  },

  // ⚡ REGEL 2: FAST PATH voor eenvoudige input
  {
    id: 'fast_path_greeting',
    priority: 90,
    conditions: (ctx) => 
      ctx.inputComplexity.isGreeting && 
      !ctx.inputComplexity.isComplex &&
      ctx.rubric.distress < 50,
    action: 'FAST_PATH',
    reasoning: 'Simple greeting met lage distress -> direct template'
  },

  // 🎯 REGEL 3: HOOGSTE SEED MATCH (zeer hoog vertrouwen)
  {
    id: 'high_seed_match',
    priority: 80,
    conditions: (ctx) => ctx.seed.matchScore >= 0.88,
    action: 'USE_SEED',
    reasoning: 'Seed match >= 88% is voldoende betrouwbaar voor directe response'
  },

  // 📋 REGEL 4: TEMPLATE voor lage distress
  {
    id: 'low_distress_template',
    priority: 70,
    conditions: (ctx) => ctx.rubric.distress < 35 && ctx.seed.matchScore > 0.65,
    action: 'TEMPLATE_ONLY',
    reasoning: 'Lage distress (<35) met redelijke match (>65%) -> template volstaat'
  },

  // 🧠 REGEL 5: LLM voor complexe gevallen (fallback)
  {
    id: 'complex_llm_planning',
    priority: 50,
    conditions: (ctx) => ctx.rubric.distress >= 35 || ctx.inputComplexity.isComplex,
    action: 'LLM_PLANNING',
    reasoning: 'Complexe input of moderate/high distress vereist LLM-analyse'
  }
];

/**
 * 🎯 Pre-LLM Decision Engine
 * Evalueert regels in volgorde van prioriteit en retourneert eerste match
 */
export async function decideNextStep(ctx: Context): Promise<{
  action: DecisionType;
  reasoning: string;
  ruleId: string;
  confidence: number;
}> {
  console.log('🎯 Policy Engine: Evaluating context...', {
    crisis: ctx.rubric.crisis,
    distress: ctx.rubric.distress,
    seedMatch: ctx.seed.matchScore,
    isGreeting: ctx.inputComplexity.isGreeting,
    isComplex: ctx.inputComplexity.isComplex
  });

  // Sorteer regels op prioriteit (hoogste eerst)
  const sortedRules = [...POLICY_RULES].sort((a, b) => b.priority - a.priority);

  // Evalueer elke regel tot match
  for (const rule of sortedRules) {
    try {
      if (rule.conditions(ctx)) {
        // Bereken confidence op basis van rule priority en context
        const confidence = calculateRuleConfidence(rule, ctx);
        
        console.log(`✅ Policy Rule Match: ${rule.id}`, {
          action: rule.action,
          priority: rule.priority,
          confidence: Math.round(confidence * 100) + '%',
          reasoning: rule.reasoning
        });

        return {
          action: rule.action,
          reasoning: rule.reasoning,
          ruleId: rule.id,
          confidence
        };
      }
    } catch (error) {
      console.error(`❌ Policy rule evaluation error (${rule.id}):`, error);
      // Continue naar volgende regel bij error
    }
  }

  // Fallback naar LLM als geen regel matcht
  console.log('⚠️ No policy rule matched, defaulting to LLM_PLANNING');
  return {
    action: 'LLM_PLANNING',
    reasoning: 'Geen regel match gevonden, fallback naar LLM',
    ruleId: 'fallback',
    confidence: 0.5
  };
}

/**
 * Bereken confidence score voor een regel op basis van context
 */
function calculateRuleConfidence(rule: PolicyRule, ctx: Context): number {
  let confidence = 0.7; // Base confidence

  switch (rule.action) {
    case 'USE_SEED':
      // Confidence gebaseerd op seed match score
      confidence = Math.min(0.95, ctx.seed.matchScore + 0.1);
      break;
    
    case 'ESCALATE_INTERVENTION':
      // Crisis interventie heeft hoge confidence
      confidence = 0.95;
      break;
    
    case 'TEMPLATE_ONLY':
      // Template confidence afhankelijk van distress
      confidence = 0.8 - (ctx.rubric.distress / 100) * 0.2;
      break;
    
    case 'FAST_PATH':
      // Fast path heeft matige confidence
      confidence = 0.75;
      break;
    
    case 'LLM_PLANNING':
      // LLM planning confidence afhankelijk van complexiteit
      confidence = ctx.inputComplexity.isComplex ? 0.85 : 0.7;
      break;
  }

  return Math.max(0.5, Math.min(0.95, confidence));
}

/**
 * 🔍 Verklaar beslissing (voor transparantie)
 */
export function explainDecision(
  decision: { action: DecisionType; reasoning: string; ruleId: string; confidence: number },
  ctx: Context
): string[] {
  const explanation = [
    `🎯 POLICY DECISION: ${decision.action}`,
    `📋 Rule: ${decision.ruleId} (confidence: ${Math.round(decision.confidence * 100)}%)`,
    `💡 Reasoning: ${decision.reasoning}`,
    ``,
    `📊 Context:`,
    `  • Crisis: ${ctx.rubric.crisis}/100`,
    `  • Distress: ${ctx.rubric.distress}/100`,
    `  • Seed Match: ${Math.round(ctx.seed.matchScore * 100)}%`,
    `  • Input: ${ctx.inputComplexity.isGreeting ? 'greeting' : 'complex'}`,
  ];

  return explanation;
}

/**
 * 🧪 Test of een specifieke regel zou matchen (voor testing)
 */
export function testRule(ruleId: string, ctx: Context): boolean {
  const rule = POLICY_RULES.find(r => r.id === ruleId);
  if (!rule) {
    throw new Error(`Rule ${ruleId} not found`);
  }
  return rule.conditions(ctx);
}

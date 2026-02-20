import type { LearnState, TurnContext } from './educationStateMachine';

export type Strategy =
  | 'ASK_QUESTION'
  | 'PARTIAL_EXPLANATION'
  | 'WORKED_EXAMPLE'
  | 'ERROR_ANALYSIS'
  | 'REFLECTION_PROMPT';

export interface StrategyDecision {
  strategy: Strategy;
  reasons: string[];
}

const AI_DOMINANCE_FLAGS = new Set([
  'AI_DOMINANCE',
  'TD_DOMINANCE',
  'COREG_AI_DOMINANCE'
]);

export function decideStrategy(ctx: TurnContext): StrategyDecision {
  const reasons: string[] = [];

  const pBand = ctx.pBandId ?? 'UNKNOWN';
  const tdFlag = ctx.tdFlagId;
  const cFlag = ctx.cFlagId;

  const isEarlyPhase =
    !pBand ||
    pBand.startsWith('P_Procesfase_1') ||
    pBand.startsWith('P_Procesfase_2');

  const hasAIDominance =
    (tdFlag && AI_DOMINANCE_FLAGS.has(tdFlag)) ||
    (cFlag && AI_DOMINANCE_FLAGS.has(cFlag));

  // 1. Reflectie-fase heeft voorrang
  if (ctx.state === 'S6_REFLECT') {
    reasons.push('State is S6_REFLECT → reflection prompt');
    return { strategy: 'REFLECTION_PROMPT', reasons };
  }

  // 2. Voorkennis-fase: voorkom uitleg, stel vragen
  if (isEarlyPhase) {
    reasons.push('P-band in fase 1/2 → voorkennis activeren, geen volledige uitleg');
    return { strategy: 'ASK_QUESTION', reasons };
  }

  // 3. AI-dominantie: geen volledige worked examples
  if (hasAIDominance) {
    reasons.push('TD/C-flag wijst op AI-dominantie → geen worked example');
    return { strategy: 'ERROR_ANALYSIS', reasons };
  }

  // 4. Normale hint-fase: gedeeltelijke uitleg of worked example
  if (ctx.state === 'S5_HINT') {
    reasons.push('State S5_HINT zonder AI-dominantie → partial explanation');
    return { strategy: 'PARTIAL_EXPLANATION', reasons };
  }

  // 5. Default: vraaggestuurde aanpak
  reasons.push('Default → vraaggestuurde strategie');
  return { strategy: 'ASK_QUESTION', reasons };
}

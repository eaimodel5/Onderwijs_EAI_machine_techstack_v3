import type { BandConfig } from './eaiRubricsConfig';

export type LearnState = 'S0_OPEN' | 'S2_CONTEXT' | 'S5_HINT' | 'S6_REFLECT';

export interface TurnContext {
  state: LearnState;
  pBandId: string | null;
  tdFlagId: string | null;
  cFlagId: string | null;
  turnIndex: number;
}

export function mapPBandToAllowedStates(pBandId: string | null): LearnState[] {
  if (!pBandId) return ['S0_OPEN', 'S2_CONTEXT'];
  if (pBandId.startsWith('P_Procesfase_1') || pBandId.startsWith('P_Procesfase_2')) {
    return ['S0_OPEN', 'S2_CONTEXT'];
  }
  if (pBandId.startsWith('P_Procesfase_3')) {
    return ['S2_CONTEXT', 'S5_HINT'];
  }
  // P_4/P_5 and higher: allow hint + reflect
  return ['S5_HINT', 'S6_REFLECT'];
}

export function nextState(current: LearnState, event: { type: 'USER_TURN' | 'AI_HINT_DONE' | 'REFLECTION_DONE'; context: TurnContext }): LearnState {
  const allowed = mapPBandToAllowedStates(event.context.pBandId);

  switch (event.type) {
    case 'USER_TURN': {
      // On user input, if we're still in open/context we stay there; otherwise we go to hint.
      if (allowed.includes('S2_CONTEXT') && (current === 'S0_OPEN' || current === 'S2_CONTEXT')) {
        return 'S2_CONTEXT';
      }
      if (allowed.includes('S5_HINT')) {
        return 'S5_HINT';
      }
      return current;
    }
    case 'AI_HINT_DONE': {
      // After a hint, if reflection is allowed, move there.
      if (allowed.includes('S6_REFLECT')) {
        return 'S6_REFLECT';
      }
      return current;
    }
    case 'REFLECTION_DONE': {
      // After reflection, go back to context for a new cycle.
      if (allowed.includes('S2_CONTEXT')) {
        return 'S2_CONTEXT';
      }
      return 'S0_OPEN';
    }
    default:
      return current;
  }
}

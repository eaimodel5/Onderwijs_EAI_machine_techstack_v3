import type { LearnState, TurnContext } from './educationStateMachine';
import { nextState } from './educationStateMachine';
import { decideStrategy } from './educationPolicy';

export interface EducationTurnInput {
  userMessage: string;
  previousState?: LearnState;
  pBandId: string | null;
  tdFlagId: string | null;
  cFlagId: string | null;
  turnIndex: number;
}

export interface EducationTurnDecision {
  nextState: LearnState;
  strategy: string;
  reasons: string[];
}

/**
 * Pure decision function that can be called from the EvAI orchestrator.
 * It does not call the LLM itself; it just decides HOW the LLM should respond.
 */
export function runEducationTurn(input: EducationTurnInput): EducationTurnDecision {
  const currentState: LearnState = input.previousState ?? 'S0_OPEN';

  const ctx: TurnContext = {
    state: currentState,
    pBandId: input.pBandId,
    tdFlagId: input.tdFlagId,
    cFlagId: input.cFlagId,
    turnIndex: input.turnIndex
  };

  const userEvent = { type: 'USER_TURN' as const, context: ctx };
  const next = nextState(currentState, userEvent);

  const decision = decideStrategy({ ...ctx, state: next });

  return {
    nextState: next,
    strategy: decision.strategy,
    reasons: decision.reasons
  };
}

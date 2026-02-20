import express from 'express';
import { runEducationTurn, type EducationTurnInput } from '@/domains/education/educationRuntime';

const router = express.Router();

router.post('/education/session/:id/turn', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const body = req.body as {
      userMessage: string;
      previousState?: string;
      pBandId?: string | null;
      tdFlagId?: string | null;
      cFlagId?: string | null;
      turnIndex?: number;
    };

    const input: EducationTurnInput = {
      userMessage: body.userMessage,
      previousState: (body.previousState as any) ?? 'S0_OPEN',
      pBandId: body.pBandId ?? null,
      tdFlagId: body.tdFlagId ?? null,
      cFlagId: body.cFlagId ?? null,
      turnIndex: body.turnIndex ?? 0
    };

    const decision = runEducationTurn(input);

    res.json({
      sessionId,
      decision
    });
  } catch (err: any) {
    console.error('Error in /education/session/:id/turn', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

export type MasteryUpdate = {
  userId: string;
  pathId: string;
  currentNodeId: string | null;
  status: 'INTRO' | 'WORKING' | 'CHECKING' | 'MASTERED';
  evidence?: {
    nodeId: string;
    evidence: string;
    score?: number;
  };
};

export const fetchMastery = async (userId: string, pathId?: string) => {
  return { items: [] }; 
};

export const updateMastery = async (payload: MasteryUpdate) => {
  return { ok: true }; 
};
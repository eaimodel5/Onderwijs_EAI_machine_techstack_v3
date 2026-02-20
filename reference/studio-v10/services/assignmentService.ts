export type AssignmentInput = {
  classId?: string | null;
  studentId?: string | null;
  pathId: string;
  dueAt?: number | null;
};

export const createAssignment = async (payload: AssignmentInput) => {
  return { assignment: { id: 'mock-id', ...payload, createdAt: Date.now() } };
};

export const listAssignments = async (params: { classId?: string; studentId?: string } = {}) => {
  return { assignments: [] };
};
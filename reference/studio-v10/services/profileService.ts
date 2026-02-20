import { LearnerProfile } from '../types';

const PROFILE_KEY = 'eai_learner_profile';

export const fetchProfile = async (userId: string): Promise<{ userId: string; profile: LearnerProfile | null }> => {
  const stored = localStorage.getItem(`${PROFILE_KEY}_${userId}`);
  return { userId, profile: stored ? JSON.parse(stored) : null };
};

export const updateProfile = async (userId: string, profile: LearnerProfile, consentScopes: string[] = []) => {
  localStorage.setItem(`${PROFILE_KEY}_${userId}`, JSON.stringify(profile));
  return { ok: true };
};
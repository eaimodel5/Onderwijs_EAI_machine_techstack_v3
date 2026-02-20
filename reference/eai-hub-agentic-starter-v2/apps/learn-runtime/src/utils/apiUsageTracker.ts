export type ApiUsageType = 'openai1' | 'openai2' | 'vector' | 'supabase' | 'safety';

const keyMap: Record<ApiUsageType, string> = {
  openai1: 'api_usage_openai1',
  openai2: 'api_usage_openai2',
  vector: 'api_usage_vector',
  supabase: 'api_usage_supabase',
  safety: 'api_usage_safety',
};

export function incrementApiUsage(type: ApiUsageType): void {
  const storageKey = keyMap[type];
  try {
    const current = parseInt(localStorage.getItem(storageKey) || '0', 10);
    localStorage.setItem(storageKey, String(current + 1));
  } catch (e) {
    console.error('Failed to increment API usage', e);
  }
}

export function getSessionApiUsage() {
  return {
    openai1: parseInt(localStorage.getItem(keyMap.openai1) || '0', 10),
    openai2: parseInt(localStorage.getItem(keyMap.openai2) || '0', 10),
    vector: parseInt(localStorage.getItem(keyMap.vector) || '0', 10),
    supabase: parseInt(localStorage.getItem(keyMap.supabase) || '0', 10),
    safety: parseInt(localStorage.getItem(keyMap.safety) || '0', 10),
  };
}


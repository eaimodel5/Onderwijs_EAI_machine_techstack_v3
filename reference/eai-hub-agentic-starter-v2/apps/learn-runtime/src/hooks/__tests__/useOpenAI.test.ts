import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks/server';
import { useOpenAI } from '../useOpenAI';

vi.mock('@/lib/safetyGuard', () => ({
  checkPromptSafety: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock('@/utils/apiUsageTracker', () => ({
  incrementApiUsage: vi.fn(),
}));

describe('useOpenAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws when safety blocks the input', async () => {
    const { checkPromptSafety } = await import('@/lib/safetyGuard');
    const { supabase } = await import('@/integrations/supabase/client');
    const { incrementApiUsage } = await import('@/utils/apiUsageTracker');

    vi.mocked(checkPromptSafety).mockResolvedValueOnce({
      ok: false,
      decision: 'block',
      score: 0,
      flags: ['self-harm'],
      reasons: ['High risk'],
      severity: 'high',
      details: 'High risk input',
    });

    const { result } = renderHook(() => useOpenAI());

    await expect(result.current.detectEmotion('gevaarlijke input', '', undefined, [])).rejects.toThrow('High risk input');

    expect(supabase.functions.invoke).not.toHaveBeenCalled();
    expect(incrementApiUsage).toHaveBeenCalledWith('openai1');
  });

  it('adds review policy instructions when safety returns review', async () => {
    const { checkPromptSafety } = await import('@/lib/safetyGuard');
    const { supabase } = await import('@/integrations/supabase/client');
    const { incrementApiUsage } = await import('@/utils/apiUsageTracker');

    vi.mocked(checkPromptSafety).mockResolvedValueOnce({
      ok: true,
      decision: 'review',
      score: 0.55,
      flags: ['sensitive'],
      reasons: ['Borderline'],
      severity: 'medium',
      details: 'Sensitive content detected',
    });

    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: {
        content: JSON.stringify({
          emotion: 'blij',
          confidence: 0.9,
          response: 'Hoi daar!',
          triggers: ['hoi'],
        }),
      },
      error: null,
    });

    const { result } = renderHook(() => useOpenAI());

    let detection: any;
    await act(async () => {
      detection = await result.current.detectEmotion('gevoelige input', '', undefined, [
        { role: 'user', content: 'Hallo' } as any,
      ]);
    });

    expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);
    const [, invokeArgs] = vi.mocked(supabase.functions.invoke).mock.calls[0];
    const body = invokeArgs?.body as { messages?: Array<any> } | undefined;
    const messages = body?.messages || [];
    expect(messages.filter((msg: any) => msg.role === 'system')).toHaveLength(3);
    expect(messages[2].content).toContain('Aanvullend veiligheidsbeleid');

    expect(detection.emotion).toBe('blij');
    expect(detection.meta).toContain('review/medium');
    expect(incrementApiUsage).toHaveBeenCalledWith('openai1');
  });
});

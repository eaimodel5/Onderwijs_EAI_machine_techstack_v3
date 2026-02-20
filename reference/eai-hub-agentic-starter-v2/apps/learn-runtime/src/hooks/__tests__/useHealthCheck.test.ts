import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

const invokeMock = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: invokeMock
    }
  }
}));

describe('useHealthCheck', () => {
  afterEach(() => {
    invokeMock.mockReset();
  });

  it('surfaces invalid OpenAI key errors in results', async () => {
    const { useHealthCheck } = await import('../useHealthCheck');

    invokeMock.mockResolvedValueOnce({
      data: { ok: true, isValid: false, error: 'Invalid API key' },
      error: null
    });

    const { result } = renderHook(() => useHealthCheck());

    await act(async () => {
      await result.current.runHealthCheck();
    });

    const openAiResult = result.current.results.find(
      ({ component }) => component === 'OpenAI API 1'
    );

    expect(openAiResult).toBeDefined();
    expect(openAiResult?.status).toBe('error');
    expect(openAiResult?.message).toContain('Invalid API key');
  });
});


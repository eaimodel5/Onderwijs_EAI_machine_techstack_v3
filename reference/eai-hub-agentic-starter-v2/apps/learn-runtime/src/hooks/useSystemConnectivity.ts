
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { testSupabaseConnection } from '@/integrations/supabase/client';

export type ApiConfigStatus = 'configured' | 'missing' | 'checking';
export type DbStatus = 'connected' | 'error' | 'checking';

export interface SystemConnectivityStatus {
  supabase: DbStatus;
  openaiApi1: ApiConfigStatus; // primary
  browserML: ApiConfigStatus; // browser transformers
  vectorApi: ApiConfigStatus;
}

export function useSystemConnectivity() {
  const [status, setStatus] = useState<SystemConnectivityStatus>({
    supabase: 'checking',
    openaiApi1: 'checking',
    browserML: 'checking',
    vectorApi: 'checking',
  });
  const [isChecking, setIsChecking] = useState(true);

  const runChecks = useCallback(async () => {
    setIsChecking(true);

    // Check Supabase DB
    let supabaseState: DbStatus = 'checking';
    try {
      const res = await testSupabaseConnection();
      supabaseState = res.success ? 'connected' : 'error';
    } catch {
      supabaseState = 'error';
    }

    // Check OpenAI primary via lightweight validator function
    let openai1: ApiConfigStatus = 'checking';
    try {
      const { data, error } = await supabase.functions.invoke('evai-admin', {
        body: { operation: 'test-openai-key' }
      });
      if (error) {
        openai1 = 'missing';
      } else {
        const ok = (data as { isValid?: boolean })?.isValid === true;
        openai1 = ok ? 'configured' : 'missing';
      }
    } catch {
      openai1 = 'missing';
    }

    // Check Browser ML (always available, no API key needed)
    const browserML: ApiConfigStatus = 'configured';
    console.log('✅ Browser ML: Always available (WebGPU/WASM)');

    // Check embeddings/vector by invoking the embedding function with tiny input
    let vector: ApiConfigStatus = 'checking';
    try {
      const { data, error } = await supabase.functions.invoke('evai-core', {
        body: { operation: 'embedding', input: 'ping', model: 'text-embedding-3-small' },
      });
      if (error) {
        vector = 'missing';
      } else {
        vector = (data as { embedding?: unknown })?.embedding ? 'configured' : 'missing';
      }
    } catch {
      vector = 'missing';
    }

    setStatus({
      supabase: supabaseState,
      openaiApi1: openai1,
      browserML: browserML,
      vectorApi: vector,
    });
    setIsChecking(false);
  }, []);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  return { status, isChecking, refresh: runChecks };
}

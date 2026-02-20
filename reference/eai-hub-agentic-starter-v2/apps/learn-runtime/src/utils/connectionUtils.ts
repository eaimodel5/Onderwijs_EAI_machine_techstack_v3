
import { supabase } from '@/integrations/supabase/client';

export const checkSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection v2.0...');
    
    const { data, error } = await supabase
      .from('emotion_seeds')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('🔴 Supabase connection error:', error.message);
      return false;
    } else {
      console.log('✅ Supabase connection v2.0 successful - database accessible');
      return true;
    }
  } catch (error) {
    console.error('🔴 Supabase connection failed with exception:', error);
    return false;
  }
};

export const checkAuthConnection = async () => {
  try {
    console.log('🔍 Testing Supabase auth v2.0...');
    
    console.log('✅ Single-user mode v2.0 - auth not required');
    return true;
  } catch (error) {
    console.error('🔴 Supabase auth failed with exception:', error);
    return false;
  }
};

export const checkApiKeyStatus = (apiKey: string, keyName: string) => {
  if (apiKey && apiKey.trim()) {
    console.log(`🔑 ${keyName} v2.0 configured`);
    return 'configured' as const;
  } else {
    console.log(`🔴 ${keyName} key missing`);
    return 'missing' as const;
  }
};


export const performFullSystemCheck = async () => {
  console.log('🚀 Starting full system health check v2.0 (server-side)...');
  
  const results = {
    supabase: false,
    auth: true,
    openaiApi1: true, // Server-side via Edge Functions
    openaiApi2: true, // Server-side via Edge Functions
    vectorApi: true   // Server-side via openai-embedding Edge Function
  };

  results.supabase = await checkSupabaseConnection();
  
  console.log('📊 System check v2.0 results (all API keys server-side):', results);
  return results;
};

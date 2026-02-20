
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'
import { incrementApiUsage } from '@/utils/apiUsageTracker'

const supabaseUrl = 'https://ngcyfbstajfcfdhlelbz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nY3lmYnN0YWpmY2ZkaGxlbGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDcsImV4cCI6MjA2NDYzODk0N30.MkZRcC_HGNTZW3hUvFiNmHY5Px9FPvRmnzAiKTWi9e4'

const trackedFetch: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  incrementApiUsage('supabase')
  return fetch(input, init)
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  global: { fetch: trackedFetch }
})

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('emotion_seeds')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('🔴 Supabase connection error:', error.message);
      return { success: false, error: error.message };
    } else {
      console.log('✅ Supabase connection successful');
      return { success: true, data };
    }
  } catch (error) {
    console.error('🔴 Supabase connection failed:', error);
    return { success: false, error: (error as Error).message };
  }
};

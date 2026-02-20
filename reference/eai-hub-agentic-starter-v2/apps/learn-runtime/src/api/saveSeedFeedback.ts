
import { supabase } from '@/integrations/supabase/client'

const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function saveSeedFeedback(seedId: string, rating: 'up' | 'down', notes = '') {
  console.log('💾 Saving seed feedback with anonymous user:', seedId, rating);
  
  try {
    const { error } = await supabase
      .from('seed_feedback')
      .insert({
        seed_id: seedId,
        rating,
        notes,
        created_at: new Date().toISOString(),
        user_id: ANONYMOUS_USER_ID,
      });

    if (error) {
      console.error('❌ Error saving seed feedback:', error);
      throw error;
    }

    console.log('✅ Seed feedback saved successfully');
  } catch (error) {
    console.error('🔴 Failed to save seed feedback:', error);
    throw error;
  }
}

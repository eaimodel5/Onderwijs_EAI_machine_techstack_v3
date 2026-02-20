// Regisseur Reflectie - Historical self-reflection via vector memories
// The "Regisseur" acts as EVAI's ethical conscience

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReflectiveAdvice } from '@/types/eaa';

/**
 * Reflects on historical behavior via vector embeddings
 * Returns advice based on past agency patterns
 */
export async function reflectOnHistory(
  input: string,
  supabaseClient: SupabaseClient,
  options?: {
    similarityThreshold?: number;
    maxResults?: number;
  }
): Promise<ReflectiveAdvice> {
  const { similarityThreshold = 0.3, maxResults = 5 } = options || {};
  
  try {
    // Search for similar past interactions
    const { data: memories, error } = await supabaseClient.rpc(
      'search_unified_knowledge',
      {
        query_text: input,
        query_embedding: null, // Text-only search for now
        similarity_threshold: similarityThreshold,
        max_results: maxResults
      }
    );
    
    if (error) {
      console.error('❌ Regisseur: Error fetching memories:', error);
      return {
        advice: 'Geen precedent beschikbaar',
        reason: 'Database error',
        avgAgency: 0.5
      };
    }
    
    if (!memories || memories.length === 0) {
      return {
        advice: 'Geen historische context gevonden',
        reason: 'Geen vergelijkbare interacties in geheugen',
        avgAgency: 0.5,
        historicalContext: []
      };
    }
    
    // Extract agency from metadata (if available)
    const agencyScores = memories
      .map((m: any) => m.metadata?.eaa?.agency || m.confidence_score || 0.5)
      .filter((score: number) => score > 0);
    
    const avgAgency = agencyScores.length > 0
      ? agencyScores.reduce((a: number, b: number) => a + b, 0) / agencyScores.length
      : 0.5;
    
    // Generate advice based on historical patterns
    let advice = 'Reflectie toegestaan';
    let reason = 'Historische agency stabiel';
    
    if (avgAgency < 0.4) {
      advice = 'Vermijd sturende interventies';
      reason = 'Lage agency in vergelijkbare gevallen';
    } else if (avgAgency < 0.5) {
      advice = 'Gebruik reflectieve benadering';
      reason = 'Gemiddelde agency in historische context';
    } else if (avgAgency > 0.7) {
      advice = 'Suggestie mogelijk';
      reason = 'Hoge agency in vergelijkbare situaties';
    }
    
    const historicalContext = memories
      .slice(0, 3)
      .map((m: any) => `${m.emotion} (${m.content_type})`);
    
    return {
      advice,
      reason,
      avgAgency,
      historicalContext
    };
    
  } catch (err) {
    console.error('❌ Regisseur: Unexpected error:', err);
    return {
      advice: 'Fallback naar reflectie',
      reason: 'Error in historical analysis',
      avgAgency: 0.5
    };
  }
}

/**
 * Store reflective decision for future learning
 */
export async function storeReflectiveMemory(
  supabaseClient: SupabaseClient,
  input: string,
  response: string,
  eaaProfile: { ownership: number; autonomy: number; agency: number },
  strategy: string
): Promise<void> {
  try {
    await supabaseClient.rpc('log_reflection_event', {
      p_trigger_type: 'regisseur_reflection',
      p_context: {
        input_length: input.length,
        response_strategy: strategy,
        eaa: eaaProfile,
        timestamp: new Date().toISOString()
      },
      p_new_seeds_generated: 0,
      p_learning_impact: eaaProfile.agency
    });
  } catch (err) {
    console.error('⚠️ Regisseur: Failed to store reflective memory:', err);
  }
}

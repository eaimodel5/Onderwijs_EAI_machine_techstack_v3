
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { incrementApiUsage } from '@/utils/apiUsageTracker';
import { toast } from 'sonner';

export interface SimilarityResult {
  content_id: string;
  content_type: string;
  content_text: string;
  similarity_score: number;
  metadata?: any;
}

export function useVectorEmbeddings() {
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const searchSimilarEmbeddings = async (
    query: string,
    threshold: number = 0.7,
    maxResults: number = 5
  ): Promise<SimilarityResult[]> => {
    if (!query?.trim()) {
      console.log('⚠️ No query provided');
      return [];
    }

    setIsSearching(true);
    
    try {
      console.log('🔍 Searching vector embeddings for:', query.substring(0, 50));
      
      // Generate embedding for query via backend
      incrementApiUsage('vector');
      const { data, error } = await supabase.functions.invoke('evai-core', {
        body: { operation: 'embedding', input: query, model: 'text-embedding-3-small' }
      });

      if (error) {
        console.error('❌ Embedding edge error:', error);
        toast.error('Vector embedding generatie gefaald', {
          description: 'Zoekfunctie gebruikt alleen tekst-matching'
        });
        return [];
      }

      const queryEmbedding = (data as { embedding?: number[] })?.embedding;
      if (!queryEmbedding) {
        console.error('❌ No embedding returned from edge function');
        toast.error('Vector embedding generatie gefaald', {
          description: 'Zoekfunctie gebruikt alleen tekst-matching'
        });
        return [];
      }

      // Search similar embeddings using Supabase function
      const { data: results, error: rpcError } = await supabase.rpc('find_similar_embeddings', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        similarity_threshold: threshold,
        max_results: maxResults
      });

      if (rpcError) {
        console.error('❌ Supabase vector search error:', rpcError);
        return [];
      }

      console.log(`✅ Found ${results?.length || 0} vector matches`);
      return results || [];

    } catch (error) {
      console.error('🔴 Vector search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const processSeedBatch = async (
    seeds: any[]
  ): Promise<{ success: number; failed: number }> => {
    setIsProcessing(true);
    let success = 0;
    let failed = 0;

    try {
      console.log(`🔄 Processing ${seeds.length} seeds for embedding generation...`);
      
      for (const seed of seeds) {
        try {
          // Generate embedding for seed via backend
          incrementApiUsage('vector');
          const text = seed.response?.nl || seed.emotion;
          
          console.log(`📝 Generating embedding for seed: ${seed.id}`);
          
          const { data, error } = await supabase.functions.invoke('evai-core', {
            body: { operation: 'embedding', input: text, model: 'text-embedding-3-small' }
          });

          if (error) {
            console.error('❌ Embedding edge error for seed:', seed.id, error);
            toast.error('Embedding generatie gefaald voor seed', {
              description: `Seed ${seed.id} overgeslagen`
            });
            failed++;
            continue;
          }

          const embedding = (data as { embedding?: number[] })?.embedding;
          if (!embedding) {
            console.error('❌ No embedding returned for seed:', seed.id);
            toast.error('Geen embedding ontvangen voor seed', {
              description: `Seed ${seed.id} overgeslagen`
            });
            failed++;
            continue;
          }

          // 🆕 FASE 1 FIX: Store DIRECTLY in unified_knowledge.vector_embedding
          console.log(`💾 Storing embedding in unified_knowledge for seed: ${seed.id}`);
          
          const { error: upsertError } = await supabase
            .from('unified_knowledge')
            .update({
              vector_embedding: `[${(embedding as number[]).join(',')}]`,
              updated_at: new Date().toISOString()
            })
            .eq('id', seed.id);

          if (upsertError) {
            console.error('❌ Failed to store embedding in unified_knowledge:', upsertError);
            failed++;
          } else {
            console.log(`✅ Embedding stored successfully for seed: ${seed.id}`);
            success++;
          }
        } catch (error) {
          console.error('❌ Failed to process seed:', seed.id, error);
          if (error instanceof Error) {
            console.error('   Error details:', error.message);
          }
          failed++;
        }
      }
      
      console.log(`✅ Batch processing complete: ${success} success, ${failed} failed`);
      
      if (success > 0) {
        toast.success(`${success} embeddings succesvol gegenereerd`, {
          description: failed > 0 ? `${failed} seeds gefaald` : 'Alle seeds verwerkt'
        });
      }
      
    } catch (error) {
      console.error('🔴 Critical error in processSeedBatch:', error);
      toast.error('Kritieke fout bij batch processing', {
        description: error instanceof Error ? error.message : 'Onbekende fout'
      });
    } finally {
      setIsProcessing(false);
    }

    return { success, failed };
  };

  return {
    searchSimilarEmbeddings,
    processSeedBatch,
    isSearching,
    isProcessing
  };
}

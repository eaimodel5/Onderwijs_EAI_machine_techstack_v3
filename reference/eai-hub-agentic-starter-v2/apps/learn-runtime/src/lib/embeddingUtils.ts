
import { incrementApiUsage } from '@/utils/apiUsageTracker';
import { supabase } from '@/integrations/supabase/client';

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text?.trim()) {
    throw new Error('Text is required for generating embeddings');
  }

      try {
        incrementApiUsage('vector');
        const { data, error } = await supabase.functions.invoke('evai-core', {
          body: { operation: 'embedding', input: text.substring(0, 8000), model: 'text-embedding-3-small' }
        });

    if (error) {
      throw new Error(`Embedding edge error: ${error.message}`);
    }

    const embedding = (data as { embedding?: number[] })?.embedding;
    if (!embedding) {
      throw new Error('No embedding returned from edge function');
    }

    return embedding;
  } catch (error) {
    console.error('❌ Failed to generate embedding:', error);
    throw error;
  }
}

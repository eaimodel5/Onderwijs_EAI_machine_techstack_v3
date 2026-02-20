
import { useState } from 'react';
import { SimilarityResult, useVectorEmbeddings } from './useVectorEmbeddings';

export function useEmbeddingProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { searchSimilarEmbeddings } = useVectorEmbeddings();

  const performNeuralSearch = async (
    query: string
  ): Promise<SimilarityResult[]> => {
    if (!query?.trim()) {
      console.log('🔍 Neural search skipped: missing query');
      return [];
    }

    setIsProcessing(true);
    console.log('🧠 Starting neural search for:', query.substring(0, 50));

    try {
      // searchSimilarEmbeddings now uses server-side Edge Functions
      const results = await searchSimilarEmbeddings(query);
      console.log(`✅ Neural search complete (server-side): ${results.length} similarities found`);
      return results;

    } catch (error) {
      console.error('🔴 Neural search error:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    performNeuralSearch,
    isProcessing
  };
}

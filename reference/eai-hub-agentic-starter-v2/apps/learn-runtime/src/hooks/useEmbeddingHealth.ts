/**
 * useEmbeddingHealth Hook
 * 
 * React hook for monitoring embedding health and triggering batch processing
 */

import { useState, useCallback, useEffect } from 'react';
import { embeddingService, EmbeddingHealthStatus, BatchEmbedProgress } from '@/services/EmbeddingService';
import { toast } from 'sonner';

export function useEmbeddingHealth() {
  const [health, setHealth] = useState<EmbeddingHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BatchEmbedProgress | null>(null);

  const loadHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await embeddingService.getHealth();
      setHealth(status);
      console.log('📊 Embedding health loaded:', status);
    } catch (error) {
      console.error('❌ Failed to load embedding health:', error);
      toast.error('Failed to load embedding status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processAllMissing = useCallback(async () => {
    if (isProcessing) {
      toast.warning('Batch process already running');
      return;
    }

    setIsProcessing(true);
    setProgress({ total: 0, processed: 0, successful: 0, failed: 0, currentBatch: 0, totalBatches: 0 });
    
    try {
      const result = await embeddingService.processAllMissing((prog) => {
        setProgress(prog);
      });
      
      console.log('✅ Batch embedding complete:', result);
      
      // Reload health after completion
      await loadHealth();
      
    } catch (error) {
      console.error('❌ Batch embedding failed:', error);
      toast.error('Batch embedding failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [isProcessing, loadHealth]);

  // Auto-load on mount
  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  return {
    health,
    isLoading,
    isProcessing,
    progress,
    loadHealth,
    processAllMissing
  };
}

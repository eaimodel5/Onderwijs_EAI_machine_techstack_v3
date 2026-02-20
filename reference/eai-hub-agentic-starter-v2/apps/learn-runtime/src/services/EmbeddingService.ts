/**
 * EmbeddingService v3.0
 * 
 * Centralized service for embedding management with:
 * - Batch processing with retry logic
 * - Health monitoring
 * - Rate limiting awareness
 * - Progress tracking
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmbeddingHealthStatus {
  total: number;
  embedded: number;
  missing: number;
  coverage: number;
  byType: Record<string, number>;
}

export interface BatchEmbedProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
}

export interface EmbeddingItem {
  id: string;
  content_type: string;
  emotion: string;
  response_text: string;
  triggers: string[];
}

export class EmbeddingService {
  private static instance: EmbeddingService;
  private isProcessing = false;

  private constructor() {}

  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  /**
   * Get current embedding health status
   */
  async getHealth(): Promise<EmbeddingHealthStatus> {
    console.log('📊 Fetching embedding health status...');
    
    const { data, error } = await supabase.rpc('get_embedding_health');
    
    if (error) {
      console.error('❌ Failed to fetch embedding health:', error);
      throw new Error(`Health check failed: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        total: 0,
        embedded: 0,
        missing: 0,
        coverage: 0,
        byType: {}
      };
    }

    // Aggregate results (function returns one row per missing type + totals)
    const firstRow = data[0];
    const byType: Record<string, number> = {};
    
    data.forEach((row: any) => {
      if (row.content_type && row.content_type !== 'N/A') {
        byType[row.content_type] = Number(row.count);
      }
    });

    return {
      total: Number(firstRow.total_items),
      embedded: Number(firstRow.embedded_items),
      missing: Number(firstRow.missing_embeddings),
      coverage: Number(firstRow.embedding_coverage_pct),
      byType
    };
  }

  /**
   * Get items that need embeddings
   */
  async getItemsNeedingEmbeddings(limit = 100): Promise<EmbeddingItem[]> {
    console.log(`📥 Fetching items needing embeddings (limit: ${limit})...`);
    
    const { data, error } = await supabase.rpc('get_items_needing_embeddings', {
      p_limit: limit
    });

    if (error) {
      console.error('❌ Failed to fetch items:', error);
      throw new Error(`Failed to fetch items: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Batch embed items with progress tracking
   */
  async batchEmbedItems(
    items: EmbeddingItem[],
    batchSize = 10,
    onProgress?: (progress: BatchEmbedProgress) => void
  ): Promise<{ successful: number; failed: number; errors: any[] }> {
    if (this.isProcessing) {
      throw new Error('Batch embedding already in progress');
    }

    this.isProcessing = true;
    console.log(`🔄 Starting batch embed: ${items.length} items, batch size: ${batchSize}`);

    const totalBatches = Math.ceil(items.length / batchSize);
    let processedCount = 0;
    let successCount = 0;
    let failCount = 0;
    const allErrors: any[] = [];

    try {
      for (let i = 0; i < items.length; i += batchSize) {
        const currentBatch = Math.floor(i / batchSize) + 1;
        const batch = items.slice(i, i + batchSize);
        
        console.log(`📦 Processing batch ${currentBatch}/${totalBatches} (${batch.length} items)`);

        // Prepare batch for edge function
        const batchItems = batch.map(item => ({
          id: item.id,
          text: item.response_text || item.emotion
        }));

        // Call edge function for batch embedding
        const { data, error } = await supabase.functions.invoke('evai-core', {
          body: {
            operation: 'batch-embed',
            items: batchItems,
            batchSize: 10 // Internal batch size within edge function
          }
        });

        if (error) {
          console.error(`❌ Batch ${currentBatch} failed:`, error);
          failCount += batch.length;
          allErrors.push({ batch: currentBatch, error: error.message, items: batchItems.length });
          continue;
        }

        const payload = data as { 
          ok?: boolean; 
          error?: string;
          results?: Array<{ id: string; embedding: number[] }>;
          errors?: Array<unknown>;
        };
        if (!payload?.ok) {
          console.error(`❌ Batch ${currentBatch} returned not-ok:`, payload?.error);
          failCount += batch.length;
          allErrors.push({ batch: currentBatch, error: payload?.error || 'Unknown error', items: batchItems.length });
          continue;
        }

        // Process results and update database
        const results = payload.results || [];
        const errors = payload.errors || [];

        for (const result of results) {
          try {
            const { id, embedding } = result;
            const embeddingStr = `[${embedding.join(',')}]`;
            
            const { data: updateData, error: updateError } = await supabase.rpc('update_item_embedding', {
              p_item_id: id,
              p_embedding: embeddingStr
            });

            if (updateError) {
              console.error(`❌ Failed to update embedding for ${id}:`, updateError);
              failCount++;
              allErrors.push({ id, error: updateError.message });
            } else {
              successCount++;
            }
          } catch (err) {
            console.error(`❌ Exception updating ${result.id}:`, err);
            failCount++;
            allErrors.push({ id: result.id, error: (err as Error).message });
          }
        }

        failCount += errors.length;
        allErrors.push(...errors);

        processedCount += batch.length;

        // Report progress
        if (onProgress) {
          onProgress({
            total: items.length,
            processed: processedCount,
            successful: successCount,
            failed: failCount,
            currentBatch,
            totalBatches
          });
        }
      }

      console.log(`✅ Batch embedding complete: ${successCount} successful, ${failCount} failed`);
      
      return {
        successful: successCount,
        failed: failCount,
        errors: allErrors
      };

    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process all missing embeddings with progress tracking
   */
  async processAllMissing(
    onProgress?: (progress: BatchEmbedProgress) => void
  ): Promise<{ successful: number; failed: number }> {
    console.log('🔄 Starting complete embedding process...');
    
    // Get health status first
    const health = await this.getHealth();
    console.log(`📊 Current status: ${health.missing} items need embedding (${health.coverage.toFixed(1)}% coverage)`);

    if (health.missing === 0) {
      console.log('✅ No items need embedding');
      toast.success('Embeddings up to date', {
        description: `${health.embedded}/${health.total} items embedded (100%)`
      });
      return { successful: 0, failed: 0 };
    }

    // Fetch all items needing embeddings
    const items = await this.getItemsNeedingEmbeddings(health.missing);
    console.log(`📥 Fetched ${items.length} items to process`);

    if (items.length === 0) {
      console.warn('⚠️ Health check shows missing embeddings but query returned 0 items');
      return { successful: 0, failed: 0 };
    }

    // Process with progress tracking
    const result = await this.batchEmbedItems(items, 20, onProgress);

    // Show final toast
    const finalCoverage = ((health.embedded + result.successful) / health.total * 100).toFixed(1);
    
    if (result.failed === 0) {
      toast.success('Embeddings complete!', {
        description: `${result.successful} items embedded successfully (${finalCoverage}% coverage)`
      });
    } else {
      toast.warning('Embeddings partially complete', {
        description: `${result.successful} succeeded, ${result.failed} failed (${finalCoverage}% coverage)`
      });
    }

    return result;
  }

  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}

export const embeddingService = EmbeddingService.getInstance();

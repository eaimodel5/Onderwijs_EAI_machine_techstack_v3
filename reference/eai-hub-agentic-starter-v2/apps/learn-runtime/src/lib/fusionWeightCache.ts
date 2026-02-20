import { supabase } from '@/integrations/supabase/client';

interface WeightProfile {
  symbolicWeight: number;
  neuralWeight: number;
  contextType: string;
  sampleCount: number;
}

/**
 * In-memory cache for fusion weights to prevent blocking database reads in critical path
 * Uses eventual consistency model with 30-second TTL
 */
export class FusionWeightCache {
  private static instance: FusionWeightCache;
  private cache: Map<string, WeightProfile> = new Map();
  private lastRefresh: Map<string, number> = new Map();
  private readonly CACHE_TTL = 30000; // 30 seconds
  
  static getInstance(): FusionWeightCache {
    if (!this.instance) {
      this.instance = new FusionWeightCache();
    }
    return this.instance;
  }
  
  /**
   * Get weights for a context type (non-blocking)
   * Returns cached weights if fresh, otherwise returns stale/defaults while refreshing async
   */
  async getWeights(contextType: string): Promise<WeightProfile> {
    const now = Date.now();
    const lastRefreshTime = this.lastRefresh.get(contextType) || 0;
    
    // Cache hit AND recent? Direct return (non-blocking!)
    if (this.cache.has(contextType) && (now - lastRefreshTime) < this.CACHE_TTL) {
      return this.cache.get(contextType)!;
    }
    
    // Cache miss OR expired → refresh async (fire-and-forget)
    void this.refreshCacheAsync(contextType);
    
    // Return stale cache OR defaults (NEVER wait on DB!)
    return this.cache.get(contextType) || {
      symbolicWeight: 0.7,
      neuralWeight: 0.3,
      contextType,
      sampleCount: 0
    };
  }
  
  /**
   * Async cache refresh (non-blocking)
   */
  private async refreshCacheAsync(contextType: string) {
    try {
      const { data, error } = await supabase
        .from('fusion_weight_profiles')
        .select('*')
        .eq('context_type', contextType)
        .eq('is_candidate', false)
        .single();
      
      if (error) {
        console.warn('⚠️ Cache refresh failed for', contextType, error.message);
        return;
      }
      
      if (data) {
        this.cache.set(contextType, {
          symbolicWeight: data.symbolic_weight,
          neuralWeight: data.neural_weight,
          contextType: data.context_type,
          sampleCount: data.sample_count || 0
        });
        this.lastRefresh.set(contextType, Date.now());
        console.log('✅ Cache refreshed for', contextType);
      }
    } catch (e) {
      console.warn('⚠️ Cache refresh exception for', contextType, e);
    }
  }
  
  /**
   * Force cache invalidation (call after HITL resolve or weight updates)
   */
  invalidate(contextType: string) {
    this.lastRefresh.delete(contextType);
    console.log('🔄 Cache invalidated for', contextType);
  }
  
  /**
   * Invalidate all cached weights
   */
  invalidateAll() {
    this.cache.clear();
    this.lastRefresh.clear();
    console.log('🔄 All cache invalidated');
  }
}

import { useState, useCallback } from 'react';

interface CachedBriefing {
  briefing: any;
  timestamp: number;
  conversationId: string;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useBriefingCache() {
  const [cache, setCache] = useState<Map<string, CachedBriefing>>(new Map());

  const getCached = useCallback((conversationId: string): any | null => {
    const cached = cache.get(conversationId);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > CACHE_TTL) {
      // Expired - remove from cache
      setCache(prev => {
        const next = new Map(prev);
        next.delete(conversationId);
        return next;
      });
      return null;
    }

    console.log(`📦 Using cached briefing (${Math.round(age / 1000)}s old)`);
    return cached.briefing;
  }, [cache]);

  const setCached = useCallback((conversationId: string, briefing: any) => {
    setCache(prev => {
      const next = new Map(prev);
      next.set(conversationId, {
        briefing,
        timestamp: Date.now(),
        conversationId
      });
      return next;
    });
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return { getCached, setCached, clearCache };
}

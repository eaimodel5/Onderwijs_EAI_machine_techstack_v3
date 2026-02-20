-- FASE 2: Verbeter search_unified_knowledge functie
-- 1. Enable pg_trgm extension voor fuzzy text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Drop oude functie en maak nieuwe met verbeteringen
DROP FUNCTION IF EXISTS public.search_unified_knowledge(text, text, double precision, integer);

CREATE OR REPLACE FUNCTION public.search_unified_knowledge(
  query_text text, 
  query_embedding text, 
  similarity_threshold double precision DEFAULT 0.3,  -- Verlaagd van 0.7
  max_results integer DEFAULT 20  -- Verhoogd van 10
)
RETURNS TABLE(
  id uuid,
  content_type text,
  emotion text,
  response_text text,
  confidence_score double precision,
  similarity_score double precision,
  metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Text-only search (geen embedding)
  IF query_embedding IS NULL OR query_embedding = '' THEN
    RETURN QUERY
    SELECT 
      uk.id,
      uk.content_type,
      uk.emotion,
      uk.response_text,
      uk.confidence_score,
      -- 🆕 Gebruik pg_trgm similarity voor fuzzy matching
      CASE 
        WHEN query_text ILIKE '%' || uk.emotion || '%' THEN 0.9
        WHEN EXISTS (
          SELECT 1 FROM unnest(uk.triggers) as trigger_word
          WHERE query_text ILIKE '%' || trigger_word || '%'
        ) THEN 0.8
        WHEN uk.response_text ILIKE '%' || query_text || '%' THEN 0.7
        ELSE similarity(query_text, uk.emotion) * 0.6
      END::double precision as similarity_score,
      uk.metadata
    FROM public.unified_knowledge uk
    WHERE 
      uk.user_id = '00000000-0000-0000-0000-000000000001'::uuid
      AND uk.active = true
      AND (
        query_text ILIKE '%' || uk.emotion || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(uk.triggers) as trigger_word
          WHERE query_text ILIKE '%' || trigger_word || '%'
        )
        OR uk.response_text ILIKE '%' || query_text || '%'
        OR similarity(query_text, uk.emotion) > 0.3
      )
    ORDER BY 
      CASE 
        WHEN query_text ILIKE '%' || uk.emotion || '%' THEN 1
        WHEN EXISTS (SELECT 1 FROM unnest(uk.triggers) as trigger_word WHERE query_text ILIKE '%' || trigger_word || '%') THEN 2
        ELSE 3
      END,
      similarity(query_text, uk.emotion) DESC,
      uk.usage_count DESC NULLS LAST
    LIMIT max_results;
  ELSE
    -- Vector-based search met betere fallback voor NULL embeddings
    RETURN QUERY
    SELECT 
      uk.id,
      uk.content_type,
      uk.emotion,
      uk.response_text,
      uk.confidence_score,
      -- 🆕 Betere fallback: gebruik text similarity als vector NULL is
      CASE 
        WHEN uk.vector_embedding IS NOT NULL THEN
          (1 - (uk.vector_embedding <=> query_embedding::vector))::double precision
        WHEN query_text ILIKE '%' || uk.emotion || '%' THEN 0.75
        WHEN EXISTS (
          SELECT 1 FROM unnest(uk.triggers) as trigger_word
          WHERE query_text ILIKE '%' || trigger_word || '%'
        ) THEN 0.65
        ELSE similarity(query_text, uk.emotion) * 0.5
      END as similarity_score,
      uk.metadata
    FROM public.unified_knowledge uk
    WHERE 
      uk.user_id = '00000000-0000-0000-0000-000000000001'::uuid
      AND uk.active = true
      AND (
        -- Vector match
        (uk.vector_embedding IS NOT NULL AND 
         1 - (uk.vector_embedding <=> query_embedding::vector) > similarity_threshold)
        -- OR fallback text matches
        OR query_text ILIKE '%' || uk.emotion || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(uk.triggers) as trigger_word
          WHERE query_text ILIKE '%' || trigger_word || '%'
        )
        OR uk.response_text ILIKE '%' || query_text || '%'
        OR similarity(query_text, uk.emotion) > 0.3
      )
    ORDER BY 
      -- Prioriteer vector matches, dan text matches
      CASE 
        WHEN uk.vector_embedding IS NOT NULL THEN
          (1 - (uk.vector_embedding <=> query_embedding::vector))::double precision
        WHEN query_text ILIKE '%' || uk.emotion || '%' THEN 0.75
        ELSE similarity(query_text, uk.emotion) * 0.5
      END DESC,
      uk.usage_count DESC NULLS LAST
    LIMIT max_results;
  END IF;
END;
$function$;

-- 3. Voeg index toe voor performance (als die nog niet bestaat)
CREATE INDEX IF NOT EXISTS idx_unified_knowledge_emotion_trgm ON public.unified_knowledge USING gin (emotion gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_unified_knowledge_response_trgm ON public.unified_knowledge USING gin (response_text gin_trgm_ops);

-- 4. Logging
DO $$ 
BEGIN 
  RAISE NOTICE '✅ FASE 2 COMPLETE: search_unified_knowledge verbeterd met:';
  RAISE NOTICE '   - Threshold verlaagd: 0.7 -> 0.3';
  RAISE NOTICE '   - Max results verhoogd: 10 -> 20';
  RAISE NOTICE '   - pg_trgm fuzzy matching enabled';
  RAISE NOTICE '   - Betere fallback voor NULL embeddings';
  RAISE NOTICE '   - Performance indexes toegevoegd';
END $$;
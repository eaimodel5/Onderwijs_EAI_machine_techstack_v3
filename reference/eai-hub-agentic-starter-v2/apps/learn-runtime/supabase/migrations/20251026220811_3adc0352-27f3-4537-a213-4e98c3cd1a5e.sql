-- ============================================
-- CLEANUP: Verwijder ALLE overloaded versies van search_unified_knowledge
-- ============================================

-- Drop alle bekende signatures
DROP FUNCTION IF EXISTS public.search_unified_knowledge(text, vector, uuid, double precision, integer);
DROP FUNCTION IF EXISTS public.search_unified_knowledge(text, vector, double precision, integer);
DROP FUNCTION IF EXISTS public.search_unified_knowledge(text, extensions.vector, uuid, double precision, integer);
DROP FUNCTION IF EXISTS public.search_unified_knowledge(text, extensions.vector, double precision, integer);
DROP FUNCTION IF EXISTS public.search_unified_knowledge(text, text, double precision, integer);

-- Hermaak de definitieve versie (text-based embedding input)
CREATE OR REPLACE FUNCTION public.search_unified_knowledge(
  query_text text, 
  query_embedding text, 
  similarity_threshold double precision DEFAULT 0.7, 
  max_results integer DEFAULT 10
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
      0.8::double precision as similarity_score,
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
      )
    ORDER BY 
      CASE 
        WHEN query_text ILIKE '%' || uk.emotion || '%' THEN 1
        WHEN EXISTS (SELECT 1 FROM unnest(uk.triggers) as trigger_word WHERE query_text ILIKE '%' || trigger_word || '%') THEN 2
        ELSE 3
      END,
      uk.usage_count DESC NULLS LAST
    LIMIT max_results;
  ELSE
    -- Vector-based search
    RETURN QUERY
    SELECT 
      uk.id,
      uk.content_type,
      uk.emotion,
      uk.response_text,
      uk.confidence_score,
      CASE 
        WHEN uk.vector_embedding IS NOT NULL THEN
          (1 - (uk.vector_embedding <=> query_embedding::vector))::double precision
        ELSE 
          0.6::double precision
      END as similarity_score,
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
        OR (uk.vector_embedding IS NOT NULL AND 1 - (uk.vector_embedding <=> query_embedding::vector) > similarity_threshold)
        OR uk.response_text ILIKE '%' || query_text || '%'
      )
    ORDER BY 
      CASE 
        WHEN query_text ILIKE '%' || uk.emotion || '%' THEN 1
        WHEN EXISTS (SELECT 1 FROM unnest(uk.triggers) as trigger_word WHERE query_text ILIKE '%' || trigger_word || '%') THEN 2
        ELSE 3
      END,
      CASE 
        WHEN uk.vector_embedding IS NOT NULL THEN
          (1 - (uk.vector_embedding <=> query_embedding::vector))::double precision
        ELSE 
          0.6::double precision
      END DESC,
      uk.usage_count DESC NULLS LAST
    LIMIT max_results;
  END IF;
END;
$function$;
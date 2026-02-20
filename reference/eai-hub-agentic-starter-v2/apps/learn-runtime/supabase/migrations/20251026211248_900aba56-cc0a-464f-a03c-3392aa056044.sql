-- ============================================
-- FIX 1: Corrigeer ILIKE zoeklogica in search_unified_knowledge
-- FIX 2: Sync vector embeddings naar unified_knowledge
-- ============================================

-- FIX 1: Update search_unified_knowledge functie
-- De ILIKE logica was omgekeerd: we willen checken of de emotion/trigger IN de query zit
DROP FUNCTION IF EXISTS public.search_unified_knowledge(text, text, double precision, integer);

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
  -- If no embedding provided, do text-based search only
  IF query_embedding IS NULL OR query_embedding = '' THEN
    RETURN QUERY
    SELECT 
      uk.id,
      uk.content_type,
      uk.emotion,
      uk.response_text,
      uk.confidence_score,
      0.8 as similarity_score,
      uk.metadata
    FROM public.unified_knowledge uk
    WHERE 
      uk.user_id = '00000000-0000-0000-0000-000000000001'::uuid
      AND uk.active = true
      AND (
        -- FIX: Check if emotion is IN the query (not query in emotion)
        query_text ILIKE '%' || uk.emotion || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(uk.triggers) as trigger_word
          -- FIX: Check if trigger is IN the query (not query in trigger)
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
    -- Vector-based search with text fallback
    RETURN QUERY
    SELECT 
      uk.id,
      uk.content_type,
      uk.emotion,
      uk.response_text,
      uk.confidence_score,
      CASE 
        WHEN uk.vector_embedding IS NOT NULL THEN
          1 - (uk.vector_embedding <=> query_embedding::vector)
        ELSE 
          0.6
      END as similarity_score,
      uk.metadata
    FROM public.unified_knowledge uk
    WHERE 
      uk.user_id = '00000000-0000-0000-0000-000000000001'::uuid
      AND uk.active = true
      AND (
        -- FIX: Check if emotion is IN the query
        query_text ILIKE '%' || uk.emotion || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(uk.triggers) as trigger_word
          -- FIX: Check if trigger is IN the query
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
          1 - (uk.vector_embedding <=> query_embedding::vector)
        ELSE 
          0.6
      END DESC,
      uk.usage_count DESC NULLS LAST
    LIMIT max_results;
  END IF;
END;
$function$;

-- FIX 2: Sync vector embeddings to unified_knowledge
-- Update existing unified_knowledge entries with vector embeddings
UPDATE public.unified_knowledge uk
SET 
  vector_embedding = ve.embedding,
  updated_at = NOW()
FROM public.vector_embeddings ve
WHERE 
  ve.content_id = uk.id
  AND ve.content_type = 'seed'
  AND uk.vector_embedding IS NULL
  AND uk.user_id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Update consolidate_knowledge functie om seed embeddings te includeren
CREATE OR REPLACE FUNCTION public.consolidate_knowledge()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
    -- Migreer 'emotion_seeds' naar 'unified_knowledge'
    INSERT INTO public.unified_knowledge (
        id, user_id, content_type, emotion, triggers, response_text, confidence_score, usage_count, metadata, active, created_at, updated_at
    )
    SELECT
        id,
        user_id,
        'seed' as content_type,
        emotion,
        CASE 
            WHEN meta->>'triggers' IS NOT NULL THEN 
                ARRAY(SELECT jsonb_array_elements_text(meta->'triggers'))
            ELSE 
                ARRAY[emotion]
        END as triggers,
        response->>'nl',
        COALESCE((meta->>'confidence')::numeric, 0.7),
        COALESCE((meta->>'usageCount')::integer, 0),
        meta,
        COALESCE(active, true),
        COALESCE(created_at, now()),
        COALESCE(updated_at, now())
    FROM public.emotion_seeds
    WHERE active = true
    ON CONFLICT (id) DO UPDATE SET
        emotion = EXCLUDED.emotion,
        response_text = EXCLUDED.response_text,
        triggers = EXCLUDED.triggers,
        metadata = EXCLUDED.metadata,
        active = EXCLUDED.active,
        updated_at = NOW();

    -- Sync vector embeddings naar unified_knowledge (voor bestaande seeds)
    UPDATE public.unified_knowledge uk
    SET 
      vector_embedding = ve.embedding,
      updated_at = NOW()
    FROM public.vector_embeddings ve
    WHERE 
      ve.content_id = uk.id
      AND ve.content_type = 'seed'
      AND uk.vector_embedding IS NULL;

    -- Migreer 'vector_embeddings' (die nog niet in unified zijn) naar 'unified_knowledge'
    INSERT INTO public.unified_knowledge (
        id, user_id, content_type, emotion, response_text, confidence_score, usage_count, metadata, vector_embedding, active, created_at, updated_at
    )
    SELECT
        ve.id,
        ve.user_id,
        'embedding' as content_type,
        COALESCE(ve.metadata->>'emotion', 'neutral'),
        ve.content_text,
        COALESCE((ve.metadata->>'confidence')::numeric, 0.7),
        0,
        ve.metadata,
        ve.embedding,
        true,
        ve.created_at,
        ve.updated_at
    FROM public.vector_embeddings ve
    LEFT JOIN public.unified_knowledge uk ON ve.content_id = uk.id
    WHERE uk.id IS NULL AND ve.content_type != 'seed'
    ON CONFLICT (id) DO NOTHING;

END;
$function$;
-- Fix consolidate_knowledge function - handle jsonb to text[] conversion properly
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
        -- Fix: Properly handle triggers conversion from jsonb to text[]
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
        0, -- Initial usage count for embeddings
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

-- Fix search_unified_knowledge function - handle vector operations properly
CREATE OR REPLACE FUNCTION public.search_unified_knowledge(query_text text, query_embedding text, similarity_threshold double precision DEFAULT 0.7, max_results integer DEFAULT 10)
 RETURNS TABLE(id uuid, content_type text, emotion text, response_text text, confidence_score double precision, similarity_score double precision, metadata jsonb)
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
      0.8 as similarity_score, -- Default score for text matches
      uk.metadata
    FROM public.unified_knowledge uk
    WHERE 
      uk.user_id = '00000000-0000-0000-0000-000000000001'::uuid
      AND uk.active = true
      AND (
        uk.emotion ILIKE '%' || query_text || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(uk.triggers) as trigger_word
          WHERE trigger_word ILIKE '%' || query_text || '%'
        )
        OR uk.response_text ILIKE '%' || query_text || '%'
      )
    ORDER BY 
      CASE 
        WHEN uk.emotion ILIKE '%' || query_text || '%' THEN 1
        WHEN EXISTS (SELECT 1 FROM unnest(uk.triggers) as trigger_word WHERE trigger_word ILIKE '%' || query_text || '%') THEN 2
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
          0.6 -- Default similarity for non-vector matches
      END as similarity_score,
      uk.metadata
    FROM public.unified_knowledge uk
    WHERE 
      uk.user_id = '00000000-0000-0000-0000-000000000001'::uuid
      AND uk.active = true
      AND (
        uk.emotion ILIKE '%' || query_text || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(uk.triggers) as trigger_word
          WHERE trigger_word ILIKE '%' || query_text || '%'
        )
        OR (uk.vector_embedding IS NOT NULL AND 1 - (uk.vector_embedding <=> query_embedding::vector) > similarity_threshold)
        OR uk.response_text ILIKE '%' || query_text || '%'
      )
    ORDER BY 
      CASE 
        WHEN uk.emotion ILIKE '%' || query_text || '%' THEN 1
        WHEN EXISTS (SELECT 1 FROM unnest(uk.triggers) as trigger_word WHERE trigger_word ILIKE '%' || query_text || '%') THEN 2
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
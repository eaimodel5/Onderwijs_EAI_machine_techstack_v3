-- ============================================
-- FASE 1: Fix RLS Policies & Logging Infrastructure
-- ============================================

-- 1. Fix decision_logs RLS: Allow hardcoded single-user access
DROP POLICY IF EXISTS "Allow users to manage their own decision logs" ON public.decision_logs;

CREATE POLICY "Single user access to decision_logs"
ON public.decision_logs
FOR ALL
USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- 2. Fix reflection_logs RLS: Allow hardcoded single-user access
DROP POLICY IF EXISTS "Allow users to manage their own reflection logs" ON public.reflection_logs;

CREATE POLICY "Single user access to reflection_logs"
ON public.reflection_logs
FOR ALL
USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- 3. Create index for decision_logs performance
CREATE INDEX IF NOT EXISTS idx_decision_logs_created_at 
ON public.decision_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_decision_logs_conversation 
ON public.decision_logs(user_id, conversation_id);

-- 4. Create index for reflection_logs performance
CREATE INDEX IF NOT EXISTS idx_reflection_logs_created_at 
ON public.reflection_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reflection_logs_trigger 
ON public.reflection_logs(user_id, trigger_type);

-- 5. Add HNSW index for vector search optimization (if not exists)
CREATE INDEX IF NOT EXISTS idx_unified_knowledge_vector_hnsw
ON public.unified_knowledge 
USING hnsw (vector_embedding vector_cosine_ops)
WHERE vector_embedding IS NOT NULL;

-- 6. Add GIN index for full-text search optimization
CREATE INDEX IF NOT EXISTS idx_unified_knowledge_search_vector
ON public.unified_knowledge 
USING gin(search_vector)
WHERE active = true;

-- 7. Add composite index for unified_knowledge queries
CREATE INDEX IF NOT EXISTS idx_unified_knowledge_active_emotion
ON public.unified_knowledge(user_id, active, emotion)
WHERE active = true;

-- 8. Enhanced logging function for unified decisions with better error handling
CREATE OR REPLACE FUNCTION public.log_unified_decision_v3(
  p_user_input TEXT,
  p_emotion TEXT,
  p_response TEXT,
  p_confidence DOUBLE PRECISION,
  p_label TEXT,
  p_sources JSONB,
  p_conversation_id TEXT,
  p_processing_time_ms INTEGER,
  p_api_collaboration JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Validate inputs
  IF p_user_input IS NULL OR trim(p_user_input) = '' THEN
    RAISE EXCEPTION 'user_input cannot be empty';
  END IF;
  
  IF p_response IS NULL OR trim(p_response) = '' THEN
    RAISE EXCEPTION 'response cannot be empty';
  END IF;

  INSERT INTO public.decision_logs (
    user_id,
    user_input,
    final_response,
    confidence_score,
    conversation_id,
    processing_time_ms,
    hybrid_decision,
    symbolic_matches,
    neural_similarities,
    api_collaboration,
    workflow_version
  ) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    p_user_input,
    p_response,
    p_confidence,
    p_conversation_id,
    p_processing_time_ms,
    jsonb_build_object(
      'emotion', p_emotion,
      'label', p_label,
      'sources_count', jsonb_array_length(COALESCE(p_sources, '[]'::jsonb))
    ),
    p_sources,
    '[]'::jsonb, -- Neural similarities deprecated
    COALESCE(p_api_collaboration, '{}'::jsonb),
    '3.0'
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- 9. Create embedding health check function
CREATE OR REPLACE FUNCTION public.get_embedding_health()
RETURNS TABLE(
  total_items BIGINT,
  embedded_items BIGINT,
  missing_embeddings BIGINT,
  embedding_coverage_pct NUMERIC,
  content_type TEXT,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) as total,
      COUNT(vector_embedding) as embedded,
      COUNT(*) - COUNT(vector_embedding) as missing
    FROM public.unified_knowledge
    WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
      AND active = true
  ),
  by_type AS (
    SELECT 
      content_type,
      COUNT(*) as cnt
    FROM public.unified_knowledge
    WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
      AND active = true
      AND vector_embedding IS NULL
    GROUP BY content_type
  )
  SELECT 
    s.total,
    s.embedded,
    s.missing,
    ROUND((s.embedded::numeric / NULLIF(s.total, 0) * 100), 2) as coverage,
    COALESCE(bt.content_type, 'N/A'),
    COALESCE(bt.cnt, 0)
  FROM stats s
  LEFT JOIN by_type bt ON true;
END;
$$;

-- 10. Create function to get items needing embeddings
CREATE OR REPLACE FUNCTION public.get_items_needing_embeddings(p_limit INTEGER DEFAULT 100)
RETURNS TABLE(
  id UUID,
  content_type TEXT,
  emotion TEXT,
  response_text TEXT,
  triggers TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uk.id,
    uk.content_type,
    uk.emotion,
    uk.response_text,
    uk.triggers
  FROM public.unified_knowledge uk
  WHERE uk.user_id = '00000000-0000-0000-0000-000000000001'::uuid
    AND uk.active = true
    AND uk.vector_embedding IS NULL
  ORDER BY uk.created_at ASC
  LIMIT p_limit;
END;
$$;

-- 11. Create function to update embedding for item
CREATE OR REPLACE FUNCTION public.update_item_embedding(
  p_item_id UUID,
  p_embedding TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.unified_knowledge
  SET 
    vector_embedding = p_embedding::vector,
    updated_at = NOW()
  WHERE id = p_item_id
    AND user_id = '00000000-0000-0000-0000-000000000001'::uuid;
  
  RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION public.log_unified_decision_v3 IS 'v3.0: Enhanced decision logging with validation and better error handling';
COMMENT ON FUNCTION public.get_embedding_health IS 'Returns embedding coverage statistics for monitoring';
COMMENT ON FUNCTION public.get_items_needing_embeddings IS 'Returns items without embeddings for batch processing';
COMMENT ON FUNCTION public.update_item_embedding IS 'Updates vector embedding for a specific item';
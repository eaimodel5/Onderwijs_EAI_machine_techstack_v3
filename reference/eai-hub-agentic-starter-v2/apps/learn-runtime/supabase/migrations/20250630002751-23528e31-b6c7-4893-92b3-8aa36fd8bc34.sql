
-- Step 1: Drop foreign key constraints that reference auth.users
ALTER TABLE public.emotion_seeds DROP CONSTRAINT IF EXISTS emotion_seeds_user_id_fkey;
ALTER TABLE public.seed_feedback DROP CONSTRAINT IF EXISTS seed_feedback_user_id_fkey;
ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS settings_user_id_fkey;
ALTER TABLE public.vector_embeddings DROP CONSTRAINT IF EXISTS vector_embeddings_user_id_fkey;
ALTER TABLE public.decision_logs DROP CONSTRAINT IF EXISTS decision_logs_user_id_fkey;
ALTER TABLE public.reflection_logs DROP CONSTRAINT IF EXISTS reflection_logs_user_id_fkey;
ALTER TABLE public.rubrics_assessments DROP CONSTRAINT IF EXISTS rubrics_assessments_user_id_fkey;
ALTER TABLE public.api_collaboration_logs DROP CONSTRAINT IF EXISTS api_collaboration_logs_user_id_fkey;
ALTER TABLE public.unified_knowledge DROP CONSTRAINT IF EXISTS unified_knowledge_user_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 2: Disable RLS on all user-specific tables
ALTER TABLE public.emotion_seeds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.seed_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.seed_rubrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vector_embeddings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflection_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubrics_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_collaboration_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.unified_knowledge DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop all RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.seed_feedback;
DROP POLICY IF EXISTS "Users can create own feedback" ON public.seed_feedback;
DROP POLICY IF EXISTS "Users can view own embeddings" ON public.vector_embeddings;
DROP POLICY IF EXISTS "Users can create own embeddings" ON public.vector_embeddings;
DROP POLICY IF EXISTS "Users can update own embeddings" ON public.vector_embeddings;
DROP POLICY IF EXISTS "Users can delete own embeddings" ON public.vector_embeddings;
DROP POLICY IF EXISTS "Users can view own decisions" ON public.decision_logs;
DROP POLICY IF EXISTS "Users can create own decisions" ON public.decision_logs;
DROP POLICY IF EXISTS "Users can view own reflections" ON public.reflection_logs;
DROP POLICY IF EXISTS "Users can create own reflections" ON public.reflection_logs;
DROP POLICY IF EXISTS "Users can view their own rubrics assessments" ON public.rubrics_assessments;
DROP POLICY IF EXISTS "Users can insert their own rubrics assessments" ON public.rubrics_assessments;
DROP POLICY IF EXISTS "Users can view their own API collaboration logs" ON public.api_collaboration_logs;
DROP POLICY IF EXISTS "Users can insert their own API collaboration logs" ON public.api_collaboration_logs;
DROP POLICY IF EXISTS "Users can manage their own knowledge" ON public.unified_knowledge;
DROP POLICY IF EXISTS "Users can view their own seeds" ON public.emotion_seeds;
DROP POLICY IF EXISTS "Users can create their own seeds" ON public.emotion_seeds;
DROP POLICY IF EXISTS "Users can update their own seeds" ON public.emotion_seeds;
DROP POLICY IF EXISTS "Users can delete their own seeds" ON public.emotion_seeds;
DROP POLICY IF EXISTS "Everyone can view active emotion seeds" ON public.emotion_seeds;
DROP POLICY IF EXISTS "Everyone can view seed rubrics" ON public.seed_rubrics;
DROP POLICY IF EXISTS "Everyone can view rubrics" ON public.rubrics;

-- Step 4: Create a single default user profile (UUID for single user)
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'single-user@evai.app',
  'EvAI Single User',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- Step 5: Update all existing records to use the single user ID
UPDATE public.emotion_seeds SET user_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE user_id IS NULL;
UPDATE public.seed_feedback SET user_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE user_id IS NULL;
UPDATE public.settings SET user_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE user_id IS NULL;
UPDATE public.vector_embeddings SET user_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE user_id IS NULL;
UPDATE public.decision_logs SET user_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE user_id IS NULL;
UPDATE public.reflection_logs SET user_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE user_id IS NULL;
UPDATE public.rubrics_assessments SET user_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE user_id IS NULL;
UPDATE public.api_collaboration_logs SET user_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE user_id IS NULL;
UPDATE public.unified_knowledge SET user_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE user_id IS NULL;

-- Step 6: Make user_id columns NOT NULL and set defaults (no foreign keys to auth.users)
ALTER TABLE public.emotion_seeds ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE public.emotion_seeds ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.seed_feedback ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE public.seed_feedback ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.settings ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE public.settings ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.vector_embeddings ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE public.vector_embeddings ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.decision_logs ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE public.decision_logs ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.reflection_logs ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE public.reflection_logs ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.rubrics_assessments ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE public.rubrics_assessments ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.api_collaboration_logs ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE public.api_collaboration_logs ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.unified_knowledge ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE public.unified_knowledge ALTER COLUMN user_id SET NOT NULL;

-- Step 7: Update functions to work with single user
CREATE OR REPLACE FUNCTION public.get_single_user_setting(setting_key text, default_value text DEFAULT NULL::text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT value 
    FROM public.settings 
    WHERE key = setting_key 
    AND user_id = '00000000-0000-0000-0000-000000000001'::uuid
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_single_user_setting(setting_key text, setting_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.settings(key, value, user_id)
  VALUES(setting_key, setting_value, '00000000-0000-0000-0000-000000000001'::uuid)
  ON CONFLICT (key, user_id)
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END;
$$;

-- Step 8: Remove auth trigger (since we won't have new users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 9: Update existing functions to use single user ID
CREATE OR REPLACE FUNCTION public.log_evai_workflow(
  p_conversation_id text,
  p_workflow_type text,
  p_api_collaboration jsonb,
  p_rubrics_data jsonb DEFAULT NULL::jsonb,
  p_processing_time integer DEFAULT NULL::integer,
  p_success boolean DEFAULT true,
  p_error_details jsonb DEFAULT NULL::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_log_id UUID;
BEGIN
    INSERT INTO public.api_collaboration_logs (
        user_id,
        session_id,
        workflow_type,
        api1_used,
        api2_used,
        vector_api_used,
        seed_generated,
        secondary_analysis,
        processing_time_ms,
        success,
        error_details,
        metadata
    ) VALUES (
        '00000000-0000-0000-0000-000000000001'::uuid,
        p_conversation_id,
        p_workflow_type,
        COALESCE((p_api_collaboration->>'api1Used')::boolean, false),
        COALESCE((p_api_collaboration->>'api2Used')::boolean, false),
        COALESCE((p_api_collaboration->>'vectorApiUsed')::boolean, false),
        COALESCE((p_api_collaboration->>'seedGenerated')::boolean, false),
        COALESCE((p_api_collaboration->>'secondaryAnalysis')::boolean, false),
        p_processing_time,
        p_success,
        p_error_details,
        COALESCE(p_rubrics_data, '{}'::jsonb)
    )
    RETURNING id INTO new_log_id;
    
    RETURN new_log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_unified_knowledge(
  query_text text,
  query_embedding vector(1536),
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
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uk.id,
    uk.content_type,
    uk.emotion,
    uk.response_text,
    uk.confidence_score,
    1 - (uk.vector_embedding <=> query_embedding) as similarity_score,
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
      OR (uk.vector_embedding IS NOT NULL AND 1 - (uk.vector_embedding <=> query_embedding) > similarity_threshold)
    )
  ORDER BY 
    CASE 
      WHEN uk.emotion ILIKE '%' || query_text || '%' THEN 1
      WHEN EXISTS (SELECT 1 FROM unnest(uk.triggers) as trigger_word WHERE trigger_word ILIKE '%' || query_text || '%') THEN 2
      ELSE 3
    END,
    1 - (uk.vector_embedding <=> query_embedding) DESC,
    uk.usage_count DESC
  LIMIT max_results;
END;
$$;

CREATE OR REPLACE FUNCTION public.find_similar_embeddings(
  query_embedding vector(1536),
  similarity_threshold double precision DEFAULT 0.7,
  max_results integer DEFAULT 10
) RETURNS TABLE(
  content_id uuid,
  content_type text,
  content_text text,
  similarity_score double precision,
  metadata jsonb
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    ve.content_id,
    ve.content_type,
    ve.content_text,
    1 - (ve.embedding <=> query_embedding) as similarity_score,
    ve.metadata
  FROM public.vector_embeddings ve
  WHERE 
    ve.user_id = '00000000-0000-0000-0000-000000000001'::uuid
    AND 1 - (ve.embedding <=> query_embedding) > similarity_threshold
  ORDER BY ve.embedding <=> query_embedding
  LIMIT max_results;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_hybrid_decision(
  p_user_input text,
  p_symbolic_matches jsonb,
  p_neural_similarities jsonb,
  p_hybrid_decision jsonb,
  p_final_response text,
  p_confidence_score double precision,
  p_processing_time_ms integer DEFAULT NULL::integer
) RETURNS uuid
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    new_log_id uuid;
BEGIN
    INSERT INTO public.decision_logs (
        user_id,
        user_input,
        symbolic_matches,
        neural_similarities,
        hybrid_decision,
        final_response,
        confidence_score,
        processing_time_ms
    ) VALUES (
        '00000000-0000-0000-0000-000000000001'::uuid,
        p_user_input,
        p_symbolic_matches,
        p_neural_similarities,
        p_hybrid_decision,
        p_final_response,
        p_confidence_score,
        p_processing_time_ms
    )
    RETURNING id INTO new_log_id;
    RETURN new_log_id;
END;
$$;

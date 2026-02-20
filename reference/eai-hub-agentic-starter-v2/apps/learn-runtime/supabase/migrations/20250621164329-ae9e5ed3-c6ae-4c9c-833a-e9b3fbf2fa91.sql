
-- Phase 1: Database Cleanup & Logging
-- Step 1: Clean up duplicate seeds and corrupted data

-- First, let's identify and remove duplicate seeds (keeping the most recent ones)
WITH seed_duplicates AS (
  SELECT 
    id,
    emotion,
    ROW_NUMBER() OVER (PARTITION BY emotion ORDER BY created_at DESC, updated_at DESC) as rn
  FROM emotion_seeds
),
seeds_to_delete AS (
  SELECT id FROM seed_duplicates WHERE rn > 1
)
DELETE FROM emotion_seeds 
WHERE id IN (SELECT id FROM seeds_to_delete);

-- Step 2: Clean up any corrupted or invalid seed data
UPDATE emotion_seeds 
SET 
  meta = COALESCE(meta, '{}'::jsonb),
  response = CASE 
    WHEN response IS NULL OR response = '{}'::jsonb 
    THEN '{"nl": "Ik begrijp hoe je je voelt."}'::jsonb
    ELSE response
  END,
  weight = CASE 
    WHEN weight IS NULL OR weight <= 0 
    THEN 1.0 
    ELSE weight 
  END,
  active = COALESCE(active, true)
WHERE 
  meta IS NULL 
  OR response IS NULL 
  OR response = '{}'::jsonb 
  OR weight IS NULL 
  OR weight <= 0 
  OR active IS NULL;

-- Step 3: Add enhanced logging for rubrics assessments
CREATE TABLE IF NOT EXISTS public.rubrics_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  conversation_id TEXT,
  message_content TEXT NOT NULL,
  rubric_id TEXT NOT NULL,
  risk_score DOUBLE PRECISION DEFAULT 0,
  protective_score DOUBLE PRECISION DEFAULT 0,
  overall_score DOUBLE PRECISION DEFAULT 0,
  triggers JSONB DEFAULT '[]'::jsonb,
  confidence_level TEXT DEFAULT 'medium',
  processing_mode TEXT DEFAULT 'flexible',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 4: Add comprehensive API collaboration tracking
CREATE TABLE IF NOT EXISTS public.api_collaboration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_id TEXT,
  workflow_type TEXT NOT NULL,
  api1_used BOOLEAN DEFAULT false,
  api2_used BOOLEAN DEFAULT false,
  vector_api_used BOOLEAN DEFAULT false,
  seed_generated BOOLEAN DEFAULT false,
  secondary_analysis BOOLEAN DEFAULT false,
  processing_time_ms INTEGER,
  success BOOLEAN DEFAULT false,
  error_details JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 5: Enhanced decision logging with better structure
ALTER TABLE public.decision_logs 
ADD COLUMN IF NOT EXISTS workflow_version TEXT DEFAULT '5.6',
ADD COLUMN IF NOT EXISTS api_collaboration JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS rubrics_analysis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS conversation_id TEXT;

-- Step 6: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rubrics_assessments_user_id ON public.rubrics_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_rubrics_assessments_conversation_id ON public.rubrics_assessments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_api_collaboration_logs_user_id ON public.api_collaboration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_collaboration_logs_session_id ON public.api_collaboration_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_decision_logs_conversation_id ON public.decision_logs(conversation_id);

-- Step 7: Add RLS policies for new tables
ALTER TABLE public.rubrics_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_collaboration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rubrics assessments" 
  ON public.rubrics_assessments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rubrics assessments" 
  ON public.rubrics_assessments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own API collaboration logs" 
  ON public.api_collaboration_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API collaboration logs" 
  ON public.api_collaboration_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Step 8: Create function for comprehensive logging
CREATE OR REPLACE FUNCTION public.log_evai_workflow(
  p_user_id UUID,
  p_conversation_id TEXT,
  p_workflow_type TEXT,
  p_api_collaboration JSONB,
  p_rubrics_data JSONB DEFAULT NULL,
  p_processing_time INTEGER DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_details JSONB DEFAULT NULL
) RETURNS UUID
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
        p_user_id,
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

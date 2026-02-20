-- FASE 1: Uitbreiden decision_logs schema met v20 metadata

-- Voeg nieuwe JSONB velden toe voor v20 audit trail
ALTER TABLE decision_logs 
  ADD COLUMN IF NOT EXISTS eaa_profile JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS td_matrix JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS eai_rules JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS regisseur_briefing JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS fusion_metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS safety_check JSONB DEFAULT '{}';

-- Update log_unified_decision_v3 RPC function met nieuwe v20 parameters
CREATE OR REPLACE FUNCTION public.log_unified_decision_v3(
  p_user_input text,
  p_emotion text,
  p_response text,
  p_confidence double precision,
  p_label text,
  p_sources jsonb,
  p_conversation_id text,
  p_processing_time_ms integer,
  p_api_collaboration jsonb DEFAULT '{}'::jsonb,
  p_eaa_profile jsonb DEFAULT '{}'::jsonb,
  p_td_matrix jsonb DEFAULT '{}'::jsonb,
  p_eai_rules jsonb DEFAULT '{}'::jsonb,
  p_regisseur_briefing jsonb DEFAULT '{}'::jsonb,
  p_fusion_metadata jsonb DEFAULT '{}'::jsonb,
  p_safety_check jsonb DEFAULT '{}'::jsonb,
  p_rubrics_analysis jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    workflow_version,
    eaa_profile,
    td_matrix,
    eai_rules,
    regisseur_briefing,
    fusion_metadata,
    safety_check,
    rubrics_analysis
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
    '[]'::jsonb,
    COALESCE(p_api_collaboration, '{}'::jsonb),
    '3.0',
    COALESCE(p_eaa_profile, '{}'::jsonb),
    COALESCE(p_td_matrix, '{}'::jsonb),
    COALESCE(p_eai_rules, '{}'::jsonb),
    COALESCE(p_regisseur_briefing, '{}'::jsonb),
    COALESCE(p_fusion_metadata, '{}'::jsonb),
    COALESCE(p_safety_check, '{}'::jsonb),
    COALESCE(p_rubrics_analysis, '{}'::jsonb)
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$function$;
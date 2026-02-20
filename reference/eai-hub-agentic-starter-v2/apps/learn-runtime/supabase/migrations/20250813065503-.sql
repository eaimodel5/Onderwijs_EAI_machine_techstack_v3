-- Create RPCs for dashboard access with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_recent_decision_logs(p_limit integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  created_at timestamp with time zone,
  user_input text,
  final_response text,
  confidence_score double precision,
  processing_time_ms integer,
  api_collaboration jsonb,
  rubrics_analysis jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    dl.id,
    dl.created_at,
    dl.user_input,
    dl.final_response,
    dl.confidence_score,
    dl.processing_time_ms,
    COALESCE(dl.api_collaboration, '{}'::jsonb),
    COALESCE(dl.rubrics_analysis, '{}'::jsonb)
  FROM public.decision_logs dl
  WHERE dl.user_id = '00000000-0000-0000-0000-000000000001'::uuid
  ORDER BY dl.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit,50), 1);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_recent_api_collaboration_logs(p_limit integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  created_at timestamp with time zone,
  workflow_type text,
  api1_used boolean,
  api2_used boolean,
  vector_api_used boolean,
  seed_generated boolean,
  secondary_analysis boolean,
  processing_time_ms integer,
  success boolean,
  error_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    acl.id,
    acl.created_at,
    acl.workflow_type,
    COALESCE(acl.api1_used, false),
    COALESCE(acl.api2_used, false),
    COALESCE(acl.vector_api_used, false),
    COALESCE(acl.seed_generated, false),
    COALESCE(acl.secondary_analysis, false),
    acl.processing_time_ms,
    COALESCE(acl.success, false),
    COALESCE(acl.error_details, '{}'::jsonb)
  FROM public.api_collaboration_logs acl
  WHERE acl.user_id = '00000000-0000-0000-0000-000000000001'::uuid
  ORDER BY acl.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit,50), 1);
END;
$function$;
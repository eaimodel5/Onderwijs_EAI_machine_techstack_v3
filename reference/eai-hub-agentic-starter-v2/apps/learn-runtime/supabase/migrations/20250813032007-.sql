-- Create RPC to log reflection events with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.log_reflection_event(
  p_trigger_type text,
  p_context jsonb,
  p_new_seeds_generated integer DEFAULT 0,
  p_learning_impact double precision DEFAULT 0.0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.reflection_logs (
    id,
    user_id,
    trigger_type,
    context,
    insights,
    actions_taken,
    new_seeds_generated,
    learning_impact
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001'::uuid,
    p_trigger_type,
    p_context,
    '[]'::jsonb,
    '[]'::jsonb,
    COALESCE(p_new_seeds_generated, 0),
    COALESCE(p_learning_impact, 0.0)
  ) RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

-- Create RPC to fetch recent reflection logs for the single-user setup
CREATE OR REPLACE FUNCTION public.get_recent_reflection_logs(
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  trigger_type text,
  context jsonb,
  new_seeds_generated integer,
  learning_impact double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT rl.id, rl.created_at, rl.trigger_type, rl.context, COALESCE(rl.new_seeds_generated,0), COALESCE(rl.learning_impact,0.0)
  FROM public.reflection_logs rl
  WHERE rl.user_id = '00000000-0000-0000-0000-000000000001'::uuid
  ORDER BY rl.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit,50), 1);
END;
$function$;
-- Create trigger function to adjust seed weight and usage on feedback insert
CREATE OR REPLACE FUNCTION public.adjust_seed_on_feedback()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_delta numeric := 0.0;
BEGIN
  IF NEW.seed_id IS NULL THEN
    RETURN NEW; -- nothing to do
  END IF;

  -- Determine weight delta based on rating
  IF NEW.rating = 'like' THEN
    v_delta := 0.05;
  ELSIF NEW.rating = 'dislike' THEN
    v_delta := -0.05;
  ELSE
    v_delta := 0.0;
  END IF;

  -- Update emotion_seeds: bump usageCount in meta and adjust weight (clamped)
  UPDATE public.emotion_seeds AS es
  SET
    meta = jsonb_set(
      COALESCE(es.meta, '{}'::jsonb),
      '{usageCount}',
      ((COALESCE((es.meta->>'usageCount')::int, 0) + 1))::text::jsonb,
      true
    ),
    weight = GREATEST(0.10, LEAST(2.00, COALESCE(es.weight, 1.0) + v_delta)),
    updated_at = now()
  WHERE es.id = NEW.seed_id;

  RETURN NEW;
END;
$$;

-- Create trigger (idempotent)
DROP TRIGGER IF EXISTS trg_adjust_seed_on_feedback ON public.seed_feedback;
CREATE TRIGGER trg_adjust_seed_on_feedback
AFTER INSERT ON public.seed_feedback
FOR EACH ROW
EXECUTE FUNCTION public.adjust_seed_on_feedback();
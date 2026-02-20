-- Cleanup Invalid Emotions from Database
-- Part of Neurosymbolic Chatbot Database Integrity Initiative

-- Create function to clean invalid emotions
CREATE OR REPLACE FUNCTION public.cleanup_invalid_emotions()
RETURNS TABLE(
  deleted_seeds INTEGER,
  deleted_knowledge INTEGER,
  normalized_emotions INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_deleted_seeds INTEGER := 0;
  v_deleted_knowledge INTEGER := 0;
  v_normalized INTEGER := 0;
  
  -- Valid emotions list
  v_valid_emotions TEXT[] := ARRAY[
    'angst', 'verdriet', 'woede', 'stress', 'eenzaamheid', 'onzekerheid',
    'blijdschap', 'trots', 'vreugde', 'geluk', 'rust', 'opluchting',
    'teleurstelling', 'schaamte', 'schuld', 'jaloezie', 'frustratie',
    'verwarring', 'hoop', 'nieuwsgierigheid', 'verbazing', 'acceptatie', 'liefde'
  ];
BEGIN
  -- 1. Delete seeds with invalid emotions (too long or not in valid list)
  WITH deleted_seeds AS (
    DELETE FROM public.emotion_seeds
    WHERE 
      LENGTH(emotion) > 50 
      OR emotion LIKE '%.%' 
      OR emotion LIKE '%!%'
      OR emotion LIKE '%?%'
      OR LOWER(TRIM(emotion)) NOT IN (SELECT UNNEST(v_valid_emotions))
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_seeds FROM deleted_seeds;
  
  -- 2. Delete unified_knowledge with invalid emotions
  WITH deleted_knowledge AS (
    DELETE FROM public.unified_knowledge
    WHERE 
      LENGTH(emotion) > 50 
      OR emotion LIKE '%.%'
      OR emotion LIKE '%!%'
      OR emotion LIKE '%?%'
      OR LOWER(TRIM(emotion)) NOT IN (SELECT UNNEST(v_valid_emotions))
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_knowledge FROM deleted_knowledge;
  
  -- 3. Normalize common variations to standard emotions
  WITH normalized AS (
    UPDATE public.emotion_seeds
    SET emotion = CASE
      WHEN LOWER(TRIM(emotion)) IN ('neutral', 'neutraal', 'uncertain') THEN 'onzekerheid'
      WHEN LOWER(TRIM(emotion)) IN ('anxiety', 'fear') THEN 'angst'
      WHEN LOWER(TRIM(emotion)) IN ('sad', 'sadness') THEN 'verdriet'
      WHEN LOWER(TRIM(emotion)) IN ('angry', 'anger') THEN 'woede'
      WHEN LOWER(TRIM(emotion)) IN ('stressed') THEN 'stress'
      WHEN LOWER(TRIM(emotion)) IN ('lonely') THEN 'eenzaamheid'
      WHEN LOWER(TRIM(emotion)) IN ('happy', 'joy') THEN 'blijdschap'
      WHEN LOWER(TRIM(emotion)) IN ('proud') THEN 'trots'
      WHEN LOWER(TRIM(emotion)) IN ('calm') THEN 'rust'
      WHEN LOWER(TRIM(emotion)) IN ('relief') THEN 'opluchting'
      WHEN LOWER(TRIM(emotion)) IN ('disappointed') THEN 'teleurstelling'
      WHEN LOWER(TRIM(emotion)) IN ('shame') THEN 'schaamte'
      WHEN LOWER(TRIM(emotion)) IN ('guilt') THEN 'schuld'
      WHEN LOWER(TRIM(emotion)) IN ('jealous') THEN 'jaloezie'
      WHEN LOWER(TRIM(emotion)) IN ('frustrated') THEN 'frustratie'
      WHEN LOWER(TRIM(emotion)) IN ('confused') THEN 'verwarring'
      WHEN LOWER(TRIM(emotion)) IN ('hope') THEN 'hoop'
      WHEN LOWER(TRIM(emotion)) IN ('curious') THEN 'nieuwsgierigheid'
      WHEN LOWER(TRIM(emotion)) IN ('surprised') THEN 'verbazing'
      WHEN LOWER(TRIM(emotion)) IN ('acceptance') THEN 'acceptatie'
      WHEN LOWER(TRIM(emotion)) IN ('love') THEN 'liefde'
      ELSE emotion
    END,
    updated_at = NOW()
    WHERE LOWER(TRIM(emotion)) IN (
      'neutral', 'neutraal', 'uncertain', 'anxiety', 'fear', 'sad', 'sadness',
      'angry', 'anger', 'stressed', 'lonely', 'happy', 'joy', 'proud', 'calm',
      'relief', 'disappointed', 'shame', 'guilt', 'jealous', 'frustrated',
      'confused', 'hope', 'curious', 'surprised', 'acceptance', 'love'
    )
    RETURNING id
  )
  SELECT COUNT(*) INTO v_normalized FROM normalized;
  
  -- Also normalize unified_knowledge
  UPDATE public.unified_knowledge
  SET emotion = CASE
    WHEN LOWER(TRIM(emotion)) IN ('neutral', 'neutraal', 'uncertain') THEN 'onzekerheid'
    WHEN LOWER(TRIM(emotion)) IN ('anxiety', 'fear') THEN 'angst'
    WHEN LOWER(TRIM(emotion)) IN ('sad', 'sadness') THEN 'verdriet'
    WHEN LOWER(TRIM(emotion)) IN ('angry', 'anger') THEN 'woede'
    WHEN LOWER(TRIM(emotion)) IN ('stressed') THEN 'stress'
    WHEN LOWER(TRIM(emotion)) IN ('lonely') THEN 'eenzaamheid'
    WHEN LOWER(TRIM(emotion)) IN ('happy', 'joy') THEN 'blijdschap'
    WHEN LOWER(TRIM(emotion)) IN ('proud') THEN 'trots'
    WHEN LOWER(TRIM(emotion)) IN ('calm') THEN 'rust'
    WHEN LOWER(TRIM(emotion)) IN ('relief') THEN 'opluchting'
    WHEN LOWER(TRIM(emotion)) IN ('disappointed') THEN 'teleurstelling'
    WHEN LOWER(TRIM(emotion)) IN ('shame') THEN 'schaamte'
    WHEN LOWER(TRIM(emotion)) IN ('guilt') THEN 'schuld'
    WHEN LOWER(TRIM(emotion)) IN ('jealous') THEN 'jaloezie'
    WHEN LOWER(TRIM(emotion)) IN ('frustrated') THEN 'frustratie'
    WHEN LOWER(TRIM(emotion)) IN ('confused') THEN 'verwarring'
    WHEN LOWER(TRIM(emotion)) IN ('hope') THEN 'hoop'
    WHEN LOWER(TRIM(emotion)) IN ('curious') THEN 'nieuwsgierigheid'
    WHEN LOWER(TRIM(emotion)) IN ('surprised') THEN 'verbazing'
    WHEN LOWER(TRIM(emotion)) IN ('acceptance') THEN 'acceptatie'
    WHEN LOWER(TRIM(emotion)) IN ('love') THEN 'liefde'
    ELSE emotion
  END,
  updated_at = NOW()
  WHERE LOWER(TRIM(emotion)) IN (
    'neutral', 'neutraal', 'uncertain', 'anxiety', 'fear', 'sad', 'sadness',
    'angry', 'anger', 'stressed', 'lonely', 'happy', 'joy', 'proud', 'calm',
    'relief', 'disappointed', 'shame', 'guilt', 'jealous', 'frustrated',
    'confused', 'hope', 'curious', 'surprised', 'acceptance', 'love'
  );
  
  RETURN QUERY SELECT v_deleted_seeds, v_deleted_knowledge, v_normalized;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.cleanup_invalid_emotions() IS 'Removes invalid emotions and normalizes variations to standard emotion names';

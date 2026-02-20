-- ✅ LAYER 4: Meta-Learner Greeting Context
-- Add 'greeting' context type to fusion_weight_profiles

DO $$
BEGIN
  -- Check if greeting context already exists
  IF NOT EXISTS (
    SELECT 1 FROM public.fusion_weight_profiles 
    WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid 
    AND context_type = 'greeting'
  ) THEN
    -- Insert new greeting context
    INSERT INTO public.fusion_weight_profiles (
      user_id,
      context_type,
      symbolic_weight,
      neural_weight,
      sample_count,
      success_rate,
      is_candidate,
      metadata
    ) VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'greeting',
      0.2,  -- Low symbolic weight for greetings
      0.8,  -- High neural weight for conversational greetings
      0,
      0.0,
      false,  -- Production weight
      '{"description": "Greeting context: Favor neural (80%) for natural conversation, minimal symbolic (20%) for safety"}'::jsonb
    );
    RAISE NOTICE '✅ Inserted greeting context type';
  ELSE
    -- Update existing greeting context
    UPDATE public.fusion_weight_profiles
    SET
      symbolic_weight = 0.2,
      neural_weight = 0.8,
      metadata = '{"description": "Greeting context: Favor neural (80%) for natural conversation, minimal symbolic (20%) for safety"}'::jsonb,
      last_updated = NOW()
    WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid 
    AND context_type = 'greeting';
    RAISE NOTICE '✅ Updated existing greeting context type';
  END IF;
END $$;
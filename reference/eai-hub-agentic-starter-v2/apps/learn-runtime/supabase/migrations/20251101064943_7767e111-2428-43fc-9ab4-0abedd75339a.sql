-- Create fusion_weight_profiles table for Meta-Learner
CREATE TABLE IF NOT EXISTS public.fusion_weight_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  context_type TEXT NOT NULL,
  symbolic_weight FLOAT NOT NULL DEFAULT 0.7,
  neural_weight FLOAT NOT NULL DEFAULT 0.3,
  sample_count INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0.0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  is_candidate BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, context_type, is_candidate)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fusion_weights_context ON public.fusion_weight_profiles(context_type);
CREATE INDEX IF NOT EXISTS idx_fusion_weights_production ON public.fusion_weight_profiles(context_type, user_id) WHERE is_candidate = FALSE;
CREATE INDEX IF NOT EXISTS idx_fusion_weights_user ON public.fusion_weight_profiles(user_id);

-- Enable RLS
ALTER TABLE public.fusion_weight_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy for single user access
CREATE POLICY "Single user access to fusion_weight_profiles"
ON public.fusion_weight_profiles
FOR ALL
USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Insert default production weights for common context types
INSERT INTO public.fusion_weight_profiles (context_type, symbolic_weight, neural_weight, is_candidate, sample_count)
VALUES 
  ('crisis', 0.9, 0.1, FALSE, 0),
  ('low_confidence', 0.75, 0.25, FALSE, 0),
  ('normal', 0.7, 0.3, FALSE, 0),
  ('user_agency_high', 0.6, 0.4, FALSE, 0),
  ('high_confidence', 0.5, 0.5, FALSE, 0)
ON CONFLICT (user_id, context_type, is_candidate) DO NOTHING;
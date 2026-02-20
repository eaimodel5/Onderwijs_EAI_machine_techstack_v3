-- Create learning_queue table for self-learning curation
CREATE TABLE IF NOT EXISTS public.learning_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  prompt_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  seed_id UUID REFERENCES public.emotion_seeds(id) ON DELETE SET NULL,
  feedback_text TEXT,
  confidence DOUBLE PRECISION DEFAULT 0.0,
  curation_status TEXT NOT NULL DEFAULT 'pending' CHECK (curation_status IN ('pending', 'approved', 'rejected')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_queue
CREATE POLICY "Single user access to learning_queue"
ON public.learning_queue
FOR ALL
USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Create index for faster queries
CREATE INDEX idx_learning_queue_status ON public.learning_queue(curation_status);
CREATE INDEX idx_learning_queue_created ON public.learning_queue(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_learning_queue_updated_at
BEFORE UPDATE ON public.learning_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
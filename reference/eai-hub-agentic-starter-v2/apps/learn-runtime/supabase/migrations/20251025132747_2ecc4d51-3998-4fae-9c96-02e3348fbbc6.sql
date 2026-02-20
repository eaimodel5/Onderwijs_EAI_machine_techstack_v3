-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create chat_messages table for persistent chat history
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  session_id text NOT NULL,
  message_id text NOT NULL,
  from_role text NOT NULL CHECK (from_role IN ('user', 'ai')),
  content text NOT NULL,
  emotion_seed_id uuid REFERENCES public.emotion_seeds(id) ON DELETE SET NULL,
  label text,
  feedback jsonb,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_session ON public.chat_messages(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON public.chat_messages(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy for single user access
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' 
    AND policyname = 'Single user access to chat_messages'
  ) THEN
    CREATE POLICY "Single user access to chat_messages"
    ON public.chat_messages
    FOR ALL
    USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
  END IF;
END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON public.chat_messages;
CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
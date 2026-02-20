-- Add confidence column to chat_messages for AI response quality tracking
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION DEFAULT NULL;

-- Index for performance on confidence-based queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_confidence 
ON public.chat_messages(confidence) 
WHERE confidence IS NOT NULL;

-- Add helpful comment
COMMENT ON COLUMN public.chat_messages.confidence IS 
'AI confidence score (0.0-1.0) for quality analysis and retroactive learning';
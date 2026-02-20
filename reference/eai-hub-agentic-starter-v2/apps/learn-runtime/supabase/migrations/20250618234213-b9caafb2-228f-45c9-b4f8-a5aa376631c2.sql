
-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for storing vector embeddings of messages and seeds
CREATE TABLE public.vector_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL, -- References seed_id or message_id
  content_type TEXT NOT NULL CHECK (content_type IN ('seed', 'message', 'conversation')),
  content_text TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embedding size
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX ON public.vector_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Create table for decision engine logs
CREATE TABLE public.decision_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_input TEXT NOT NULL,
  symbolic_matches JSONB DEFAULT '[]',
  neural_similarities JSONB DEFAULT '[]',
  hybrid_decision JSONB NOT NULL,
  final_response TEXT NOT NULL,
  confidence_score DOUBLE PRECISION NOT NULL,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for self-reflection and learning logs
CREATE TABLE public.reflection_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('feedback', 'pattern', 'error', 'improvement')),
  context JSONB NOT NULL,
  insights JSONB DEFAULT '[]',
  actions_taken JSONB DEFAULT '[]',
  new_seeds_generated INTEGER DEFAULT 0,
  learning_impact DOUBLE PRECISION DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION public.find_similar_embeddings(
  query_embedding vector(1536),
  similarity_threshold DOUBLE PRECISION DEFAULT 0.7,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  content_id UUID,
  content_type TEXT,
  content_text TEXT,
  similarity_score DOUBLE PRECISION,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ve.content_id,
    ve.content_type,
    ve.content_text,
    1 - (ve.embedding <=> query_embedding) as similarity_score,
    ve.metadata
  FROM public.vector_embeddings ve
  WHERE 1 - (ve.embedding <=> query_embedding) > similarity_threshold
  ORDER BY ve.embedding <=> query_embedding
  LIMIT max_results;
END;
$$;

-- Create function to log decision process
CREATE OR REPLACE FUNCTION public.log_hybrid_decision(
  p_user_input TEXT,
  p_symbolic_matches JSONB,
  p_neural_similarities JSONB,
  p_hybrid_decision JSONB,
  p_final_response TEXT,
  p_confidence_score DOUBLE PRECISION,
  p_processing_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  decision_id UUID;
BEGIN
  INSERT INTO public.decision_logs (
    user_input,
    symbolic_matches,
    neural_similarities,
    hybrid_decision,
    final_response,
    confidence_score,
    processing_time_ms
  ) VALUES (
    p_user_input,
    p_symbolic_matches,
    p_neural_similarities,
    p_hybrid_decision,
    p_final_response,
    p_confidence_score,
    p_processing_time_ms
  ) RETURNING id INTO decision_id;
  
  RETURN decision_id;
END;
$$;

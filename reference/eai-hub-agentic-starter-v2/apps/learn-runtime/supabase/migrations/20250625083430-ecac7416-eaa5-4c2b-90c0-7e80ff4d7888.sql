
-- Voeg RLS toe aan vector_embeddings tabel voor gebruiker-specifieke toegang
ALTER TABLE public.vector_embeddings ENABLE ROW LEVEL SECURITY;

-- Maak RLS policies voor vector_embeddings
CREATE POLICY "Users can view their own embeddings" 
  ON public.vector_embeddings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own embeddings" 
  ON public.vector_embeddings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own embeddings" 
  ON public.vector_embeddings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own embeddings" 
  ON public.vector_embeddings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Voeg RLS toe aan emotion_seeds tabel
ALTER TABLE public.emotion_seeds ENABLE ROW LEVEL SECURITY;

-- Maak een user_id kolom voor emotion_seeds
ALTER TABLE public.emotion_seeds ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Maak RLS policies voor emotion_seeds
CREATE POLICY "Users can view their own seeds" 
  ON public.emotion_seeds 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own seeds" 
  ON public.emotion_seeds 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seeds" 
  ON public.emotion_seeds 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seeds" 
  ON public.emotion_seeds 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Maak een nieuwe tabel voor de unified decision core
CREATE TABLE public.unified_knowledge (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  content_type text NOT NULL, -- 'seed', 'embedding', 'pattern', 'insight'
  emotion text NOT NULL,
  triggers text[] DEFAULT '{}',
  response_text text,
  confidence_score double precision DEFAULT 0.0,
  usage_count integer DEFAULT 0,
  last_used timestamp with time zone,
  metadata jsonb DEFAULT '{}',
  vector_embedding vector(1536), -- voor OpenAI embeddings
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  active boolean DEFAULT true
);

-- Voeg RLS toe aan unified_knowledge
ALTER TABLE public.unified_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own knowledge" 
  ON public.unified_knowledge 
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Maak een functie voor geavanceerde similarity search
CREATE OR REPLACE FUNCTION public.search_unified_knowledge(
  query_text text,
  query_embedding vector(1536),
  user_uuid uuid,
  similarity_threshold double precision DEFAULT 0.7,
  max_results integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  content_type text,
  emotion text,
  response_text text,
  confidence_score double precision,
  similarity_score double precision,
  metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uk.id,
    uk.content_type,
    uk.emotion,
    uk.response_text,
    uk.confidence_score,
    1 - (uk.vector_embedding <=> query_embedding) as similarity_score,
    uk.metadata
  FROM public.unified_knowledge uk
  WHERE 
    uk.user_id = user_uuid
    AND uk.active = true
    AND (
      uk.emotion ILIKE '%' || query_text || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(uk.triggers) as trigger_word
        WHERE trigger_word ILIKE '%' || query_text || '%'
      )
      OR (uk.vector_embedding IS NOT NULL AND 1 - (uk.vector_embedding <=> query_embedding) > similarity_threshold)
    )
  ORDER BY 
    CASE 
      WHEN uk.emotion ILIKE '%' || query_text || '%' THEN 1
      WHEN EXISTS (SELECT 1 FROM unnest(uk.triggers) as trigger_word WHERE trigger_word ILIKE '%' || query_text || '%') THEN 2
      ELSE 3
    END,
    1 - (uk.vector_embedding <=> query_embedding) DESC,
    uk.usage_count DESC
  LIMIT max_results;
END;
$$;

-- Maak een functie voor knowledge consolidatie
CREATE OR REPLACE FUNCTION public.consolidate_knowledge()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Migreer bestaande emotion_seeds naar unified_knowledge
  INSERT INTO public.unified_knowledge (
    user_id, content_type, emotion, triggers, response_text, 
    confidence_score, usage_count, metadata, created_at, updated_at, active
  )
  SELECT 
    COALESCE(es.user_id, auth.uid()),
    'seed',
    es.emotion,
    COALESCE((es.meta->>'triggers')::text[], ARRAY[es.emotion]),
    COALESCE(es.response->>'nl', 'Ik begrijp hoe je je voelt.'),
    COALESCE((es.meta->>'confidence')::double precision, 0.8),
    COALESCE((es.meta->>'usageCount')::integer, 0),
    es.meta,
    es.created_at,
    es.updated_at,
    es.active
  FROM public.emotion_seeds es
  WHERE NOT EXISTS (
    SELECT 1 FROM public.unified_knowledge uk 
    WHERE uk.content_type = 'seed' AND uk.emotion = es.emotion AND uk.user_id = COALESCE(es.user_id, auth.uid())
  );
  
  -- Migreer bestaande vector_embeddings naar unified_knowledge
  INSERT INTO public.unified_knowledge (
    user_id, content_type, emotion, response_text, 
    confidence_score, metadata, vector_embedding, created_at, updated_at
  )
  SELECT 
    ve.user_id,
    'embedding',
    COALESCE(ve.metadata->>'emotion', 'unknown'),
    ve.content_text,
    0.7,
    ve.metadata,
    ve.embedding,
    ve.created_at,
    ve.updated_at
  FROM public.vector_embeddings ve
  WHERE NOT EXISTS (
    SELECT 1 FROM public.unified_knowledge uk 
    WHERE uk.content_type = 'embedding' AND uk.user_id = ve.user_id
  );
END;
$$;

-- Index voor betere performance
CREATE INDEX idx_unified_knowledge_user_emotion ON public.unified_knowledge(user_id, emotion);
CREATE INDEX idx_unified_knowledge_vector ON public.unified_knowledge USING ivfflat (vector_embedding vector_cosine_ops);
CREATE INDEX idx_unified_knowledge_triggers ON public.unified_knowledge USING gin(triggers);


-- Update database schema for EvAI 2.0 with Google API key support
-- Add Google API key support to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_key_user ON settings(key, user_id);

-- Add Google API configuration support
INSERT INTO settings (key, value, user_id, category) 
VALUES ('google-api-key', '', '00000000-0000-0000-0000-000000000001', 'api_keys')
ON CONFLICT (key, user_id) DO NOTHING;

-- Update unified_knowledge table for better performance
ALTER TABLE unified_knowledge ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_unified_knowledge_search ON unified_knowledge USING gin(search_vector);

-- Update search function to handle Google API integration
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.emotion, '') || ' ' || 
        COALESCE(NEW.response_text, '') || ' ' || 
        COALESCE(array_to_string(NEW.triggers, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic search vector updates
DROP TRIGGER IF EXISTS update_search_vector_trigger ON unified_knowledge;
CREATE TRIGGER update_search_vector_trigger
    BEFORE INSERT OR UPDATE ON unified_knowledge
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- Enhanced API collaboration logging for Google API
ALTER TABLE api_collaboration_logs ADD COLUMN IF NOT EXISTS google_api_used BOOLEAN DEFAULT FALSE;
ALTER TABLE api_collaboration_logs ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '2.0';

-- Update log_evai_workflow function to support Google API
CREATE OR REPLACE FUNCTION log_evai_workflow(
  p_conversation_id text,
  p_workflow_type text,
  p_api_collaboration jsonb,
  p_rubrics_data jsonb DEFAULT NULL::jsonb,
  p_processing_time integer DEFAULT NULL::integer,
  p_success boolean DEFAULT true,
  p_error_details jsonb DEFAULT NULL::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    new_log_id UUID;
BEGIN
    INSERT INTO public.api_collaboration_logs (
        user_id,
        session_id,
        workflow_type,
        api1_used,
        api2_used,
        vector_api_used,
        google_api_used,
        seed_generated,
        secondary_analysis,
        processing_time_ms,
        success,
        error_details,
        metadata,
        version
    ) VALUES (
        '00000000-0000-0000-0000-000000000001'::uuid,
        p_conversation_id,
        p_workflow_type,
        COALESCE((p_api_collaboration->>'api1Used')::boolean, false),
        COALESCE((p_api_collaboration->>'api2Used')::boolean, false),
        COALESCE((p_api_collaboration->>'vectorApiUsed')::boolean, false),
        COALESCE((p_api_collaboration->>'googleApiUsed')::boolean, false),
        COALESCE((p_api_collaboration->>'seedGenerated')::boolean, false),
        COALESCE((p_api_collaboration->>'secondaryAnalysis')::boolean, false),
        p_processing_time,
        p_success,
        p_error_details,
        COALESCE(p_rubrics_data, '{}'::jsonb),
        '2.0'
    )
    RETURNING id INTO new_log_id;
    
    RETURN new_log_id;
END;
$$;

-- Create function for Google API key management
CREATE OR REPLACE FUNCTION get_google_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    RETURN (
        SELECT value 
        FROM public.settings 
        WHERE key = 'google-api-key' 
        AND user_id = '00000000-0000-0000-0000-000000000001'::uuid
        LIMIT 1
    );
END;
$$;

-- Create function to update Google API key
CREATE OR REPLACE FUNCTION update_google_api_key(api_key TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    INSERT INTO public.settings (key, value, user_id, category)
    VALUES ('google-api-key', api_key, '00000000-0000-0000-0000-000000000001'::uuid, 'api_keys')
    ON CONFLICT (key, user_id)
    DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END;
$$;

-- Ensure RLS policies are active for all tables
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_collaboration_logs ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for single-user mode
CREATE POLICY "Single user access to settings" ON settings
    FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Single user access to unified_knowledge" ON unified_knowledge
    FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Single user access to api_collaboration_logs" ON api_collaboration_logs
    FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

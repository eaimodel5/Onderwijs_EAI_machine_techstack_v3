-- Cleanup: Verwijder Google API key functies en legacy settings
-- Dit maakt het systeem 100% server-side via Supabase Secrets

-- 1. Verwijder Google API key RPC functies
DROP FUNCTION IF EXISTS public.get_google_api_key();
DROP FUNCTION IF EXISTS public.update_google_api_key(TEXT);

-- 2. Verwijder alle legacy API key settings uit database
DELETE FROM public.settings WHERE key IN (
  'openai-api-key',
  'openai-api-key-2', 
  'vector-api-key',
  'google-api-key'
);

-- 3. Log de cleanup actie
COMMENT ON TABLE public.settings IS 'System settings table - All API keys are now managed server-side via Supabase Secrets (OPENAI_API_KEY, OPENAI_API_KEY_SECONDARY, VECTOR_API_KEY). Google API key functionality removed as unused.';
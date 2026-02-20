
-- Create a function to get setting by key with default value
CREATE OR REPLACE FUNCTION public.get_setting(setting_key TEXT, default_value TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  setting_value TEXT;
BEGIN
  SELECT value INTO setting_value 
  FROM public.settings 
  WHERE key = setting_key;
  
  IF setting_value IS NULL THEN
    RETURN default_value;
  END IF;
  
  RETURN setting_value;
END;
$$;

-- Insert default rubric strictness setting if it doesn't exist
INSERT INTO public.settings (key, value, updated_at)
VALUES ('rubric_strictness', 'flexible', now())
ON CONFLICT (key) DO NOTHING;

-- Create a function to update settings
CREATE OR REPLACE FUNCTION public.update_setting(setting_key TEXT, setting_value TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.settings (key, value, updated_at)
  VALUES (setting_key, setting_value, now())
  ON CONFLICT (key) 
  DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = EXCLUDED.updated_at;
END;
$$;

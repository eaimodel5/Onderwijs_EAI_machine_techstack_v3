
-- 1. Maak een profiles tabel voor gebruikersgegevens
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- 2. Maak een trigger om automatisch een profiel aan te maken bij registratie
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Voeg user_id kolom toe aan settings tabel
ALTER TABLE public.settings ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Maak settings key + user_id combinatie uniek
ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS settings_key_key;
ALTER TABLE public.settings ADD CONSTRAINT settings_key_user_unique UNIQUE (key, user_id);

-- 5. Enable RLS op alle tabellen
ALTER TABLE public.emotion_seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seed_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seed_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vector_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies voor profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 7. RLS policies voor settings (per gebruiker)
CREATE POLICY "Users can view own settings" ON public.settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON public.settings
  FOR DELETE USING (auth.uid() = user_id);

-- 8. RLS policies voor seed_feedback
CREATE POLICY "Users can view own feedback" ON public.seed_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own feedback" ON public.seed_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. RLS policies voor vector_embeddings
CREATE POLICY "Users can view own embeddings" ON public.vector_embeddings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own embeddings" ON public.vector_embeddings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. RLS policies voor decision_logs
CREATE POLICY "Users can view own decisions" ON public.decision_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own decisions" ON public.decision_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. RLS policies voor reflection_logs
CREATE POLICY "Users can view own reflections" ON public.reflection_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reflections" ON public.reflection_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. Update bestaande settings functies om user context te ondersteunen
CREATE OR REPLACE FUNCTION public.get_user_setting(setting_key text, default_value text DEFAULT NULL::text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT value 
    FROM public.settings 
    WHERE key = setting_key 
    AND user_id = auth.uid() 
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_setting(setting_key text, setting_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.settings(key, value, user_id)
  VALUES(setting_key, setting_value, auth.uid())
  ON CONFLICT (key, user_id)
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END;
$$;

-- 13. Emotion seeds blijven globaal toegankelijk (alleen lezen)
CREATE POLICY "Everyone can view active emotion seeds" ON public.emotion_seeds
  FOR SELECT USING (active = true);

-- 14. Seed rubrics kunnen door iedereen gelezen worden
CREATE POLICY "Everyone can view seed rubrics" ON public.seed_rubrics
  FOR SELECT USING (true);

-- 15. Rubrics tabel blijft open voor lezen
CREATE POLICY "Everyone can view rubrics" ON public.rubrics
  FOR SELECT USING (true);

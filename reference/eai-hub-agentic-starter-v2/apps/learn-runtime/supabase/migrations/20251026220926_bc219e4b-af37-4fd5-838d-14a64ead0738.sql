-- ============================================
-- POPULATE KNOWLEDGE BASE: Consolideer + seed voorbeelden
-- ============================================

-- Consolideer bestaande data eerst
SELECT consolidate_knowledge();

-- Voeg enkele basis emotion seeds toe als de database leeg is
INSERT INTO emotion_seeds (emotion, label, response, active, user_id, meta)
SELECT 
  e.emotion,
  e.label,
  e.response::jsonb,
  true,
  '00000000-0000-0000-0000-000000000001'::uuid,
  jsonb_build_object(
    'confidence', 0.85,
    'usageCount', 0,
    'triggers', e.triggers,
    'source', 'bootstrap'
  )
FROM (VALUES
  ('angst', 'Valideren', '{"nl": "Ik hoor dat je angstig bent. Dat is een begrijpelijk gevoel. Wat maakt je op dit moment het meest onzeker?"}', ARRAY['bang', 'onzeker', 'zenuwachtig', 'gespannen']),
  ('verdriet', 'Valideren', '{"nl": "Het klinkt alsof je verdrietig bent. Dat mag er zijn. Waar voel je het verdriet het meest?"}', ARRAY['droevig', 'bedroefd', 'verdrietig', 'down']),
  ('woede', 'Reflectievraag', '{"nl": "Ik merk boosheid in je woorden. Wat triggert die frustratie voor jou?"}', ARRAY['boos', 'gefrustreerd', 'geïrriteerd', 'kwaad']),
  ('stress', 'Valideren', '{"nl": "Je lijkt behoorlijk onder druk te staan. Wat is het meest urgent voor jou nu?"}', ARRAY['druk', 'hectisch', 'overweldigd', 'moe']),
  ('eenzaamheid', 'Reflectievraag', '{"nl": "Eenzaamheid is zwaar. Mis je iets specifieks, of is het een algemeen gevoel?"}', ARRAY['alleen', 'eenzaam', 'verlaten', 'geïsoleerd']),
  ('blijdschap', 'Valideren', '{"nl": "Wat fijn om te horen dat je blij bent! Wat geeft je die vreugde?"}', ARRAY['blij', 'gelukkig', 'vrolijk', 'happy']),
  ('onzekerheid', 'Reflectievraag', '{"nl": "Onzekerheid kan verlammend zijn. Waar twijfel je het meest over?"}', ARRAY['twijfel', 'onzeker', 'weet niet', 'misschien'])
) AS e(emotion, label, response, triggers)
WHERE NOT EXISTS (
  SELECT 1 FROM emotion_seeds 
  WHERE active = true 
  AND user_id = '00000000-0000-0000-0000-000000000001'::uuid
  LIMIT 1
)
ON CONFLICT (id) DO NOTHING;

-- Run consolidatie opnieuw om de nieuwe seeds naar unified_knowledge te migreren
SELECT consolidate_knowledge();
# Owner Operations: stuurmechanismen voor de card printer

Als eigenaar van de Onderwijs EAI machine wil je drie dingen kunnen:
1) bepalen wat er mag
2) bepalen wat er bewezen moet worden
3) bepalen wanneer iets "releasewaardig" is

## 1. Owner policy
Bestand: owner/OWNER_POLICY.yaml
Hierin zet je:
- maximale taakdichtheid per kennisniveau
- welke output contracts verplicht zijn per context
- welke evidence claims verplicht zijn

## 2. SSOT updates
- Voeg een nieuwe SSOT json toe in ssot/
- Draai de volledige test suite
- Maak migratienotes
- Release een nieuwe machine versie

## 3. Evidence updates
- Voeg bronnen toe in machine/packages/eai-evidence/sources.json
- Voeg claims toe in machine/packages/eai-evidence/claims.json
- Draai validate-evidence tool

## 4. Certificeren van cards
Je kunt cards labelen:
- Draft: nog niet gevalideerd
- Verified: door tests en schema validatie
- Certified: owner heeft een contextlabel toegekend (bijvoorbeeld "toetsvoorbereiding onder toezicht")


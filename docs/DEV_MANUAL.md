# Developer Manual: Onderwijs EAI machine (card printer)

Deze manual is bedoeld voor bouwteams zonder voorkennis van AI engineering, maar met de ambitie om het goed te doen. Je hoeft geen LLM-expert te zijn om hiermee te starten, zolang je bereid bent om strikt te werken met contracten, logging en validatie.

Inhoud
1. Conceptueel overzicht
2. Componenten en verantwoordelijkheden
3. Datacontracten: SSOT, EAI-card, runlog, evidence
4. Card printer pipeline (healing en validatie)
5. BYOL LLM gateway (provider-onafhankelijk)
6. Release en governance
7. Uitbreiden: nieuwe rubrics, nieuwe evidence, nieuwe UI

## 1. Conceptueel overzicht
De Onderwijs EAI machine doet 1 ding: EAI-cards genereren die didactisch kloppen en controleerbaar zijn.

Daarvoor gebruikt de machine vier bronnen:
- SSOT: de normatieve rubrics, volgorde en regels (ssot/)
- Owner config: wat jij als eigenaar wel of niet toelaat (owner/)
- Evidence-pack: bronnen en claims gekoppeld aan ontwerpkeuzes (machine/packages/eai-evidence)
- Inputs: de onderwijscontext van de gebruiker (vak, niveau, taak, fase, gewenste taakdichtheid)

De machine levert drie outputs:
- EAI-card (JSON) plus een printbare card-tekst
- Validatierapport (wat is afgedwongen, wat is aangepast, waarom)
- Runlog schema (wat er gelogd moet worden om het proces te kunnen auditen)

## 2. Componenten
machine/packages/eai-kernel
- Laadt SSOT, leest rubrics, past logic gates toe en bouwt een card
- Produceert ook de printbare prompttekst voor in elke LLM

machine/packages/eai-schemas
- JSON Schemas voor card en runlog
- Dit is jouw contract: alles wat het platform opslaat of verstuurt moet hieraan voldoen

machine/packages/eai-evidence
- Evidence bronnen en claims, inclusief mapping naar rubrics
- Dit maakt "evidence-informed" controleerbaar in plaats van marketingtekst

machine/apps/api
- Referentie API om cards te printen en te valideren
- Kan serverless, containerized of on-prem draaien

machine/tools
- CLI tools voor printen, valideren, en releases

## 3. Datacontracten
SSOT
- ssot/ssot_nl_15.0.0_master_full.json is leidend
- De belangrijkste velden voor het printer-proces:
  - metadata.cycle.order (volgorde van rubrics)
  - rubrics (band definities)
  - interaction_protocol.logic_gates (afdwingregels)
  - trace_schema (wat er gelogd moet worden)

EAI-card (v2)
- Schema: machine/packages/eai-schemas/eai_card_v2.schema.json
- Minimale kernvelden:
  - meta: id, versies, timestamps
  - context: onderwijscontext
  - bands: de gekozen rubric-banden
  - policy: toegestaan en verboden gebruik
  - prompt_pack: de tekst die overal werkt
  - output_contract: verplichte outputstructuur
  - trace_requirements: logvereisten

Runlog (v2)
- Schema: machine/packages/eai-schemas/eai_runlog_v2.schema.json
- Doel: bewijs van proces, niet van "of de AI gelijk had"

Evidence
- sources.json: bibliografische bronnen (peer reviewed, handbooks, meta-analyses)
- claims.json: claims die expliciet gekoppeld zijn aan ontwerpkeuzes in SSOT en patterns
- patterns.json: uitvoerbare ontwerp-patronen die claims bundelen en herbruikbaar maken

Evidence tests
- machine/tests/run_evidence_tests.mjs: controleert dat bronnen, claims en patterns naar elkaar verwijzen zonder gaten

## 4. Card printer pipeline
Pipeline in het kort:
1) Input normaliseren (van UI naar CardInput)
2) Bands selecteren (door gebruiker of via rules)
3) Logic gates afdwingen (SSOT en owner config)
4) Guardrails en transparency eisen inbouwen
5) Output contract kiezen (schema of format)
6) Card genereren (JSON + print tekst)
7) Valideren tegen schema en test vectors
8) Signeren en releasen (optioneel, maar aangeraden)

Healing
- Als een gebruiker een combinatie kiest die didactisch instabiel is, corrigeert de machine dit.
- De correctie wordt altijd uitgelegd in het validatierapport.

## 5. BYOL LLM gateway
De machine praat niet direct met een provider tenzij jij dat wilt.
De gateway specificatie is simpel:
- input: messages[], tools[] (optioneel), model_hint (optioneel)
- output: assistant_message plus usage metrics

Adapters die je kunt bouwen:
- OpenAI-compatible endpoints (ook veel self-hosted gateways)
- Anthropic Messages API
- Google Gemini API
- Lokaal model (llama.cpp, vLLM)

In deze techstack leveren we alleen een gateway-spec (docs/LLM_GATEWAY_SPEC.md). Je kunt zelf adapters bouwen naar elke provider of self-hosted gateway. De card en SSOT blijven gelijk.

## 6. Release en governance
Owner controls:
- owner/OWNER_POLICY.yaml: wat mag, wat niet
- docs/RELEASE_PROCESS.md: hoe je SSOT en evidence updatet zonder dat alles breekt
- machine/tests: test vectors om regressies te vangen

## 7. Uitbreiden
Nieuwe rubrics of SSOT versies:
- voeg de nieuwe SSOT json toe in ssot/
- update machine/packages/eai-kernel/src/ssotLoader.ts

Nieuwe evidence:
- voeg bronnen toe in sources.json
- koppel claims aan rubrics en patterns in claims.json
- run: machine/tests/run_evidence_tests.mjs

Nieuwe UI:
- hergebruik reference/studio-v10 of reference/eai-hub-agentic-starter-v2 als startpunt
- zorg dat alle UI invoer eindigt als CardInput volgens schema


# Onderwijs EAI Machine Techstack v3
LLM-onafhankelijk en evidence-informed.

Dit repository is de technische basis om de **Onderwijs‑EAI machine** te bouwen: een **card printer** die EAI-cards genereert op basis van een **Single Source of Truth (SSOT)**, rubrics, evidence en validatie.

De output (de **EAI-card**) werkt in elke LLM en in elke omgeving: van simpel kopieer‑plak promptgebruik tot agentic en vibecoding workflows en API‑integraties.

## Wat je hier vindt

- `machine/`  
  De kern (kernel, schemas, evidence-pack, tools, tests).
- `ssot/`  
  SSOT v15.0.0 (NL) als master: rubrics + **logic gates** (normatieve regels).
- `owner/`  
  Eigenaar‑besturing (policy, overrides, release discipline).
- `docs/`  
  Developer manual, governance, release, no vendor lock‑in, database en API spec.
- `reference/`  
  Aangeleverde projectbases ter vergelijking en hergebruik (studio v10, agentic starter v2, framework v1).

## Belangrijk uitgangspunt

**BYOL**: jij kiest je LLM en provider. De machine levert geen model.  
De card en de contracten blijven hetzelfde, ook als je model wisselt.

## Snel starten (lokaal)

1. Installeer Node 18+.
2. Ga naar `machine/` en installeer dependencies:

```bash
cd machine
npm install
```

3. Draai tests:

```bash
npm test
```

4. Print een card met voorbeeldinput:

```bash
npm run print-card
```

De output verschijnt in `machine/out/` als:
- `<card_id>.eai_card.json`
- `<card_id>.paste_prompt.txt`

## Evidence en patterns

`machine/packages/eai-evidence` bevat:
- `sources.json`
- `claims.json`
- `patterns.json`

De evidence-integriteitstest staat in:
- `machine/tests/run_evidence_tests.mjs`

## Specs en governance

- `docs/DEV_MANUAL.md` – architectuur en pipeline
- `docs/GOVERNANCE.md` – statusmodel en pinned vs latest
- `docs/RELEASE_PROCESS.md` – updates zonder drift
- `docs/NO_VENDOR_LOCKIN.md` – BYOL principes
- `docs/api/openapi.json` – API contract
- `docs/database/schema.sql` – referentie opslagmodel

## Versies

- SSOT: 15.0.0 (`ssot/ssot_nl_15.0.0_master_full.json`)
- Techstack: v3, datum: 2026-02-19 (Europe/Amsterdam)

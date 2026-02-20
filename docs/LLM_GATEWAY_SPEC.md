# BYOL LLM gateway spec

Doel: één dunne interface tussen de Onderwijs EAI machine en welke LLM omgeving je ook kiest.

Waarom dit bestaat:
- LLM providers veranderen snel
- Je wilt cards, runlogs en rubrics stabiel houden
- Je wilt kunnen wisselen zonder herontwerp van didactiek

## Interface (concept)
Request
- messages: [{ role: "system" | "user" | "assistant", content: string }]
- tools: optioneel, een lijst met tool specs (function calling)
- model_hint: optioneel, bijvoorbeeld "gpt-4.1" of "gemini-2.0"
- safety_mode: optioneel, "classroom" | "assessment"

Response
- message: { role: "assistant", content: string }
- usage: tokens of andere metrieken indien beschikbaar
- provider_meta: optioneel (model, latency, etc)

## Aanbevolen implementatie
1) OpenAI-compatible adapter als default
Veel gateways en self-hosted oplossingen ondersteunen deze vorm. Dit is compatibiliteit, geen vendor-keuze.

2) Provider specifieke adapters
- Anthropic
- Google Gemini
- Azure OpenAI
- vLLM of andere self-hosted endpoints

## Logging
- log altijd: card_id, ssot_version, adapter, model_hint, latency
- log nooit: persoonsgegevens in plaintext als je dat kunt vermijden


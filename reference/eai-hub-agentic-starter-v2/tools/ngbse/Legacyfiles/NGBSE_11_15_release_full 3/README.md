
# NGBSE 11.1 - Final Genesis (Purist, Clearnet)
- 100% echte, verifieerbare bronnen (Censys/Shodan/LeakIX/Wayback/urlscan/GitHub).
- Validatie via allowlist (nooit intrusief).
- E_AI*-scoring + synthese + blindspot-analyse.
- Exporteert naar CSV, STIX 2.1 en Word (.docx).

## Snelstart
```bash
python -m pip install -r requirements.txt
cp .env.example .env   # Vul API keys
python -m engine.orchestrator
# Resultaten: ./out/
```


## 11.15 - Online-only LLM
Deze release is online-only: geen lokale LLM nodig. Configureer je provider via `llm:` in `config/ngbse.config.yml` of via ENV:
- `NGBSE_LLM_PROVIDER` (openai|azure|anthropic)
- `NGBSE_LLM_ENDPOINT`
- `NGBSE_LLM_MODEL`
- `NGBSE_LLM_KEY`
- `NGBSE_LLM_API_VERSION` (alleen Azure, optioneel)

# NGBSE 16.0 "Genesis"

Een pure online **OSINT-engine** die de technische robuustheid van de 11.1-architectuur combineert met de asset-centrische analysepijplijn uit 12.0 en het E_AI* scoringsmodel.
Deze release bevat daarnaast de **Forecast & Scenario Engine** voor trend-extrapolatie en toekomstscenario's.

## Kern
- **Architectuur**: engine → collectors → enrich → export → report
- **Pijplijn**: Verzamelen → Asset Clustering → Valideren (per asset) → Verrijken (per asset) → Scoren (per asset) → Synthese & Blindspots → Forecast & Scenarios
- **Scoring** (*E_AI*): M, C, Q, V met dynamische parameters
- **LLM Synthese**: BLUF/Risk/Confidence/Action + scenario's (indien API-keys aanwezig)
- **Governance**: LEGAL & ETHICAL USE POLICY, Human-in-the-Loop sign-off, MANIFEST.json met hashes
- **Export**: STIX 2.1 via `stix2`
- **LLM client**: online-only via OpenAI, Azure OpenAI of Anthropic (env vars)

## Snelstart
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py --config ngbse.config.yml --seeds seeds.jsonl --out out/
```

> Zonder API-keys draait de engine nog steeds (zonder LLM-synthese en scenario's).

## LEGAL & ETHICAL USE POLICY
- Alleen voor **legitiem, geautoriseerd en defensief** OSINT-gebruik.
- **Geen** toegang tot systemen of datasets zonder toestemming; **geen** misbruik van gegevens.
- De **allowlist** in `ngbse.config.yml` is de primaire technische controle. Collectors voeren niets uit buiten de allowlist.
- De .docx-rapportage bevat een verplichte **Analyst Review & Sign-off**-pagina.
- Gebruikers zijn verantwoordelijk voor naleving van toepasselijke wet- en regelgeving (o.a. EU AI Act).

## Mappen
- `ngbse/` - broncode
- `templates/` - rapportsjabloon
- `out/` - uitvoer (findings.jsonl, MANIFEST.json, reports, stix/)
- `tests/` - smoke tests
- `examples/` - voorbeeld seeds en config


### Extra collectors & API-keys
- URLScan: `URLSCAN_API_KEY`
- GitHub: `GITHUB_TOKEN`
- Shodan: `SHODAN_API_KEY`
- Censys: `CENSYS_API_ID`, `CENSYS_API_SECRET`
- Leakix: `LEAKIX_API_KEY`


## Migratie van legacy seeds → 16.0-formaat
Voorbeeld:
```bash
python tools/migrate_seeds.py legacy_seeds.txt seeds.jsonl
# of
python tools/migrate_seeds.py legacy_seeds.json seeds.jsonl --priority 0.8 --time-window-days 45
```

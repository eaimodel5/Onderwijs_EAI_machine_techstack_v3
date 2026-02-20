
# NGBSE-2 - Extras (Censys/LeakIX/Shodan)

Presence-only collectors to extend your Next Gen Blind Spot Engine.
All queries are clearnet, legal, and **do not** authenticate to targets or download content.

## Setup
```
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill API keys
./run.sh
```

## .env
- CENSYS_API_KEY=...
- LEAKIX_API_KEY=...   # optional for higher rate limits
- SHODAN_API_KEY=...

## Output
`findings.jsonl` with records:
```
{"ts":"...","source":"shodan","query":"port:1883 MQTT country:NL","id":"1.2.3.4","url":null,"meta":{"port":1883,"org":"...","location":{...}}}
```

## Notes
- Presence logging only: URL/result-id/timestamp + meta; no content downloads.
- Use `enrich/mirror_score.py` and `eai/e_ai_score.py` from core engine to compute E_AI* with mirror factor.

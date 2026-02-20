# NGBSE 11.15 - Quickstart (Online-only)

## 1) Install (local)
```bash
python -m pip install -r requirements.txt
pip install -e .
```

## 2) Configure LLM (online-only)
Set via ENV:
```bash
export NGBSE_LLM_PROVIDER=openai        # of azure | anthropic
export NGBSE_LLM_ENDPOINT=https://api.openai.com/v1/chat/completions
export NGBSE_LLM_MODEL=gpt-4o-mini
export NGBSE_LLM_KEY=sk-...
```
of via `config/ngbse.config.yml` onder `llm:`.

## 3) Run
```bash
ngbse --config config/ngbse.config.yml
```
Outputs verschijnen in `out/`:
- findings.jsonl, findings.csv, findings.stix.json, NGBSE_11_Report.docx
- run.log.jsonl, MANIFEST.json

## 4) Docker (optioneel)
```bash
docker build -t ngbse:11.15 .
docker run --rm -e NGBSE_LLM_PROVIDER=openai   -e NGBSE_LLM_ENDPOINT=https://api.openai.com/v1/chat/completions   -e NGBSE_LLM_MODEL=gpt-4o-mini   -e NGBSE_LLM_KEY=sk-...   ngbse:11.15
```

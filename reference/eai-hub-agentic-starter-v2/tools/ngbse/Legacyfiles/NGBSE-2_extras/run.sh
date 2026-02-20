#!/usr/bin/env bash
set -euo pipefail
export NGBSE_SEEDS=${NGBSE_SEEDS:-data/seeds.jsonl}
export NGBSE_OUT=${NGBSE_OUT:-findings.jsonl}

# Clean previous findings
: > "$NGBSE_OUT"

echo "[NGBSE-2 extras] Running collectors..."
python3 collectors/censys_collect.py || true
python3 collectors/leakix_collect.py || true
python3 collectors/shodan_collect.py || true

echo "[NGBSE-2 extras] Done. Findings at $NGBSE_OUT"

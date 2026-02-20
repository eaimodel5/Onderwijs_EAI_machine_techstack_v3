#!/usr/bin/env bash
set -euo pipefail
python3 -m pip install -r requirements.txt
python3 engine/orchestrator.py
python3 enrich/mirror_score.py
python3 eai/e_ai_score.py
python3 report/make_report.py
echo "Done."

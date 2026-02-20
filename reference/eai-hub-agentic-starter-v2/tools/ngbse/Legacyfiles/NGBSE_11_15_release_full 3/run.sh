
#!/usr/bin/env bash
set -e
echo ">>> NGBSE 11.1 starten..."
if [ ! -f .env ]; then cp .env.example .env; fi
python -m pip install -r requirements.txt
python -m engine.orchestrator "$@"

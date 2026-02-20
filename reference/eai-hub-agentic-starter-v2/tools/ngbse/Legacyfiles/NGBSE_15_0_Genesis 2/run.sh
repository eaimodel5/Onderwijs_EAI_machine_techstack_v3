#!/usr/bin/env bash
set -euo pipefail
mkdir -p out
ngbse --config ngbse.config.yml --seeds seeds.jsonl --out out

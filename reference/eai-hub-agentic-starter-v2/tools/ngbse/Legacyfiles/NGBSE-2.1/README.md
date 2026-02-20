# NGBSE-2.1 - Next‑Gen Blind Spot Engine (Legal OSINT + E_AI)

This package is the **operational engine** you asked for. It is built to surface **blind spots** (mismatches, gaps, risks) using only *legal* methods (clearnet OSINT), and to score/triage them via the E_AI model parameters (P, D_A, D_B, T, A, V, W_V).

**Key principles**  
- Legal-only OSINT (no intrusion, no bypass, no simulations, no fake data).  
- Evidence-first: every claim must have a source/URI & capture hash.  
- Blind-spot centric: we look for *unknowns & mismatches*, not answers.  
- Weekly cadence: scenarios & % likelihoods are computed from observed signals only.  
- Governance-by-design: EU AI Act high-risk context aware.

## Contents
- `config/ngbse.config.yml` – global settings (scope, cadence, weights, storage).  
- `docs/ENGINE_SPEC_2_1.md` – full architecture & workflows.  
- `docs/BLINDSPOT_RUBRIC.md` – scoring rubric + checklists.  
- `docs/ETHICS_GUARDRAILS.md` – boundaries & reviewer workflow.  
- `code/ngbse_scoring.py` – E_AI‑aligned scoring + blindspot rules.  
- `code/probability_engine.py` – converts signals→scenarios→% in a 7‑day horizon.  
- `code/osint_queries.txt` – safe dorks & pivots (NL‑focused).  
- `code/cli.py` – minimal CLI to run ingest→score→report.  
- `templates/` – intake, logbooks, scenario cards, RoE.  
- `legal/NOTICE.txt` – license & use restrictions.

## Quick start
1. Set scope in `config/ngbse.config.yml`.  
2. Prepare an **evidence CSV** (see `templates/evidence_log.csv`) filled with real findings.  
3. Run (Python 3.10+):  
   ```bash
   python code/cli.py --evidence templates/evidence_log.csv --out report.md
   ```
4. Review `report.md` for blind spots & scenario likelihoods (7‑day window).

> Note: This repo ships **without any data**. You must feed it your own legal OSINT captures.

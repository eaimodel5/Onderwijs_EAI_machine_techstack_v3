# eai-hub-agentic-starter (EAI Hub + Agentic Cockpit)

This repo bundle is assembled from your existing ZIPs and reorganized around a Hub-first, dashboard-first build.

## Primary UI

Primary cockpit: `apps/cockpit-next/` (Next.js).

## Layout

- `apps/eai-hub/`: Hub scaffold (API + orchestrator + stores placeholder)
- `apps/cockpit-next/`: Primary cockpit UI (Next.js)
- `apps/studio-module/`: Studio UI module (embed as a cockpit route/panel)
- `apps/learn-runtime/`: Optional Vite UI shell (secondary)
- `packages/ssot/`: SSOT rules + parser + rubric assets
- `packages/eai-services/`: Reusable service utilities (audit/kernel patterns)
- `docs/site/`: Documentation site seed (Mintlify)
- `docs/book/`: Practical book DOCX files (Part 1 and Part 2)
- `tools/webcrawler/`: Simple python crawler for ingest/testing
- `tools/ngbse/`: Optional advanced crawling/security tooling
- `notebooks/feedback-validator/`: Validator notebook

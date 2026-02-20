# Design decisions (EAI Hub Agentic Starter)

## D-001 Primary UI = Next.js cockpit
- Primary UI path: `apps/cockpit-next/`
- Reason: connector auth/callbacks, portal workflows, run/artefact views.
- Studio UI is kept as a module: `apps/studio-module/`.

## D-002 Chat is not the work surface
Chat can exist as an input/remote-control channel, but the cockpit is the work surface where artefacts are reviewed, accepted, and audited.

## D-003 Read-first connectors
Calendar/Gmail/Drive/Magister are read-first in v1. Any write-back requires a human gate and explicit SSOT policy.

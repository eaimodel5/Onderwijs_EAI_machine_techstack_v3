# Contributing

## Pull request rules
- Geen directe pushes naar `main`. Gebruik pull requests.
- Wijzigingen aan SSOT, schemas, evidence of owner policy vereisen review door de relevante CODEOWNERS.
- Gepubliceerde artefacten zijn immutable. Wijzigingen betekenen een nieuwe versie.

## Lokale checks
Vanuit `machine/`:

```bash
npm install
npm test
npm run print-card
```

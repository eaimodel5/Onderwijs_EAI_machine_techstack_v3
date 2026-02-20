# Database (vendor-neutraal)

De platformlaag heeft opslag nodig voor:
- card catalogus en versies
- evidence objects (sources, claims, patterns)
- runlogs en validatierapporten
- audit events (wie wijzigde wat en wanneer)

Je kunt dit in Postgres, MySQL, SQLite of een document store doen. In schema.sql staat een Postgres referentie, omdat die breed compatibel is.

Belangrijk: BYOL betekent dat je geen leerlinginhoud hoeft te centraliseren. Je kunt runlogs minimaliseren (metadata-only) en alleen opslaan wat nodig is voor governance.

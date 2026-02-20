Backend services (overzicht)

1) Card Registry
- CRUD voor cards, versies, status, metadata.

2) Rubric Service
- Laadt rubric_*.json en levert score_bands, microdescriptors, rationale.

3) TD Matrix Service
- Matcht P_score_range + V_sub + kernleerhandeling in matrix_td_structured.json.
- Levert risico, TD norm en flag.

4) Output Engine
- Assembleert BYOL prompt packs en exports volgens schema's.

5) Quality Gate
- Levert labels zoals syntactic_quality, semantic_clarity, content_validity, hallucination_risk en confidence.

6) Governance and Logging
- Reviewflow, auditlog, override protocol.

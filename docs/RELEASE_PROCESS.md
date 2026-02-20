# Release proces (SSOT, evidence en cards)

Doel: nieuwe versies uitbrengen zonder drift en zonder stille wijzigingen.

1. Wijzigingen voorbereiden
- Pas SSOT aan (ssot/). Alleen via versie-bump.
- Pas evidence packs aan (machine/packages/eai-evidence/).
- Pas schemas alleen aan met semver discipline (machine/packages/eai-schemas/).

2. Tests draaien
- Logic gates: machine/tests/run_logic_gate_tests.mjs
- Evidence integriteit: machine/tests/run_evidence_tests.mjs
- (optioneel) Card schema validatie via API of AJV.

3. Versies bumpen
- SSOT version: in SSOT bestand.
- Generator version: in eai-kernel (cardPrinter default).
- Schema ids: alleen bij breaking changes.

4. Publiceren
- Maak een immutable release artifact (zip) met checksums.
- Publish cards als nieuwe card_version. Laat pinned versies intact.

5. Governance labels
- draft: intern
- verified: gecontroleerd door reviewer
- certified: vrijgegeven voor brede inzet
- deprecated: vervangen, blijft voor audit beschikbaar

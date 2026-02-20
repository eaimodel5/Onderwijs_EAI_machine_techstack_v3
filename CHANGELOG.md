Zeker. Hier is een nette, complete update die je zo in `CHANGELOG.md` kunt plakken. Ik heb hem geschreven alsof je nu v3.1.0 uitbrengt en ik maak expliciet wat er gefixt is en wat er is toegevoegd.

# Changelog

## 3.1.0 (2026-02-20)

### Fixed

* Fix TypeScript build blockers:

  * Multi-line strings zijn omgezet naar geldige template literals in de kernel prompt templates.
  * `BandSelection` typing is gecorrigeerd zodat `logicGates` compileert en logisch afdwingbaar is.
* `OWNER_POLICY.yaml` is omgezet naar valide, parsebare YAML (met inspringing en regels per key).

### Added

* Repo-hardening en governance:

  * `.gitignore` (incl. macOS/Node/env patterns)
  * `SECURITY.md` (vulnerability reporting)
  * `CODEOWNERS` (review verplicht voor SSOT/owner/kernel/evidence)
  * GitHub Actions CI workflow (`.github/workflows/ci.yml`) die install + tests draait
  * `CONTRIBUTING.md`, `CITATION.cff`

### Changed

* README en docs zijn geformatteerd voor betere leesbaarheid (normale markdown, geen one-liners).
* Release hygiene: changelog bevat nu expliciete “Fixed/Added/Changed” secties voor auditability.

## 3.0.0 (2026-02-19)

* Initial public techstack v3 met SSOT 15.0.0 master, evidence pack, tests, en reference printer.

Als je wil, kan ik ook een korte “migration note” toevoegen (bijv. “als je OWNER_POLICY.yaml al gebruikt, update je parser/loader”) maar dit is nu al GH-ready.

# Patch v3.1 (repo fix + hardening)

Deze patchset fixt build blockers en maakt de repo professioneel (CI, license, security, etc).

## Apply via GitHub web UI (zonder git)
1. Open je repo op GitHub.
2. Upload de bestanden uit deze patchset (zelfde paden).
3. Bestanden die al bestaan: overschrijven.
4. Commit naar een nieuwe branch en open een Pull Request.

## Bestanden overschrijven
- machine/packages/eai-kernel/src/cardPrinter.ts
- machine/packages/eai-kernel/src/promptBuilder.ts
- machine/packages/eai-kernel/src/logicGates.ts
- owner/OWNER_POLICY.yaml
- README.md

## Bestanden toevoegen
- .gitignore
- LICENSE
- SECURITY.md
- CONTRIBUTING.md
- CHANGELOG.md
- CITATION.cff
- .github/CODEOWNERS
- .github/workflows/ci.yml

## Handmatige cleanup (1 minuut)
Verwijder `.DS_Store` uit de repo root (die hoort niet getrackt te zijn).

# Release process

Doel: changes aan SSOT, evidence en printer-code gecontroleerd doorvoeren zonder kwaliteitsverlies.

## 1. Wat telt als releasewaardige wijziging?
- SSOT update (nieuw rubric, nieuwe bandtekst, nieuwe logic gate)
- Evidence update (nieuwe bronnen, gewijzigde claims)
- Schema update (card of runlog)
- Printer engine update (healing, output contracts, adapter interfaces)

## 2. Verplicht bij elke release
1) Versienummer verhogen
2) Changelog schrijven met concrete impact
3) Test suite draaien (machine/tests)
4) Minimaal 10 end-to-end test vectors (diverse rubrics en contexten)
5) Schema validatie op voorbeeldcards
6) Owner sign-off

## 3. Migratie discipline
- Brekende veranderingen alleen bij major versions
- Oude cards blijven leesbaar door een compat layer (converter)

## 4. Traceerbaarheid
- Elke card bevat meta.generator_version en meta.ssot_version
- Elke runlog bevat card_id en ssot_version


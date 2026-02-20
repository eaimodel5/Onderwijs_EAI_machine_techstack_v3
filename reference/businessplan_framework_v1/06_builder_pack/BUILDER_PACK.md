Builder Pack (vendor-neutraal)

Doel:
Een team kan met eigen tools een wizard of mini-platform bouwen dat EAI-cards maakt en BYOL outputs assembleert.

In dit pack:
- JSON schema's in 01_framework/schemas.
- Tool spec schema in 01_framework/schemas/eai_tool_spec_v1.schema.json.
- Testvectors in 07_tests.

Minimale wizard schermen:
1) Kies procesfase (P) en setting.
2) Kies kernleerhandeling.
3) Kies vaardigheidsfocus (V_sub).
4) Kies outputtype (prompt_pack, lesson_pack, tool_spec, research_brief, policy_text).
5) Genereer EAI-card JSON en toon prompt-pack.

Validatie:
- Valideer altijd tegen schema's.
- Pas TD Matrix Service toe en voeg flag toe.
- Voeg controls toe via td_flag_controls mapping.

BYOL:
- Toon prompts als copy-paste tekst.
- Bewaar geen leerlingdata als default.

# Upgrade notes: v1 framework -> v2 machine

Wat is behouden:
- Het uitgangspunt BYOL en vendor-neutral
- EAI-card als ticket (plakbaar in elke LLM)
- Rubrics en taakdichtheid als didactische kern
- Guardrails en myth avoidance modules als concept

Wat is verdiept in v2:
1) SSOT 15.0.0 als echte master kernel
- De SSOT bevat nu logic gates, trace schema, SRL model en command library
- De printer engine leest dit direct en dwingt het af

2) Card schema v2
- Rijker datacontract met context, bands, policy, prompt_pack, output_contract en trace_requirements
- Checksum voor integriteit

3) Evidence-pack v2
- Bronnen en claims als expliciete objecten, gekoppeld aan rubrics en design patterns
- Hierdoor kan de eigenaar aantoonbaar sturen op evidence-informed keuzes

4) Healing en validatie
- Logic gates corrigeren onveilige combinaties (bijvoorbeeld K1 met te hoge TD)
- Validatierapport legt uit wat is afgedwongen en waarom

5) Referentie implementaties
- Studio v10 en agentic starter v2 zijn toegevoegd als reference codebases
- Gebruik ze als UI basis, maar laat alle normativiteit uit SSOT en schemas komen


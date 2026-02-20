# LLM-onafhankelijkheid en geen vendor lock-in

Deze stack is BYOL: de school kiest zelf model, provider en omgeving. De Onderwijs-EAI machine levert geen LLM. De machine levert contracten (SSOT, schemas) en een printer/validator die die contracten afdwingt.

Wat dit praktisch betekent
- Alle didactische regels zitten in SSOT en in de card. Dat is provider-neutraal.
- Alle output is contract-first: dezelfde JSON card, dezelfde prompt pack, dezelfde procesbewijs-eisen.
- De LLM is een verwisselbaar component achter een dunne gateway.

Minimaal gateway contract (conceptueel)
- input: { system_prompt, user_prompt, temperature, max_tokens, safety_mode }
- output: { text, tool_calls?, usage?, model_id }
- errors: gestandaardiseerde foutcodes

Waar je op let bij keuze van tooling
- Je kunt de EAI-card altijd als plain text plakken in een chat.
- Voor agentic of vibecoding gebruik je dezelfde card, alleen een andere binding (bijvoorbeeld een system prompt template).
- Als een tool niet goed genoeg instructies volgt, dan is dat een providerkeuze. De card blijft geldig.

Wat je niet doet
- Geen hardcoded provider SDK’s in de kern van de printer.
- Geen afhankelijkheid van proprietary prompt-DSL’s.
- Geen afhankelijkheid van één UI of één database.

# Governance: kwaliteit, validiteit en controleerbaarheid

Doel: de eigenaar van de Onderwijs EAI machine moet aantoonbaar kunnen sturen op kwaliteit en betrouwbaarheid.

## 1. Wat is "kwaliteit" hier?
Kwaliteit betekent niet: "de AI geeft vaak het goede antwoord".
Kwaliteit betekent:
- de denkhandeling blijft waar die hoort (leerling of docent)
- de output heeft bewijswaarde, omdat het proces zichtbaar en toetsbaar is
- het systeem is reproduceerbaar: dezelfde card leidt tot dezelfde eisen
- wijzigingen zijn traceerbaar: je weet welke SSOT en evidence versie actief was

## 2. Kwaliteitshefbomen
1) SSOT versiebeheer
- SSOT bepaalt rubrics en regels
- Updaten kan, maar altijd als release met migratienotes

2) Evidence-pack
- Claims moeten gekoppeld zijn aan bronnen
- Bronnen moeten herleidbaar zijn (auteur, jaar, venue)

3) Test vectors
- Voor kritische combinaties (bijvoorbeeld K1 met hoge TD) zijn testcases verplicht
- De printer moet aantoonbaar corrigeren

4) Runlogs en audits
- Bewaar minimaal: card_id, ssot_version, input, enforced_changes, output_contract
- Voor gevoelige context: extra logging van verificatiestappen

## 3. Rollen
Owner (jij)
- beheert SSOT releases en evidence-pack
- beslist welke cards "gecertificeerd" zijn voor bepaalde contexten

Builder team
- bouwt UI, integraties en hosting
- mag niet rommelen aan SSOT zonder owner release

Gebruiker (school, docent)
- kiest context en parameters
- gebruikt EAI-card in eigen LLM

## 4. Privacy en AVG (hoog niveau)
- minimaliseer persoonsgegevens in inputs en runlogs
- scheid identificerende gegevens van didactische runlogs
- maak een data retention policy per school


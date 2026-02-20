# EAA Framework - Eigenaarschap, Autonomie & Agency

## Overzicht

Het EAA-framework vormt de ethische kern van EVAI v20. Het meet en bewaakt drie fundamentele psychologische dimensies die bepalen of AI-gedrag passend en veilig is.

## De Drie Dimensies

### 1. Eigenaarschap (Ownership)
**Definitie**: De gebruiker voelt zich verbonden met het onderwerp, ervaart het als "van mij"

**Indicatoren**:
- Gebruik van ik/mijn/mezelf
- Emotionele betrokkenheid
- Persoonlijke ervaringen delen

**Impact op gedrag**:
- Hoge ownership (>0.6): Alle strategieën toegestaan
- Medium ownership (0.4-0.6): Reflectie en erkenning preferent
- Lage ownership (<0.4): Alleen reflectieve benaderingen

### 2. Autonomie (Autonomy)
**Definitie**: De gebruiker ervaart keuzevrijheid binnen de interactie, zonder dwang

**Indicatoren**:
- Gebruik van kan/wil/zou/mag
- Overwegen van opties
- Afwezigheid van moeten/verplicht

**Impact op gedrag**:
- Hoge autonomie (>0.5): Suggesties toegestaan
- Medium autonomie (0.3-0.5): Voorzichtige begeleiding
- Lage autonomie (<0.3): Geen sturende interventies

### 3. Agency (Handelingsbekwaamheid)
**Definitie**: De gebruiker ervaart dat zij/hij werkelijk iets kan doen

**Indicatoren**:
- Gebruik van doe/ga/probeer/begin
- Hulpzoekend gedrag (positief)
- Afwezigheid van "lukt niet/kan niet"

**Impact op gedrag**:
- Hoge agency (>0.6): Interventies mogelijk
- Medium agency (0.4-0.6): Suggesties met voorbehoud
- Lage agency (<0.4): Alleen reflectie en erkenning

## EAA in de Decision Pipeline

```
User Input
    ↓
EAAEvaluator (analyseert tekst + rubrics)
    ↓
EAA Profile { ownership, autonomy, agency }
    ↓
Strategy Validator (blokkeert ongepaste strategieën)
    ↓
Response (aangepast aan EAA-profiel)
```

## Validatieregels

| Strategie | EAA Vereisten |
|-----------|---------------|
| Reflectievraag | Altijd toegestaan |
| Valideren | Ownership ≥ 0.3 |
| Suggestie | Agency ≥ 0.5, Autonomy ≥ 0.4 |
| Interventie | Agency ≥ 0.6, Ownership ≥ 0.4 |

## Rubric-EAA Integratie

EAA wordt verrijkt met rubric-scores:
- **Hoge risicoScore** → Verlaagt agency en autonomie
- **Hoge protectiveScore** → Verhoogt agency en autonomie
- **dominantPattern** → Contextspecifieke aanpassingen

## E_AI Rules Integratie

EAA wordt gebruikt om E_AI context te creëren:
- `A` (Autonomiecoëfficiënt) = autonomy
- `V_A` (Motivationele vaardigheid) = agency
- `V_M` (Metacognitieve vaardigheid) = ownership

Samen met TD (Taakdichtheid) vormen ze de basis voor symbolische ethische regels.

## Voorbeeld

**Input**: "Ik weet het echt niet meer, lukt allemaal niet"

**EAA Analyse**:
- Ownership: 0.6 (ik/mij aanwezig)
- Autonomy: 0.3 (geen keuzevrijheid ervaren)
- Agency: 0.2 (lukt niet, kan niet)

**Beslissing**: Alleen reflectie toegestaan, geen suggesties of interventies

**Response**: "Wat maakt het nu zo moeilijk om verder te komen?"

## Implementatie

Zie:
- `src/lib/eaaEvaluator.ts` - Core evaluatie logica
- `src/types/eaa.ts` - Type definities
- `src/orchestrator/hybrid.ts` - Integratie in decision flow

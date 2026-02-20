# Template Parameters voor EvAI v16 Seeds

Dit document beschrijft het template parameter systeem voor dynamische seed responses in EvAI v16.

## Overzicht

Template parameters maken seed responses herbruikbaar door hardcoded context te vervangen met placeholders die bij runtime worden ingevuld met gebruikersspecifieke context.

## Probleem: Overspecifieke Seeds

**❌ Oud systeem (overspecifiek):**
```
"Het is begrijpelijk dat je je verdrietig voelt, vooral na een goede nachtrust."
```

**Probleem:** Deze response is alleen relevant voor gebruikers die net wakker zijn geworden. Voor anderen is het niet passend en zelfs verwarrend.

## Oplossing: Template Parameters

**✅ Nieuw systeem (dynamisch):**
```
"Het is begrijpelijk dat je je verdrietig voelt {timeOfDay}."
```

Bij runtime wordt dit:
- 's Ochtends: "Het is begrijpelijk dat je je verdrietig voelt deze ochtend."
- 's Avonds: "Het is begrijpelijk dat je je verdrietig voelt vanavond."
- Geen context: "Het is begrijpelijk dat je je verdrietig voelt nu."

## Beschikbare Parameters

### `{timeOfDay}`
**Beschrijving:** Tijdstip van de dag, geëxtraheerd uit user input of afgeleid van huidige tijd.

**Voorbeelden:**
- "de ochtend"
- "de middag"
- "de avond"
- "de nacht"

**Fallback:** "nu"

**Detectie:**
- Expliciete woorden: "ochtend", "middag", "avond", "nacht", "vannacht"
- Tijd-gerelateerd: "wakker worden", "ontbijt", "lunch", "diner", "slapen"
- Huidige tijd: Als geen expliciete vermelding, gebruik system tijd

---

### `{situation}`
**Beschrijving:** Situationele context waar de emotie wordt ervaren.

**Voorbeelden:**
- "op het werk"
- "thuis"
- "op school"
- "in een sociale situatie"

**Fallback:** "in deze situatie"

**Detectie:**
- Werk: "werk", "baan", "baas", "collega", "kantoor", "vergadering"
- Thuis: "thuis", "huis", "familie", "ouders"
- School: "school", "studie", "les", "docent", "klas", "tentamen"
- Sociaal: "vrienden", "feest", "uitgaan", "date", "afspraak"

---

### `{recentEvent}`
**Beschrijving:** Recente gebeurtenis of trigger genoemd door gebruiker.

**Voorbeelden:**
- "het gesprek"
- "de deadline"
- "het conflict"
- "de feedback"

**Fallback:** "recent"

**Detectie:**
- Patterns: "na (mijn|een) [X]", "sinds [X]", "door [X]"
- Voorbeelden: "na mijn presentatie", "sinds het gesprek", "door de kritiek"

---

### `{temporalRef}`
**Beschrijving:** Generieke temporele referentie voor wanneer iets gebeurde.

**Voorbeelden:**
- "recent"
- "op dit moment"
- "vaak"

**Fallback:** "op dit moment"

**Detectie:**
- Recent verleden: "vannacht", "gisteren", "vanochtend", "vorige week"
- Nu: "nu", "momenteel", "op dit moment"
- Frequentie: "altijd", "vaak", "regelmatig"

## Implementatie

### 1. Context Extraction (`contextExtractor.ts`)

```typescript
export function extractContextParams(
  userInput: string,
  conversationHistory?: any[]
): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Extract time of day
  if (/\b(ochtend|morgen)\b/i.test(userInput)) {
    params.timeOfDay = 'deze ochtend';
  }
  
  // Extract situation
  if (/\b(werk|kantoor)\b/i.test(userInput)) {
    params.situation = 'op het werk';
  }
  
  // ... etc
  
  return params;
}
```

### 2. Template Compilation (`ReflectionCompiler.ts`)

```typescript
export function compileReflection(
  seed: AdvancedSeed,
  params: Record<string, string> = {}
): string {
  let text = seed.response.nl;
  
  // Replace all parameters
  for (const [key, value] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  
  // Apply fallbacks for unreplaced parameters
  text = text.replace(/\{timeOfDay\}/g, 'nu');
  text = text.replace(/\{situation\}/g, 'in deze situatie');
  
  return text;
}
```

### 3. Orchestrator Integration

In `hybrid.ts`, gebruik template compilation voor `USE_SEED` beslissingen:

```typescript
case 'USE_SEED':
  const params = extractContextParams(ctx.userInput, ctx.conversationHistory);
  const seed = await loadSeed(ctx.seed.templateId);
  
  if (hasTemplateParameters(seed)) {
    answer = compileReflection(seed, params);
  } else {
    answer = seed.response.nl;
  }
  break;
```

## Seed Generation Guidelines

### ✅ DO: Gebruik Template Parameters

```
"Ik merk dat je {situation} veel stress ervaart. {timeOfDay} kan het extra zwaar voelen."
```

### ❌ DON'T: Hardcode Specifieke Context

```
"Ik merk dat je op het werk veel stress ervaart. 's Avonds kan het extra zwaar voelen."
```

### ✅ DO: Generieke Validatie

```
"Het is begrijpelijk dat je je {emotion} voelt. Veel mensen ervaren dit {timeOfDay}."
```

### ❌ DON'T: Overspecifieke Aannames

```
"Het is begrijpelijk dat je je verdrietig voelt, vooral na een goede nachtrust."
```

## Coherence Validation

De `validateSeedCoherence` functie controleert automatisch:

1. **Overspecifieke content** niet in triggers
2. **Hardcoded tijden/situaties** die parameters zouden moeten zijn
3. **Aannames** over gebruiker ("je hebt vast...", "waarschijnlijk...")
4. **Type consistency** (validation moet valideren, niet adviseren)
5. **Response length** voor seed type

## Database Cleanup

Het `seedDatabaseCleanup` systeem:

1. **Scant** database voor overspecifieke seeds
2. **Vervangt** automatisch overspecifieke patterns met parameters
3. **Deactiveert** seeds die niet kunnen worden gerepareerd
4. **Logt** alle acties naar reflection_logs voor audit

## Admin Tools

Het Admin Dashboard bevat:

1. **Template Parameter Docs** - Alle beschikbare parameters en voorbeelden
2. **Seed Coherence Scanner** - Automatische cleanup van overspecifieke seeds
3. **Overspecific Seeds List** - Review en manuele deactivatie

## Best Practices

### 1. Gebruik Parameters voor Variabele Context

**Goed:**
```
"Wat denk je dat je zou helpen {timeOfDay} om met {emotion} om te gaan?"
```

**Fout:**
```
"Wat denk je dat je zou helpen vanavond om met stress om te gaan?"
```

### 2. Blijf Generiek bij Absence van Context

**Goed:**
```
"Het is oké om je zo te voelen {temporalRef}."
→ Wordt: "Het is oké om je zo te voelen op dit moment."
```

### 3. Combineer Parameters Natuurlijk

**Goed:**
```
"{situation} kan het soms moeilijk maken om met {emotion} om te gaan, vooral {timeOfDay}."
```

### 4. Test met Fallbacks

Zorg dat je seed ook werkt wanneer parameters niet worden gevonden:

```
"Het is normaal om {emotion} te voelen {timeOfDay}."
→ Fallback: "Het is normaal om verdriet te voelen nu."
```

## Audit Trail

Alle cleanup acties worden gelogd naar `reflection_logs`:

```sql
{
  "action": "fixed",
  "seed_id": "...",
  "details": {
    "before": "vooral na een goede nachtrust",
    "after": "{temporalRef}"
  },
  "timestamp": "2025-01-20T10:30:00Z"
}
```

Dit maakt het mogelijk om:
- Cleanup effectiviteit te monitoren
- False positives te identificeren
- System learning te traceren

## Testing

### Unit Tests Checklist

- [ ] Context extraction met verschillende inputs
- [ ] Template compilation met alle parameter types
- [ ] Fallback handling bij missing parameters
- [ ] Overspecific detection accuracy
- [ ] Cleanup action logging

### Integration Tests Checklist

- [ ] End-to-end orchestrator flow met template seeds
- [ ] Database cleanup execution
- [ ] Admin panel seed scanning
- [ ] Parameter documentation rendering

## Toekomstige Uitbreidingen

Mogelijke nieuwe parameters:

- `{emotionIntensity}` - "heel", "een beetje", "erg"
- `{relationshipContext}` - "met je partner", "met vrienden"
- `{copingStrategy}` - Personalized coping suggesties
- `{previousSuccess}` - Reference naar eerdere positieve ervaringen

## Referenties

- `src/lib/ReflectionCompiler.ts` - Template compilation
- `src/utils/contextExtractor.ts` - Parameter extraction
- `src/utils/seedCoherenceValidator.ts` - Validation rules
- `src/utils/seedDatabaseCleanup.ts` - Database cleanup
- `src/lib/templateParameterDocs.ts` - Parameter documentation

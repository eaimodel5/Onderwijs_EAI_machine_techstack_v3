
# EvAI Innerspace

Een geavanceerde, hybride AI-chatbot met neurosymbolische verwerking, rubrics-beoordeling, zelflerend gedrag 
## 🎯 Kernfuncties

- **Neurosymbolische AI v20**: Combineert symbolische patronen met semantische embeddings en neurale netwerken
- **EvAI 5.6 Rubrics**: Therapeutische beoordeling op 5 dimensies met configureerbare strengheid
- **Hybride Besluitvorming**: 14-laagse AI-pipeline met Meta-Learner voor adaptieve fusiegewichten
- **Zelflerend + Meta-Learning**: Leert van HITL feedback en gebruikersinteracties
- **Safety Layer**: Pre-response harm detection via OpenAI Moderation API
- **Fast-Path**: Multi-word greetings bypass volledige pipeline (< 100ms)
.

## 🔒 Single-User Architecture

EvAI Inner Space is ontworpen als een **single-user systeem**. Alle data (seeds, knowledge, decisions, chat history) wordt opgeslagen onder een vast systeem-gebruikers-ID (`00000000-0000-0000-0000-000000000001`).

**Belangrijke kenmerken**:
- ✅ **Geen authenticatie vereist**: Core functionaliteit werkt zonder login
- ✅ **Gedeelde kennisbank**: Alle seeds en embeddings zijn systeem-breed beschikbaar
- ✅ **Unified Memory**: Chat geschiedenis en beslissingen worden centraal opgeslagen
- ⚠️ **Multi-tenancy**: Niet ondersteund in huidige versie (zie roadmap voor toekomstige ontwikkeling)

**Gebruik in productie**: Deze architectuur is ideaal voor demo's, single-user therapeutische tools, of research prototypes. Voor multi-user deployments moet de architectuur worden aangepast om per-user isolatie te implementeren.

## 🧠 EAA Framework (v20) - Volledige Integratie

EVAI v20 is **volledig geïntegreerd** met een ethisch reflectiesysteem gebaseerd op het **EAA-framework**. Dit systeem bewaakt de balans tussen AI-interventie en menselijke handelingsbekwaamheid **in alle verwerkingspaden**.

### Kerncomponenten

1. **EAA Evaluator (Pre-Filter)**: Meet ownership, autonomy en agency VOOR knowledge search
2. **Regisseur Reflectie**: Historische zelfreflectie via vector memories
3. **TD-Matrix**: Monitort AI-dominance (Taakdichtheid > 0.8 = agency loss)
4. **E_AI Rules Engine**: Symbolische ethische regelset (rules 001-006)
5. **LLM Generator met EAA Constraints**: Dynamische system prompts gebaseerd op gebruikers EAA-profiel

### Gedragsvalidatie in ALLE Paden

#### High Confidence Path (Seed-Based)
```
User Input → EAA Pre-Filter → Rubrics → Knowledge Search (>0.70 confidence)
    ↓
Seed Response → hybrid.ts Orchestrator
    ↓
TD-Matrix Check → E_AI Rules → EAA Strategy Validation → Final Response
```

#### Low Confidence Path (Learning Mode)
```
User Input → EAA Pre-Filter → Rubrics → Knowledge Search (<0.70 confidence)
    ↓
Generate New Seed (LLM) → TD-Matrix Check → E_AI Rules Check
    ↓
IF validated: Save Seed → Return Response
ELSE: Block + Error
```

#### LLM_PLANNING Path
```
Policy Decision: LLM_PLANNING → Generate Response with EAA Constraints (edge function)
    ↓
Response → TD-Matrix Check → E_AI Rules → Final Validation
```

### Ethische Checkpoints

✅ **Pre-Filter (Layer 0)**: EAA evaluatie vóór alle processing
⚖️ **TD-Matrix**: Check AI dominance vs user agency
🔍 **E_AI Rules**: 6 symbolische regels voor agency-bescherming
🛡️ **Strategy Validation**: Blokkeer ongepaste strategieën op basis van EAA
📝 **Learning Mode Validation**: Valideer LLM-generated seeds voor opslag

**Voorbeeld blokkade**: Bij lage agency (gebruiker voelt "lukt niet") blokkeert het systeem sturende suggesties en kiest het voor reflectieve vragen - zowel in seed-based responses als LLM-generated content.

Zie `docs/v20-architecture.md` en `docs/eaa-framework.md` voor volledige documentatie.

## 🛠️ Setup Instructies

### 1. Environment Variabelen

Maak een `.env` bestand aan met:

```env
VITE_SUPABASE_URL=https://ngcyfbstajfcfdhlelbz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nY3lmYnN0YWpmY2ZkaGxlbGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDcsImV4cCI6MjA2NDYzODk0N30.MkZRcC_HGNTZW3hUvFiNmHY5Px9FPvRmnzAiKTWi9e4
SUPABASE_URL=https://ngcyfbstajfcfdhlelbz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nY3lmYnN0YWpmY2ZkaGxlbGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDcsImV4cCI6MjA2NDYzODk0N30.MkZRcC_HGNTZW3hUvFiNmHY5Px9FPvRmnzAiKTWi9e4
```

### 2. API Keys Configuratie

**Server-Side (Supabase Edge Functions):**
- Alle AI-operaties draaien via `evai-core` Edge Function (Deno runtime)
- OpenAI API keys worden beheerd via Supabase Secrets (server-side)
- Operaties: `chat` (GPT-4o-mini), `embedding` (text-embedding-3-small), `safety` (Moderation API)



### 3. Installatie

```bash
# Kloon de repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Installeer dependencies
npm install

# Start development server
npm run dev
```

## 🧠 Neurosymbolische Architectuur v20

### 14-Laagse Hybrid Decision Pipeline met Meta-Learner

#### **Laag 1: Safety Layer 🛡️**
- **Pre-response harm detection** via OpenAI Moderation API
- **Beslissingen**: `block` (weigeren), `review` (flaggen met toast), `allow` (doorlaten)
- **Bescherming tegen**: Harmful content, prompt injection, jailbreak attempts

#### **Laag 2: EvAI 5.6 Rubrics 📋**
- **Therapeutische beoordeling** op 5 dimensies:
  1. **Emotionele Regulatie**: Overweldigd, paniek, woede vs. mindfulness, kalm
  2. **Zelfbewustzijn**: Zelfverwijt, negatief zelfbeeld vs. zelfkennis, reflectie
  3. **Copingstrategieën**: Vermijden, isoleren vs. hulp zoeken, actieve coping
  4. **Sociale Verbinding**: Eenzaam, conflicten vs. ondersteunende relaties
  5. **Betekenis & Doel**: Zinloos, hopeloos vs. levensdoel, hoopvol
- **Configureerbare strengheid**: Flexible / Moderate / Strict (via Admin Dashboard)
- **Output**: Risk scores, protective scores, triggers (opgeslagen in `rubrics_assessments`)

#### **Laag 3: Strategic Briefing (Regisseur) 🎭**
- **Conversatie-strategische analyse** (alleen bij ≥2 berichten history)
- **Gebruikt**: Rubric assessments + seed matches als context
- **Output**: `goal`, `context`, `keyPoints`, `priority` (JSON format)
- **Invloed**: Stuurt Unified Decision Core v3.0

#### **Laag 4: Browser ML Engine 🧠**
- **Client-side emotion pre-detection** (100% local, geen externe server)
- **Model**: `Xenova/bert-base-multilingual-uncased-sentiment`
- **Hardware**: WebGPU acceleration + WASM fallback
- **Output**: Sentiment scores → Dutch emotion mapping → boost voor knowledge search

#### **Laag 5: Unified Decision Core v3.0 🔍**
- **Hybrid knowledge search** met 3 parallelle engines:
  - **Symbolic Engine**: Pattern matching op triggers (SeedPatternMatcher)
  - **Semantic Engine**: Vector similarity (pgvector embeddings, 1536-dim)
  - **Neural Engine**: OpenAI GPT-4o-mini (fallback bij geen match)

#### **Laag 6: Hybrid Ranking Systeem 📊**
Combineert scores voor optimale match:
- Symbolic match score (triggers × weight)
- Semantic similarity (cosine distance)
- Browser ML emotion boost
- Usage statistics (usage_count)
- User feedback history (feedback_score)

**Formula**: `finalScore = (symbolic × 0.4) + (semantic × 0.4) + (mlBoost × 0.1) + (feedback × 0.1)`

#### **Laag 7: Self-Learning Manager 🔄**
- **Trigger condities**: Lage confidence (<0.7), nieuwe topics, user corrections
- **Output**: Nieuwe seeds → `unified_knowledge` tabel via learning queue
- **Meta-Learner integration**: Self-learning success → neural weight +1-5%

#### **Laag 8: TD-Matrix Check ⚖️**
- **Doel**: Meet AI-dominantie vs user agency
- **Blokkades**: TD >0.8 → block output, TD >0.7 + agency <0.3 → block
- **Locatie**: `src/lib/tdMatrix.ts`

#### **Laag 9: E_AI Rules Engine 🔍**
- **Doel**: Symbolische ethische validatie (6 regels)
- **Rules**: Agency loss, bias detection, metacognitie, compliance
- **Locatie**: `src/policy/eai.rules.ts`

#### **Laag 10: NGBSE Check 🧠**
- **Doel**: Detecteert assumptions, bias, context gaps, overconfidence
- **Trigger**: HITL queue bij detectie
- **Locatie**: `src/lib/ngbseEngine.ts`

#### **Laag 11: HITL Queue 👥**
- **Doel**: Human-in-the-loop review voor edge cases
- **Trigger**: NGBSE detectie, crisis >80, TD violations
- **Meta-Learner impact**: Admin feedback → weight adjustment
- **Locatie**: `src/lib/hitlTriggers.ts`

#### **Laag 12: Fusion Assembly 🧬**
- **Doel**: Combineert symbolic (seeds) + neural (LLM) responses
- **Weights**: Context-dependent (crisis: 90/10, normal: 65/35)
- **Cache**: 30s TTL, eventual consistency
- **Locatie**: `src/orchestrator/fusionHelpers.ts`

#### **Laag 13: Meta-Learner 📈**
- **Doel**: Leert optimale fusion weights uit feedback
- **Learning sources**: HITL decisions (approve/reject) + self-learning success
- **Safety**: Max 5% shift, dampening 0.7, 10+ samples voor productie
- **Locatie**: `src/lib/fusionWeightCalibrator.ts`

#### **Laag 14: Auto-Healing 🔧**
- **Doel**: Automatische recovery van mislukte responses
- **Triggers**: TD violations, E_AI blocks, low confidence
- **Fallbacks**: Template responses, crisis protocols
- **Locatie**: `src/orchestrator/autoHealing.ts`

---

### Data Architectuur

```
KENNISBANK:
unified_knowledge
├── content_type: 'seed' | 'embedding' | 'pattern' | 'insight'
├── emotion (symbolisch) + triggers (keywords)
├── embedding (vector[1536]) voor semantische search
├── response_text (therapeutisch antwoord)
└── metadata: { confidence, usage_count, feedback_score, category }

LONG-TERM MEMORY:
chat_messages
├── user_id (fixed: 00000000-0000-0000-0000-000000000001)
├── role ('user' | 'assistant')
├── content (message text)
├── metadata (emotion, confidence, label, triggers)
└── created_at

RUBRICS ASSESSMENT:
rubrics_assessments
├── user_id
├── conversation_id
├── rubric_id (emotional-regulation, self-awareness, etc.)
├── risk_score, protective_score, overall_score
├── triggers (matched keywords)
└── confidence_level ('low' | 'medium' | 'high')

TELEMETRY:
api_collaboration_logs
├── api1_used, vector_api_used, google_api_used
├── strategic_briefing (JSON van Regisseur)
├── processing_time_ms
└── success (boolean)
```

---

### Edge Functions Architectuur

**Alle AI-operaties draaien via Supabase Edge Functions (Deno runtime)**

#### **`evai-core`** (Production - SINGLE ENDPOINT)

```typescript
// Operation: 'chat' → OpenAI chat completions (GPT-4o-mini)
await supabase.functions.invoke('evai-core', {
  body: { operation: 'chat', model: 'gpt-4o-mini', messages, temperature: 0.7 }
});

// Operation: 'embedding' → Text embeddings (text-embedding-3-small, 1536-dim)
await supabase.functions.invoke('evai-core', {
  body: { operation: 'embedding', input: text, model: 'text-embedding-3-small' }
});

// Operation: 'safety' → OpenAI Moderation API
await supabase.functions.invoke('evai-core', {
  body: { operation: 'safety', text: input }
});
```

**Gebruikt in**:
- `useProcessingOrchestrator.ts` (main orchestrator)
- `useOpenAI.ts` (OpenAI fallback)
- `useOpenAISecondary.ts` (Strategic Briefing / Regisseur)
- `useVectorEmbeddings.ts` (embedding generation)
- `safetyGuard.ts` (harm detection)
- `embeddingUtils.ts` (vector utilities)

#### **`evai-admin`** (Management)
- **Operation: `test-openai-key`** → API key validation
- **Operation: `autolearn-scan`** → Autonomous learning scan

---

**NIEUWE ARCHITECTUUR (HUIDIG):**

1. **Rubrics Assessment** (`useEvAI56Rubrics`)
   - Analyseert user input op 5 therapeutische dimensies
   - Output: Risk scores, protective scores, triggers

2. **Strategic Briefing** (`useOpenAISecondary.ts`)
   - Krijgt rubric assessments als context (parameter: `rubricAssessments`)
   - Creëert strategische briefing via `evai-core` (operation: 'chat')
   - Output: `{ goal, context, keyPoints, priority }` (JSON)

3. **Unified Decision Core** (`useUnifiedDecisionCore.ts`)
   - Ontvangt strategic briefing als input
   - Maakt hybride decision (Symbolic + Semantic + Neural)

4. **OpenAI Fallback** (indien geen knowledge match)
   - Gebruikt laatste 6 berichten als context
   - Natural, empathische system prompt
   - Reageert via `evai-core` (operation: 'chat')

**Alle API calls draaien via DEZELFDE `evai-core` edge function met verschillende operations!**

## 🎛️ Admin Dashboard

Toegankelijk via `/admin` - bevat:

- **Systeemstatus**: Real-time monitoring van alle AI-engines
- **Seed Management**: Beheer emotionele response-patronen
- **Rubrics Configuratie**: Pas strengheid aan (Flexible/Moderate/Strict) via Settings tab
- **Rubrics Assessments**: Inzicht in therapeutische beoordelingen per gesprek
- **Analytics**: Prestatiemetrics en usage patterns
- **Configuration**: API key management en systeem-instellingen

## 🔧 Development

### Belangrijke Componenten

#### **Hooks (Core Logic)**
- `useProcessingOrchestrator.ts` → Orchestrator voor hele 14-laagse v20 AI pipeline met Fast-Path
- `useUnifiedDecisionCore.ts` → Neurosymbolisch v3.0 (Hybrid Decision Engine)
- `useEvAI56Rubrics.ts` → Therapeutische rubrics beoordeling (5 dimensies)
- `useEnhancedEvAI56Rubrics.ts` → Enhanced versie met database logging
- `useRubricSettings.ts` → Configureerbare rubric strengheid (Flexible/Moderate/Strict)
- `useOpenAISecondary.ts` → Strategic Briefing (Regisseur) via `evai-core`
- `useBrowserTransformerEngine.ts` → Client-side ML (WebGPU/WASM) emotion detection
- `useSelfLearningManager.ts` → Layer 7 - Autonomous seed generation + Meta-Learner integration

#### **Libraries (v20 Ethics & Learning)**
- `eaaEvaluator.ts` → EAA Framework (Ownership, Autonomy, Agency)
- `tdMatrix.ts` → Layer 8 - AI dominance monitoring
- `eai.rules.ts` → Layer 9 - Symbolic ethical rules (6 regels)
- `ngbseEngine.ts` → Layer 10 - Bias & blindspot detection
- `hitlTriggers.ts` → Layer 11 - HITL queue management
- `fusionHelpers.ts` → Layer 12 - Fusion Assembly met context-aware weights
- `fusionWeightCache.ts` → Cache voor learned fusion weights (30s TTL)
- `fusionWeightCalibrator.ts` → Layer 13 - Meta-Learner (adaptive weights)
- `autoHealing.ts` → Layer 14 - Automatic recovery van mislukte responses
- `safetyGuard.ts` → Layer 1 - Pre-response harm detection
- `embeddingUtils.ts` → Vector embedding generation

#### **Components (UI)**
- `NeurosymbolicVisualizer.tsx` → Real-time analyse-visualisatie (emotion, confidence, label)
- `ChatView.tsx` → Conversatie interface met long-term memory
- `SettingsSheet.tsx` → API key configuratie (optioneel, alleen voor client-side testing)
- `RubricSettings.tsx` → Rubric strengheid configuratie (Flexible/Moderate/Strict)
- `AdminDashboard.tsx` → System management console (Seeds, Settings, Analytics)

#### **Libraries**
- `safetyGuard.ts` → Pre-response harm detection (OpenAI Moderation API via `evai-core`)
- `embeddingUtils.ts` → Vector embedding generation (text-embedding-3-small via `evai-core`)

### Testing

```bash
# Run tests
npm test

# Test Supabase connection
# Via Admin Dashboard -> Systeem tab -> "Test Supabase"
```

### Linting

Run the linter after installing dependencies to avoid errors like `Cannot find package '@eslint/js'`:

```bash
# Install dependencies (only needed once after cloning)
npm install

# Run lint checks
npm run lint
```

## 📋 Technische Stack

### **Frontend**
- **Framework**: React 18 + TypeScript 5
- **Styling**: Tailwind CSS 3 + Shadcn/UI
- **State Management**: React Query v5 (TanStack Query)
- **Build Tool**: Vite 5
- **ML Engine**: Transformers.js v3 (WebGPU/WASM)

### **Backend**
- **Database**: Supabase PostgreSQL 15
- **Vector DB**: pgvector extension (Postgres `vector` v0.8.0) - 1536-dim embeddings
- **Auth**: Supabase Auth (Easter Egg access model voor demo)
- **Edge Functions**: Deno runtime (Supabase Functions)
- **Storage**: Supabase Storage (future: file uploads)

### **AI Services (Server-Side via Edge Functions)**
- **Chat**: OpenAI GPT-4o-mini (via `evai-core` operation: 'chat')
- **Embeddings**: OpenAI text-embedding-3-small, 1536-dim (via `evai-core` operation: 'embedding')
- **Moderation**: OpenAI Moderation API (via `evai-core` operation: 'safety')
- **Local ML**: Xenova/bert-base-multilingual-uncased-sentiment (browser, WebGPU/WASM)

### **DevOps**
- **Hosting**: Vercel / Netlify (frontend static hosting)
- **Backend**: Supabase Cloud (database + edge functions)
- **Version Control**: Git
- **Package Manager**: npm

## 🛡️ Safety & Privacy

### Multi-Layer Safety System

#### **1. Pre-Response Harm Detection**
- **OpenAI Moderation API** via `evai-core` (operation: 'safety')
- **Beslissingen**:
  - `block`: Schadelijke inhoud wordt geweigerd + toast error
  - `review`: Gevoelige inhoud wordt geflagd + toast warning
  - `allow`: Veilige inhoud gaat door naar processing
- **Bescherming tegen**: Self-harm, hate speech, harassment, violence

#### **2. Client-Side Privacy**
- **Browser ML Engine**: 100% local inference (geen data naar externe servers)
- **Data minimalisatie**: Alleen essentiële data naar OpenAI (chat/embeddings via Edge Functions)
- **localStorage**: API keys (optioneel, alleen voor client-side testing)

#### **3. Database Security**
- **Supabase Row Level Security (RLS)** policies op alle tabellen
- **Anonymous user model**: Fixed UUID voor demo (`00000000-0000-0000-0000-000000000001`)
- **Encrypted secrets**: API keys opgeslagen in Supabase Edge Function environment vars

#### **4. Rate Limiting & Usage Tracking**
- **API usage tracking** via `apiUsageTracker.ts`
- **Automatic throttling** bij overmatig gebruik
- **Telemetry**: `api_collaboration_logs` voor monitoring

## 🚀 Deployment

```bash
# Build voor productie
npm run build

# Preview build
npm run preview
```

De applicatie is geoptimaliseerd voor deployment op Vercel, Netlify, of andere static hosting platforms.

## 🔒 Beveiliging

- **Anonymous User Model**: Alle database-operaties gebruiken een vast, anoniem user ID voor demo
- **API Key Encryption**: Keys worden veilig opgeslagen in Supabase Edge Function environment vars
- **Rate Limiting**: Ingebouwde bescherming tegen misbruik


## 📈 Prestatie

- **Lazy Loading**: Componenten worden dynamisch geladen
- **Code Splitting**: Optimale bundle-grootte
- **Caching**: React Query voor efficiente data-fetching
- **Hybrid Processing**: Intelligente fallback-strategieën
- **Client-Side ML**: WebGPU/WASM acceleration voor lokale inferentie


### Debug Mode

Voeg `?debug=true` toe aan de URL voor uitgebreide console logging.

## 📞 Ondersteuning

Voor technische ondersteuning of vragen over de neurosymbolische architectuur, raadpleeg de documentatie in `/admin/guide`.

---

**EvAI v5.6 - Waar symbolische intelligentie, therapeutische rubrics en neurale netwerken samenkomen** 🧠💙

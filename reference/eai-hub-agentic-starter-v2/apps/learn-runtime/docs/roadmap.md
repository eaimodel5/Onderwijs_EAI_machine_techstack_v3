# EvAI Inner Space - Product Roadmap

**Laatste update**: 26 oktober 2025  
**Huidige versie**: 5.6

---

## Versiegeschiedenis

| Versie | Datum | Status | Highlights |
|--------|-------|--------|------------|
| **5.6** | Okt 2025 | ✅ **Current** | EvAI 5.6 Rubrics, Learning Queue, Browser ML v2 |
| 5.5 | Sep 2025 | Afgerond | Strategic Briefing (Regisseur), Unified Knowledge v3 |
| 5.0 | Aug 2025 | Afgerond | Neurosymbolische Pipeline, Self-Learning v1 |
| 4.0 | Jul 2025 | Afgerond | Hybrid Decision Core, Vector Search |
| 3.0 | Jun 2025 | Afgerond | Advanced Seeds, Meta-Learning |

---

## 🎯 Versie 5.6 (Huidig)

**Theme**: Self-Learning & Therapeutic Precision

### ✅ Voltooid

**1. EvAI 5.6 Rubrics Integration**
- 5 therapeutische dimensies (Crisis Risk, Distress, Support, Coping, Alliance)
- Configureerbare strictness modes (Flexible/Moderate/Strict)
- Real-time risk assessment in elke conversatie
- Dashboard visualisatie met grafieken

**2. Learning Queue & Curation**
- `learning_queue` tabel voor AI-generated seeds
- Admin curation workflow (pending/approved/rejected)
- Automatische trigger bij confidence < 0.60
- Feedback loop naar unified_knowledge

**3. Browser ML Engine v2**
- Upgraded naar Transformers.js v3.7.6
- Sentiment analysis (Xenova/bert-base-multilingual)
- Lokale verwerking (privacy by design)
- Gebruikt in hybrid ranking

**4. Privacy & Consent**
- ConsentBanner component (GDPR compliant)
- Privacybeleid (docs/privacy.md)
- PII detectie en waarschuwingen
- localStorage voor consent tracking

**5. Documentation**
- Volledige architectuur documentatie (docs/architecture.md)
- Privacy & GDPR compliance docs
- API reference voor edge functions
- Self-learning workflow diagram

---

## 🚀 Versie 5.7 (Q1 2026)

**Theme**: Multi-User & Performance

**Status**: Planning fase

### Prioriteit 1: Multi-User Support

**Doel**: Van single-user (anonymous) naar echte multi-tenant platform

**Tasks**:
- [ ] Supabase Auth integratie (magic link + OAuth)
- [ ] User profiles tabel met metadata
- [ ] RLS policies updaten voor `auth.uid()`
- [ ] Session management (JWT tokens)
- [ ] Onboarding flow voor nieuwe gebruikers

**Impact**: Schaalbaar naar 1000+ gebruikers

---

### Prioriteit 2: Rate Limiting & Caching

**Doel**: Performance & kostenreductie

**Tasks**:
- [ ] Rate limiter in edge functions (60 req/min)
- [ ] Redis cache voor frequent queries
- [ ] Response caching (5min TTL)
- [ ] Retry logic met exponential backoff
- [ ] API usage dashboard

**Verwachte verbetering**: 30% latency reductie, 40% cost saving

---

### Prioriteit 3: Advanced Analytics

**Doel**: Inzicht in therapeutische outcomes

**Tasks**:
- [ ] User journey tracking
- [ ] Rubrics trend analysis (week/maand)
- [ ] Confidence score heatmap
- [ ] Self-learning effectiveness metrics
- [ ] Export functie (CSV/JSON)

**Deliverables**: Analytics dashboard v2.0

---

## 🔮 Versie 6.0 (Q2 2026)

**Theme**: Autonomous Learning & Personalization

**Status**: Concept fase

### Feature 1: Autonomous Seed Generation

**Visie**: AI genereert én activeert seeds zonder admin approval (met veiligheidsdrempels)

**Requirements**:
- [ ] Confidence threshold voor auto-approve (> 0.85)
- [ ] A/B testing framework voor nieuwe seeds
- [ ] Rollback mechanisme bij negatieve feedback
- [ ] Whitelist voor gevoelige topics (crisis, suicide)

**Risk**: Mogelijk fout-positieven → mitigation via staging environment

---

### Feature 2: Personalized Emotion Models

**Visie**: Elke gebruiker krijgt een persoonlijk afgestemd emotie-model

**Approach**:
- [ ] User-specific seed weights (per gebruiker)
- [ ] Conversation history embeddings
- [ ] Personalized ranking algorithm
- [ ] Privacy-preserving federated learning

**Challenge**: Balance personalisatie vs. generalisatie

---

### Feature 3: Multi-Modal Input

**Visie**: Voice & image input naast tekst

**Scope**:
- [ ] Web Speech API (voice-to-text)
- [ ] Image upload + GPT-4 Vision analysis
- [ ] Emoji sentiment analysis
- [ ] Audio tone analysis (optional)

**Dependencies**: OpenAI Whisper API, GPT-4 Vision

---

## 🧪 Experimenteel (Backlog)

**Features in onderzoek, nog geen planning**

### 1. Therapeutic Game Mechanics
- Dagelijkse check-ins (mood tracking)
- Progress visualization (emotional growth chart)
- Achievement system (therapeutische milestones)
- Journaling prompts

**Doel**: Verhoog engagement & long-term adherence

---

### 2. Collaborative Filtering
- "Gebruikers zoals jij vonden dit helpend"
- Seed recommendations gebaseerd op vergelijkbare profielen
- Privacy: Differential privacy voor aggregatie

**Challenge**: Cold start probleem voor nieuwe gebruikers

---

### 3. External Integrations
- Wearables (Fitbit, Apple Health) → stress indicators
- Calendar integration → context-aware responses
- Therapist portal → professional oversight
- Crisis hotlines API → automatic referral

**Scope**: B2B partnerships vereist

---

### 4. Explainable AI (XAI)
- "Waarom koos ik deze response?"
- Visualisatie van hybrid ranking
- Decision tree voor symbolische matches
- Rubrics breakdown per bericht

**Benefit**: Transparantie & trust building

---

## 🛠️ Technical Debt

**Prioriteit: Medium-High**

### Immediate (< 1 maand)
- [x] Learning queue tabel & RLS policies
- [ ] Comprehensive testing (coverage > 80%)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Edge function rate limiting
- [ ] Error monitoring (Sentry)

### Short-term (1-3 maanden)
- [ ] Database migration consolidation (cleanup oude migrations)
- [ ] Seed expiration cleanup job (cron)
- [ ] Deprecated API endpoints removal
- [ ] TypeScript strict mode enforcement
- [ ] Bundle size optimization (< 500KB initial load)

### Long-term (3-6 maanden)
- [ ] Microservices split (Edge Functions → separate services)
- [ ] Database sharding (indien > 100k gebruikers)
- [ ] CDN voor static assets
- [ ] Internationalization (i18n) framework
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## 📊 Success Metrics

**Versie 5.7 KPIs**:
- **Performance**: P95 latency < 1000ms
- **Cost**: API costs < €500/maand (10k req/dag)
- **Quality**: Confidence > 0.70 in 80% van responses
- **Self-Learning**: 10 nieuwe seeds per week (approved)
- **User Engagement**: 5 messages per sessie (gemiddeld)

**Versie 6.0 KPIs**:
- **Personalization**: 20% hogere satisfaction vs. generic model
- **Autonomous Learning**: 90% accuracy in auto-approved seeds
- **Multi-Modal**: 15% gebruikers activeert voice/image input

---

## 🔄 Release Cyclus

- **Minor releases** (5.7, 5.8): Elke 6-8 weken
- **Major releases** (6.0): Elke 4-6 maanden
- **Hotfixes**: Binnen 24 uur voor kritieke bugs
- **Security patches**: Onmiddellijk

---

## 📞 Feedback & Prioritization

**Community input**:
- GitHub Discussions voor feature requests
- Maandelijkse survey onder beta testers
- Admin feedback via Slack channel

**Decision Framework**:
1. **Impact** (Low/Medium/High)
2. **Effort** (S/M/L)
3. **Risk** (Low/Medium/High)
4. **Strategic fit** (Must-have/Nice-to-have)

**Prioritization**: Impact/Effort ratio → High Impact + Low Effort eerst

---

## 🎓 Research Collaboration

**Academische partnerships**:
- Universiteit Utrecht (Klinische Psychologie)
- TU Delft (AI Ethics)
- VU Amsterdam (Mental Health Tech)

**Output**:
- Peer-reviewed papers
- Open datasets (anonymized)
- Benchmark publicatie (EvAI vs. andere chatbots)

---

**Questions? Suggesties?**  
Open een GitHub Discussion of mail naar: product@evai-innerspace.nl

**Changelog**: Zie `CHANGELOG.md` voor gedetailleerde release notes.

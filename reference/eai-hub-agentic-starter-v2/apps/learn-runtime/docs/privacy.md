# EvAI Inner Space - Privacy & Data Protection

**Laatst bijgewerkt**: 26 oktober 2025  
**Versie**: 1.0

## 1. Inleiding

EvAI Inner Space is een therapeutische AI-chatbot die privacy by design hanteert. Dit document beschrijft hoe we omgaan met data, privacy en AVG/GDPR-compliance.

## 2. Dataminimalisatie

### 2.1 Lokale Verwerking
- **Browser ML Engine**: Emotie-detectie gebeurt volledig lokaal in de browser via Transformers.js
- **Geen externe tracking**: Geen Google Analytics, Facebook Pixel of andere tracking pixels
- **Anonieme gebruiker**: Standaard wordt een anoniem gebruiker-ID gebruikt (`00000000-0000-0000-0000-000000000001`)

### 2.2 Data die WEL wordt verzameld
Alleen met expliciete toestemming:
- **Chat berichten**: Opgeslagen in `chat_messages` tabel
- **Feedback**: Gebruikersfeedback op AI-responses (`seed_feedback`)
- **Decision logs**: Technische logs voor kwaliteitsverbetering (`decision_logs`)
- **Rubrics assessments**: Therapeutische beoordelingen (`rubrics_assessments`)

### 2.3 Data die NIET wordt verzameld
- Geen naam, e-mailadres of contactgegevens (tenzij gebruiker expliciet registreert)
- Geen IP-adressen of device fingerprinting
- Geen locatiedata
- Geen browser history of cookies voor tracking

## 3. AVG/GDPR Compliance

### 3.1 Rechtsgrondslag
- **Toestemming**: Gebruikers geven expliciete toestemming via consent banner
- **Gerechtvaardigd belang**: Technische logs voor systeemverbetering

### 3.2 Gebruikersrechten
Gebruikers hebben recht op:
- **Inzage**: Alle opgeslagen data inzien via Admin Dashboard
- **Rectificatie**: Data corrigeren of aanvullen
- **Verwijdering** ("Recht op vergetelheid"): Volledige data-verwijdering op verzoek
- **Dataportabiliteit**: Export van alle data in JSON-formaat
- **Bezwaar**: Bezwaar maken tegen verwerking

### 3.3 Data Retention
- **Chat berichten**: Bewaard tot gebruiker verwijdert
- **Decision logs**: 90 dagen (configureerbaar)
- **Reflection logs**: 180 dagen
- **Feedback**: Permanent (anoniem)

## 4. Persoonsgegevens (PII) Handling

### 4.1 PII Detectie
Het systeem detecteert automatisch PII in chat:
- Namen, e-mailadressen, telefoonnummers
- BSN (Burgerservicenummer)
- Adressen en postcodes
- Medische informatie

### 4.2 PII Bescherming
- **Waarschuwingen**: Gebruiker wordt gewaarschuwd bij detectie van PII
- **Anonimisering**: Optie om PII te anonimiseren vóór opslag
- **Encryptie**: Gevoelige data wordt encrypted at rest (Supabase native)

## 5. Technische Beveiliging

### 5.1 Database Security
- **Row-Level Security (RLS)**: Elke tabel heeft RLS policies
- **Encryptie**: All data encrypted at rest (AES-256)
- **Transport**: TLS 1.3 voor alle API calls
- **API Keys**: Beheerd via Supabase Secrets (nooit in client code)

### 5.2 Edge Functions
- **Rate Limiting**: Max 60 requests/minuut per gebruiker
- **Input Validation**: Alle input wordt gevalideerd en gesanitized
- **Safety Layer**: OpenAI Moderation API voor harmful content detectie

### 5.3 Client-Side Security
- **localStorage**: Alleen consent en preferences (geen gevoelige data)
- **sessionStorage**: Tijdelijke UI state (gewist bij sluiten browser)
- **CSP Headers**: Content Security Policy tegen XSS attacks

## 6. Third-Party Services

### 6.1 OpenAI API
- **Doel**: Emotie-analyse en therapeutische responses
- **Data**: Alleen chat berichten (geen PII als mogelijk)
- **Retention**: OpenAI bewaart data 30 dagen (zero-retention optie beschikbaar)
- **Contract**: Data Processing Agreement (DPA) afgesloten

### 6.2 Supabase
- **Doel**: Database en Edge Functions hosting
- **Locatie**: EU (Frankfurt, Germany)
- **Compliance**: SOC 2 Type II, ISO 27001, GDPR compliant
- **Contract**: DPA afgesloten

### 6.3 Hugging Face
- **Doel**: Browser ML models (Transformers.js)
- **Data**: Volledig lokaal, geen data naar HF servers
- **Privacy**: 100% client-side verwerking

## 7. Consent Management

### 7.1 Consent Banner
Bij eerste bezoek verschijnt consent banner met:
- Duidelijke uitleg over data gebruik
- Link naar dit privacy document
- Accepteren/Weigeren knoppen
- Optie om later consent aan te passen

### 7.2 Consent Withdrawal
Gebruikers kunnen consent intrekken via:
- Settings pagina
- E-mail naar: privacy@evai-innerspace.nl
- Effect: Alle data wordt binnen 30 dagen verwijderd

## 8. Data Breaches

### 8.1 Incident Response
Bij een data breach:
1. Binnen 24 uur: Intern onderzoek starten
2. Binnen 72 uur: Melden bij Autoriteit Persoonsgegevens (AP)
3. Binnen 7 dagen: Getroffen gebruikers informeren
4. Binnen 30 dagen: Volledige incident report publiceren

### 8.2 Preventie
- Regelmatige security audits
- Penetration testing (jaarlijks)
- Dependency updates (wekelijks)
- Supabase security monitoring

## 9. Kinderen

EvAI Inner Space is **niet bedoeld voor kinderen onder 16 jaar** zonder ouderlijk toezicht. We verzamelen bewust geen data van kinderen.

## 10. Internationale Transfers

Data blijft binnen de EU (Supabase Frankfurt). Indien internationale transfers noodzakelijk zijn, gebruiken we:
- Standard Contractual Clauses (SCC's)
- Privacy Shield equivalent mechanisms
- Expliciete gebruikerstoestemming

## 11. Contact

Voor privacy-gerelateerde vragen:

**Data Protection Officer**  
E-mail: privacy@evai-innerspace.nl  
Adres: [Uw adres]  
Telefoon: [Uw telefoonnummer]

**Toezichthouder**  
Autoriteit Persoonsgegevens  
Website: https://autoriteitpersoonsgegevens.nl

## 12. Wijzigingen

Dit privacybeleid kan worden gewijzigd. Belangrijke wijzigingen worden:
- 30 dagen vooraf aangekondigd via e-mail (indien beschikbaar)
- Gepubliceerd op deze pagina met nieuwe versiedatum
- Vermeld in changelog onderaan dit document

## Changelog

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| 1.0 | 26 okt 2025 | Eerste publicatie |

---

**Uw privacy is onze prioriteit. Bij vragen of zorgen, neem gerust contact op.**

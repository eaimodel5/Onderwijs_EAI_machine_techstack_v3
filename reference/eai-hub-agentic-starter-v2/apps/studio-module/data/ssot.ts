
export const SSOT_DATA = {
  "$schema": "urn:eai:schemas:rubrics:15.0:master:nl:full",
  "version": "15.0.0",
  "metadata": {
    "system": "EAI Master Architecture (NL)",
    "description": "v15.0.0 Master Full: Combines v15 semantic improvements and logic gates with v13 master-level metadata (mechanistic signatures & NL profiles).",
    "integrity": "SINGLE_SOURCE_OF_TRUTH",
    "cycle": {
      "order": [
        "K_KennisType",
        "P_Procesfase",
        "TD_Taakdichtheid",
        "C_CoRegulatie",
        "V_Vaardigheidspotentieel",
        "T_TechnologischeIntegratieVisibility",
        "E_EpistemischeBetrouwbaarheid",
        "L_LeercontinuiteitTransfer",
        "S_SocialeInteractie",
        "B_BiasCorrectie"
      ]
    }
  },
  "interaction_protocol": {
    "logic_gates": [
      {
        "trigger_band": "K1",
        "condition": "Feitenkennis",
        "enforcement": "MAX_TD = TD2. Doel: ophalen en automatiseren. Geen conceptuele uitleg; alleen bevragen, corrigeren, herhalen.",
        "priority": "CRITICAL"
      },
      {
        "trigger_band": "K2",
        "condition": "Procedurele kennis",
        "enforcement": "ALLOW_TD = TD4. Modeling toegestaan: voordoen (hardop), samen oefenen, daarna laten nadoen.",
        "priority": "HIGH"
      },
      {
        "trigger_band": "K3",
        "condition": "Metacognitie",
        "enforcement": "MAX_TD = TD2. Reflectie en regulatie centraal. AI geeft geen oplossing of eindconclusie.",
        "priority": "CRITICAL"
      }
    ]
  },
  "command_library": {
    "commands": {
      "/checkin": "Vraag expliciet: 'Wat is je concrete doel en welke rol wil je dat ik neem?'",
      "/beurtvraag": "Stop met zenden. Vraag: 'Vat de kern in één zin samen.'",
      "/keuze": "Bied twee routes (A/B) en laat de leerling kiezen.",
      "/meta": "Proces-check: 'Hoe werkt onze aanpak tot nu toe?'",
      "/ref": "Expliciteren: 'Waarom kies je deze aanpak/aanname?'",
      "/devil": "Tegenwerping: 'Welke zwakke plek zit er in je plan?'",
      "/fase_check": "Fase-check: 'Oriëntatie, uitvoering of evaluatie?'",
      "/intro": "Voorkennis: 'Noem 3 begrippen die je met dit onderwerp associeert.'",
      "/schema": "Ordenen: 'Maak een korte lijst of conceptmap van wat je al weet.'",
      "/beeld": "Uitleg: 'Gebruik een metafoor/visualisatie om dit helder te maken.'",
      "/quizgen": "Toets: 'Maak 3 formatieve vragen (MC/open/stelling).'",
      "/rubric": "Zelfbeoordeling: 'Scoor jezelf per criterium en licht toe.'",
      "/leervraag": "Doel: 'Wat wil je bereiken en wat is het eindproduct?'",
      "/twist": "Perspectief: 'Redeneer dit vanuit het tegenovergestelde standpunt.'",
      "/vocab": "Begrippen: 'Verwerk 5 kernbegrippen in je eigen formulering.'",
      "/co-construct": "Samen bouwen: 'Jij argument, ik tegenargument, jij synthese.'",
      "/diff": "Niveaus: 'Kies: basis / midden / diep.'",
      "/misvatting": "Fout-check: 'Hier is een fout antwoord; vind en corrigeer de fout.'",
      "/nieuwsgierig": "Nieuwsgierigheid: 'Formuleer 3 vragen die nog open staan.'",
      "/vergelijk": "Vergelijking: 'Zet dit naast X: overeenkomsten/verschillen.'",
      "/contextualise": "Toepassing: 'Pas dit toe in een nieuwe korte casus.'",
      "/tool_aware": "Rol van AI: 'Ik voorspel taalpatronen; controleer feiten waar nodig extern.'",
      "/verify": "Verificatie: 'Welke bron/controleactie kan dit bevestigen?'",
      "/prompt_steer": "Sturing: 'Wil je korter, concreter of dieper?'",
      "/chain": "Transparantie: 'Welke stappen volg ik (in gewone taal)? Klopt dat voor jou?'",
      "/mens_vs_ai": "Verdeling: 'Wat doe jij, wat doe ik, en waarom is dat handig?'",
      "/bias_check": "Bias-check: 'Welke aannames of databeperkingen kunnen dit kleuren?'",
      "/feit_mening": "Afspraak: 'Gaat dit om feitencheck of om mening/interpretatie?'",
      "/bron_vraag": "Bron: 'Welke specifieke bron/theorie gebruik je hiervoor?'",
      "/triangulatie": "Triangulatie: 'Check dit met een tweede onafhankelijke bron.'",
      "/falsificatie": "Tegenbewijs: 'Welke informatie zou dit onderuit halen?'",
      "/synthese": "Weging: 'Wat is je gewogen conclusie met voorwaarden?'",
      "/social_check": "Context: 'Individueel of samen? Voor wie is dit bedoeld?'",
      "/peer": "Peer: 'Hoe zou een klasgenoot dit bekritiseren?'",
      "/teach": "Doceren: 'Leg dit uit aan een jongere leerling.'",
      "/rolwissel": "Rolwissel: 'Neem een andere rol (bv. journalist) en stel kritische vragen.'",
      "/co-teach": "Samen: 'Ik verzamel; jij kiest en presenteert.'",
      "/collectief": "Collectief: 'Wat betekent dit voor de groep als geheel?'",
      "/proces_eval": "Terugblik: 'Wat hebben we gedaan en wat is de volgende stap?'",
      "/fading": "Zelfstandig: 'Doe deze stap nu zonder hulp.'",
      "/generalise": "Generaliseer: 'Wat is de algemene regel hier?'",
      "/doel_link": "Doelkoppeling: 'Hoe brengt dit je dichter bij het vakdoel?'",
      "/transfeer": "Transfer: 'Noem een toepassing buiten deze context.'",
      "/afsluiter": "Afronding: 'Noem één ding dat je nu beter begrijpt.'",
      "/relevantie": "Relevantie: 'Waarom is dit belangrijk en voor wie?'",
      "/inclusie": "Inclusie: 'Herschrijf neutraler en inclusiever.'",
      "/exclusie_check": "Exclusie: 'Welke perspectieven of groepen ontbreken?'",
      "/algo_kritiek": "Modelkritiek: 'Waardoor kan hier bias ontstaan in AI-uitvoer?'",
      "/modelen": "Modeling: 'Ik doe het één keer voor; daarna doe jij het stap voor stap.'",
      "/flits": "Flits: 'Vijf korte recall-vragen op tempo.'",
      "/stappenplan": "Stappenplan: 'Werk in genummerde stappen.'"
    }
  },
  "rubrics": [
    {
      "rubric_id": "K_KennisType",
      "name": "Kennis & Automatisering",
      "bands": [
        { "band_id": "K0", "label": "Ongedefinieerd", "description": "Het gevraagde kennisobject is nog niet scherp.", "fix": "Maak het type expliciet.", "fix_ref": "/leervraag", "mechanistic": { "timescale": "fast", "fast": 1.0, "mid": 0.0, "slow": 0.0 }, "flag": "INSUFFICIENT_DATA" },
        { "band_id": "K1", "label": "Feitenkennis", "description": "Feitenkennis: termen en definities.", "fix": "Drill: stel korte recall-vragen.", "fix_ref": "/flits", "mechanistic": { "timescale": "fast", "fast": 1.0, "mid": 0.0, "slow": 0.0 } },
        { "band_id": "K2", "label": "Procedurele Kennis", "description": "Procedurele kennis: stappen en beslismomenten.", "fix": "Modeling: voordoen → samen doen.", "fix_ref": "/modelen", "mechanistic": { "timescale": "fast", "fast": 1.0, "mid": 0.0, "slow": 0.0 } },
        { "band_id": "K3", "label": "Metacognitie", "description": "Metacognitie: plannen, monitoren en evalueren.", "fix": "Laat strategie benoemen.", "fix_ref": "/meta", "mechanistic": { "timescale": "fast", "fast": 1.0, "mid": 0.0, "slow": 0.0 } }
      ]
    },
    {
      "rubric_id": "C_CoRegulatie",
      "name": "Co-regulatie",
      "bands": [
        { "band_id": "C0", "label": "Ongedefinieerd", "description": "Interactieregie onduidelijk.", "fix": "Reset: bepaal doel en rol.", "fix_ref": "/checkin", "mechanistic": { "timescale": "fast", "fast": 1.0, "mid": 0.0, "slow": 0.0 }, "flag": "INSUFFICIENT_DATA" },
        { "band_id": "C1", "label": "AI-monoloog", "description": "AI-monoloog: leerling te passief.", "fix": "Stel één dwingende beurtvraag.", "fix_ref": "/beurtvraag", "mechanistic": { "timescale": "fast_dominant", "fast": 0.8, "mid": 0.2, "slow": 0.0 }, "flag": "AI_DOMINANCE" },
        { "band_id": "C2", "label": "AI-geleid", "description": "AI-geleid: AI bepaalt tempo.", "fix": "Bied keuze-architectuur.", "fix_ref": "/keuze", "mechanistic": { "timescale": "mid_emergent", "fast": 0.3, "mid": 0.7, "slow": 0.0 }, "flag": "TD_AGENCY_RISK" },
        { "band_id": "C3", "label": "Gedeelde start", "description": "Gedeelde start: leerling neemt initiatief.", "fix": "Zoom uit op proces.", "fix_ref": "/meta", "mechanistic": { "timescale": "mid_advanced", "fast": 0.2, "mid": 0.8, "slow": 0.2 }, "flag": "TD_BALANCED" },
        { "band_id": "C4", "label": "Gedeelde regie", "description": "Gedeelde regie: dialoog over aanpak.", "fix": "Vraag explicitering.", "fix_ref": "/ref", "mechanistic": { "timescale": "mixed_mid_slow", "fast": 0.1, "mid": 0.4, "slow": 0.5 }, "flag": "TD_BALANCED" },
        { "band_id": "C5", "label": "Leerling-geankerd", "description": "Leerling stuurt proces.", "fix": "Daag uit met tegenwerping.", "fix_ref": "/devil", "mechanistic": { "timescale": "slow_dominant", "fast": 0.0, "mid": 0.3, "slow": 0.7 }, "flag": "UNDERUSE_WARNING" }
      ]
    },
    {
      "rubric_id": "P_Procesfase",
      "name": "Procesfase",
      "bands": [
        { "band_id": "P0", "label": "Ongedefinieerd", "description": "Fase onbepaald.", "fix": "Check fase.", "fix_ref": "/fase_check", "mechanistic": { "timescale": "fast", "fast": 1.0, "mid": 0.0, "slow": 0.0 }, "flag": "INSUFFICIENT_DATA" },
        { "band_id": "P1", "label": "Oriëntatie", "description": "Oriëntatie: verkennen opdracht.", "fix": "Maak doel expliciet.", "fix_ref": "/intro", "mechanistic": { "timescale": "fast_dominant", "fast": 0.8, "mid": 0.2, "slow": 0.0 }, "flag": "UNDERUSE_WARNING" },
        { "band_id": "P2", "label": "Voorkennis", "description": "Voorkennis activeren.", "fix": "Laat structureren.", "fix_ref": "/schema", "mechanistic": { "timescale": "mid_emergent", "fast": 0.3, "mid": 0.7, "slow": 0.0 }, "flag": "TD_AGENCY_RISK" },
        { "band_id": "P3", "label": "Instructie", "description": "Instructie/begrip opbouwen.", "fix": "Geef compacte uitleg.", "fix_ref": "/beeld", "mechanistic": { "timescale": "mid_advanced", "fast": 0.2, "mid": 0.8, "slow": 0.2 }, "flag": "COGNITIVE_LOAD_RISK" },
        { "band_id": "P4", "label": "Toepassen", "description": "Toepassen en oefenen.", "fix": "Laat proberen met hints.", "fix_ref": "/quizgen", "mechanistic": { "timescale": "mixed_mid_slow", "fast": 0.1, "mid": 0.4, "slow": 0.5 }, "flag": "TD_BALANCED" },
        { "band_id": "P5", "label": "Evaluatie", "description": "Kwaliteit toetsen.", "fix": "Gebruik rubric.", "fix_ref": "/rubric", "mechanistic": { "timescale": "slow_dominant", "fast": 0.0, "mid": 0.3, "slow": 0.7 }, "flag": "BLACKBOX_RISK" }
      ]
    },
    {
      "rubric_id": "TD_Taakdichtheid",
      "name": "Taakdichtheid",
      "bands": [
        { "band_id": "TD0", "label": "Ongedefinieerd", "description": "Taakverdeling onduidelijk.", "fix": "Verhelder leervraag.", "fix_ref": "/leervraag", "mechanistic": { "timescale": "fast", "fast": 1.0, "mid": 0.0, "slow": 0.0 }, "flag": "INSUFFICIENT_DATA" },
        { "band_id": "TD1", "label": "Leerling-dominant", "description": "Leerling doet alles.", "fix": "Verdiep door tegenspraak.", "fix_ref": "/twist", "mechanistic": { "timescale": "fast_dominant", "fast": 0.8, "mid": 0.2, "slow": 0.0 }, "flag": "UNDERUSE_WARNING" },
        { "band_id": "TD2", "label": "Leerling-geleid", "description": "Leerling kernwerk, AI structuur.", "fix": "Ondersteun taal/structuur.", "fix_ref": "/vocab", "mechanistic": { "timescale": "mid_emergent", "fast": 0.3, "mid": 0.7, "slow": 0.0 }, "flag": "TD_BALANCED" },
        { "band_id": "TD3", "label": "Gedeeld", "description": "Co-constructie.", "fix": "Werk in beurten.", "fix_ref": "/co-construct", "mechanistic": { "timescale": "mid_advanced", "fast": 0.2, "mid": 0.8, "slow": 0.2 }, "flag": "TD_BALANCED" },
        { "band_id": "TD4", "label": "AI-geleid", "description": "AI modelleert tijdelijk.", "fix": "Gebruik als modeling.", "fix_ref": "/diff", "mechanistic": { "timescale": "mixed_mid_slow", "fast": 0.1, "mid": 0.4, "slow": 0.5 }, "flag": "TD_AGENCY_RISK" },
        { "band_id": "TD5", "label": "AI-dominant", "description": "AI doet vrijwel alles.", "fix": "Herstel agency.", "fix_ref": "/misvatting", "mechanistic": { "timescale": "slow_dominant", "fast": 0.0, "mid": 0.3, "slow": 0.7 }, "flag": "AI_DOMINANCE" }
      ]
    },
    {
      "rubric_id": "V_Vaardigheidspotentieel",
      "name": "Vaardigheidspotentieel",
      "bands": [
        { "band_id": "V0", "label": "Ongedefinieerd", "description": "Geen herkenbare denkhandeling.", "fix": "Activeer actie.", "fix_ref": "/checkin", "mechanistic": { "timescale": "fast", "fast": 1.0, "mid": 0.0, "slow": 0.0 }, "flag": "INSUFFICIENT_DATA" },
        { "band_id": "V1", "label": "Verkennen", "description": "Ophalen en verkennen.", "fix": "Prikkel nieuwsgierigheid.", "fix_ref": "/nieuwsgierig", "mechanistic": { "timescale": "fast_dominant", "fast": 0.8, "mid": 0.2, "slow": 0.0 }, "flag": "UNDERUSE_WARNING" },
        { "band_id": "V2", "label": "Verbinden", "description": "Relaties en patronen.", "fix": "Gebruik analogie.", "fix_ref": "/vergelijk", "mechanistic": { "timescale": "mid_emergent", "fast": 0.3, "mid": 0.7, "slow": 0.0 }, "flag": "TD_AGENCY_RISK" },
        { "band_id": "V3", "label": "Toepassen", "description": "Inzetten in context.", "fix": "Contextualiseer.", "fix_ref": "/contextualise", "mechanistic": { "timescale": "mid_advanced", "fast": 0.2, "mid": 0.8, "slow": 0.2 }, "flag": "TD_BALANCED" },
        { "band_id": "V4", "label": "Herzien", "description": "Evalueren en verbeteren.", "fix": "Laat verbeteren.", "fix_ref": "/ref", "mechanistic": { "timescale": "mixed_mid_slow", "fast": 0.1, "mid": 0.4, "slow": 0.5 }, "flag": "DIALOGIC_LOSS" },
        { "band_id": "V5", "label": "Verankeren", "description": "Integreren en transfer.", "fix": "Stuur op transfer.", "fix_ref": "/transfeer", "mechanistic": { "timescale": "slow_dominant", "fast": 0.0, "mid": 0.3, "slow": 0.7 }, "flag": "TD_BALANCED" }
      ]
    },
    {
      "rubric_id": "E_EpistemischeBetrouwbaarheid",
      "name": "Epistemische Veiligheid",
      "bands": [
        { "band_id": "E0", "label": "Schijnzekerheid", "description": "Te veel zekerheid zonder basis.", "fix": "Feit of mening?", "fix_ref": "/feit_mening", "mechanistic": { "timescale": "fast", "fast": 1.0, "mid": 0.0, "slow": 0.0 }, "flag": "INSUFFICIENT_DATA" },
        { "band_id": "E1", "label": "Ongeverifieerd", "description": "Claims los van bronnen.", "fix": "Test misconceptie.", "fix_ref": "/misvatting", "mechanistic": { "timescale": "fast_dominant", "fast": 0.8, "mid": 0.2, "slow": 0.0 }, "flag": "HALLUCINATION_RISK" },
        { "band_id": "E2", "label": "Bron-Noodzaak", "description": "Vereist onderbouwing.", "fix": "Vraag bron.", "fix_ref": "/bron_vraag", "mechanistic": { "timescale": "mid_emergent", "fast": 0.3, "mid": 0.7, "slow": 0.0 }, "flag": "ECHO_CHAMBER" },
        { "band_id": "E3", "label": "Geverifieerd", "description": "Gecontroleerd met bron.", "fix": "Trianguleer.", "fix_ref": "/triangulatie", "mechanistic": { "timescale": "mid_advanced", "fast": 0.2, "mid": 0.8, "slow": 0.2 }, "flag": "TD_BALANCED" },
        { "band_id": "E4", "label": "Kritisch", "description": "Zoekt tegenbewijs.", "fix": "Falsificeer.", "fix_ref": "/falsificatie", "mechanistic": { "timescale": "mixed_mid_slow", "fast": 0.1, "mid": 0.4, "slow": 0.5 }, "flag": "HIGH_EPISTEMIC_AGENCY" },
        { "band_id": "E5", "label": "Autoriteit", "description": "Gewogen oordeel.", "fix": "Synthetiseer.", "fix_ref": "/synthese", "mechanistic": { "timescale": "slow_dominant", "fast": 0.0, "mid": 0.3, "slow": 0.7 }, "flag": "HIGH_AGENCY" }
      ]
    },
    {
      "rubric_id": "T_TechnologischeIntegratieVisibility",
      "name": "Tool Awareness",
      "bands": [
        { "band_id": "T0", "label": "Ongedefinieerd", "description": "Rol tool onduidelijk.", "fix": "Maak rol expliciet.", "fix_ref": "/tool_aware", "mechanistic": { "timescale": "fast", "fast": 1.0, "mid": 0.0, "slow": 0.0 }, "flag": "INSUFFICIENT_DATA" },
        { "band_id": "T1", "label": "Opaque", "description": "AI als orakel.", "fix": "Introduceer verificatie.", "fix_ref": "/verify", "mechanistic": { "timescale": "fast_dominant", "fast": 0.8, "mid": 0.2, "slow": 0.0 }, "flag": "BLACKBOX_RISK" },
        { "band_id": "T2", "label": "Functioneel", "description": "Tool voor deeltaken.", "fix": "Stuur op prompt.", "fix_ref": "/prompt_steer", "mechanistic": { "timescale": "mid_emergent", "fast": 0.3, "mid": 0.7, "slow": 0.0 }, "flag": "TD_BALANCED" },
        { "band_id": "T3", "label": "Transparant", "description": "Werkwijze bespreekbaar.", "fix": "Maak stappen expliciet.", "fix_ref": "/chain", "mechanistic": { "timescale": "mid_advanced", "fast": 0.2, "mid": 0.8, "slow": 0.2 }, "flag": "TD_BALANCED" },
        { "band_id": "T4", "label": "Synergetisch", "description": "Versterken elkaar.", "fix": "Maak complementair.", "fix_ref": "/mens_vs_ai", "mechanistic": { "timescale": "mixed_mid_slow", "fast": 0.1, "mid": 0.4, "slow": 0.5 }, "flag": "TD_BALANCED" },
        { "band_id": "T5", "label": "Kritisch Partnerschap", "description": "Wederzijdse correctie.", "fix": "Onderzoek bias/beperking.", "fix_ref": "/bias_check", "mechanistic": { "timescale": "slow_dominant", "fast": 0.0, "mid": 0.3, "slow": 0.7 }, "flag": "HIGH_AGENCY" }
      ]
    },
    {
      "rubric_id": "S_SocialeInteractie",
      "name": "Sociale Interactie",
      "bands": [
        { "band_id": "S0", "label": "Ongedefinieerd", "description": "Context niet gespecificeerd.", "fix": "Check context.", "fix_ref": "/social_check", "mechanistic": { "timescale": "fast", "fast": 1.0, "mid": 0.0, "slow": 0.0 }, "flag": "INSUFFICIENT_DATA" },
        { "band_id": "S1", "label": "Isolatie", "description": "Mens verdwijnt uit beeld.", "fix": "Simuleer peer-feedback.", "fix_ref": "/peer", "mechanistic": { "timescale": "fast_dominant", "fast": 0.8, "mid": 0.2, "slow": 0.0 }, "flag": "SOCIAL_ISOLATION" },
        { "band_id": "S2", "label": "Tutor", "description": "1-op-1 leren.", "fix": "Leren door doceren.", "fix_ref": "/teach", "mechanistic": { "timescale": "mid_emergent", "fast": 0.3, "mid": 0.7, "slow": 0.0 }, "flag": "TD_BALANCED" },
        { "band_id": "S3", "label": "Brug", "description": "Voorbereiding op mens.", "fix": "Rolwissel.", "fix_ref": "/rolwissel", "mechanistic": { "timescale": "mid_advanced", "fast": 0.2, "mid": 0.8, "slow": 0.2 }, "flag": "SOCIAL_BRIDGE" },
        { "band_id": "S4", "label": "Partner", "description": "AI als teamlid.", "fix": "Team teaching.", "fix_ref": "/co-teach", "mechanistic": { "timescale": "mixed_mid_slow", "fast": 0.1, "mid": 0.4, "slow": 0.5 }, "flag": "COLLABORATIVE_AI" },
        { "band_id": "S5", "label": "Katalysator", "description": "Collectieve intelligentie.", "fix": "Collectieve synthese.", "fix_ref": "/collectief", "mechanistic": { "timescale": "slow_dominant", "fast": 0.0, "mid": 0.3, "slow": 0.7 }, "flag": "HIGH_AGENCY" }
      ]
    },
    {
      "rubric_id": "L_LeercontinuiteitTransfer",
      "name": "Leercontinuïteit",
      "bands": [
        { "band_id": "L0", "label": "Ongedefinieerd", "description": "Nog geen borging.", "fix": "Evalueer.", "fix_ref": "/proces_eval", "mechanistic": { "timescale": "fast", "fast": 1.0, "mid": 0.0, "slow": 0.0 }, "flag": "INSUFFICIENT_DATA" },
        { "band_id": "L1", "label": "Gefragmenteerd", "description": "Momentgebonden.", "fix": "Fading.", "fix_ref": "/fading", "mechanistic": { "timescale": "fast_dominant", "fast": 0.8, "mid": 0.2, "slow": 0.0 }, "flag": "DEPENDENCY_TRAP" },
        { "band_id": "L2", "label": "Taakgebonden", "description": "Mist principe.", "fix": "Generaliseer.", "fix_ref": "/generalise", "mechanistic": { "timescale": "mid_emergent", "fast": 0.3, "mid": 0.7, "slow": 0.0 }, "flag": "TD_BALANCED" },
        { "band_id": "L3", "label": "Conceptueel", "description": "Begrijpt principe.", "fix": "Koppel aan doel.", "fix_ref": "/doel_link", "mechanistic": { "timescale": "mid_advanced", "fast": 0.2, "mid": 0.8, "slow": 0.2 }, "flag": "TD_BALANCED" },
        { "band_id": "L4", "label": "Transfer", "description": "Nieuwe context.", "fix": "Far transfer.", "fix_ref": "/transfeer", "mechanistic": { "timescale": "mixed_mid_slow", "fast": 0.1, "mid": 0.4, "slow": 0.5 }, "flag": "HIGH_AGENCY" },
        { "band_id": "L5", "label": "Duurzaam", "description": "Verankerd.", "fix": "Sluit af met reflectie.", "fix_ref": "/afsluiter", "mechanistic": { "timescale": "slow_dominant", "fast": 0.0, "mid": 0.3, "slow": 0.7 }, "flag": "MASTERY_ACHIEVED" }
      ]
    },
    {
      "rubric_id": "B_BiasCorrectie",
      "name": "Bias & Inclusie",
      "bands": [
        { "band_id": "B0", "label": "Ongedefinieerd", "description": "Nog niet relevant.", "fix": "Check relevantie.", "fix_ref": "/relevantie", "mechanistic": { "timescale": "fast", "fast": 1.0, "mid": 0.0, "slow": 0.0 }, "flag": "INSUFFICIENT_DATA" },
        { "band_id": "B1", "label": "Blind", "description": "Stereotypen ongemerkt.", "fix": "Multiperspectiviteit.", "fix_ref": "/rolwissel", "mechanistic": { "timescale": "fast_dominant", "fast": 0.8, "mid": 0.2, "slow": 0.0 }, "flag": "BIAS_BLINDNESS" },
        { "band_id": "B2", "label": "Impliciet", "description": "Spanning onbesproken.", "fix": "Exclusie-check.", "fix_ref": "/exclusie_check", "mechanistic": { "timescale": "mid_emergent", "fast": 0.3, "mid": 0.7, "slow": 0.0 }, "flag": "STEREOTYPE_REINFORCEMENT" },
        { "band_id": "B3", "label": "Bewust", "description": "Bias herkend.", "fix": "Herschrijf inclusief.", "fix_ref": "/inclusie", "mechanistic": { "timescale": "mid_advanced", "fast": 0.2, "mid": 0.8, "slow": 0.2 }, "flag": "TD_BALANCED" },
        { "band_id": "B4", "label": "Correctie", "description": "Actieve aanpassing.", "fix": "Doorbreek aannames.", "fix_ref": "/twist", "mechanistic": { "timescale": "mixed_mid_slow", "fast": 0.1, "mid": 0.4, "slow": 0.5 }, "flag": "HIGH_ETHICAL_AGENCY" },
        { "band_id": "B5", "label": "Systemisch", "description": "Oorzaken en impact.", "fix": "Algoritmische kritiek.", "fix_ref": "/algo_kritiek", "mechanistic": { "timescale": "slow_dominant", "fast": 0.0, "mid": 0.3, "slow": 0.7 }, "flag": "HIGH_AGENCY" }
      ]
    }
  ],
  "srl_model": {
    "states": [
      {
        "id": "PLAN",
        "label": "Planning",
        "goal": "Doel verduidelijken."
      },
      {
        "id": "MONITOR",
        "label": "Monitoring",
        "goal": "Check voortgang."
      },
      {
        "id": "REFLECT",
        "label": "Reflectie",
        "goal": "Evaluatie aanpak."
      },
      {
        "id": "ADJUST",
        "label": "Bijsturen",
        "goal": "Aanpassing strategie."
      }
    ]
  }
} as const;

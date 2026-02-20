-- Import EvAI 5.6 Rubrics into database

-- Insert VA (Algemene Assessment)
INSERT INTO rubrics (code, rubric_json)
VALUES (
  'VA',
  '{
    "code": "VA",
    "name": "Algemene Assessment",
    "version": "1.0.0",
    "description": "Algemene rubric voor brede psychosociale beoordeling",
    "dimensions": [
      {
        "id": "mental_wellbeing",
        "name": "Mentaal Welzijn",
        "weight": 0.40,
        "indicators": [
          {
            "id": "mw_mood",
            "description": "Algemene stemming en affect",
            "scoring": {
              "high": "Positief affect, stabiele stemming",
              "medium": "Wisselende stemming, periodieke neerslachtigheid",
              "low": "Persistente negatieve stemming of plat affect"
            }
          },
          {
            "id": "mw_anxiety",
            "description": "Angst- en stressniveau",
            "scoring": {
              "high": "Minimale angst, goed stress management",
              "medium": "Matige angst, beheersbaar stress",
              "low": "Hoge angst, overweldigende stress"
            }
          }
        ]
      },
      {
        "id": "functioning",
        "name": "Dagelijks Functioneren",
        "weight": 0.35,
        "indicators": [
          {
            "id": "f_daily_activities",
            "description": "Uitvoering van dagelijkse taken",
            "scoring": {
              "high": "Volledige participatie in dagelijkse activiteiten",
              "medium": "Gedeeltelijke uitvoering, sommige beperkingen",
              "low": "Ernstige beperkingen in dagelijks functioneren"
            }
          },
          {
            "id": "f_work_school",
            "description": "Functioneren op werk/school",
            "scoring": {
              "high": "Adequaat presteren, stabiel",
              "medium": "Wisselend presteren, regelmatige uitdagingen",
              "low": "Ernstige problemen, mogelijk arbeidsongeschiktheid"
            }
          }
        ]
      },
      {
        "id": "relationships",
        "name": "Relationele Gezondheid",
        "weight": 0.25,
        "indicators": [
          {
            "id": "r_quality",
            "description": "Kwaliteit van interpersoonlijke relaties",
            "scoring": {
              "high": "Gezonde, ondersteunende relaties",
              "medium": "Gemengde kwaliteit, sommige conflicten",
              "low": "Problematische relaties of isolatie"
            }
          }
        ]
      }
    ],
    "thresholds": {
      "high_risk": 0.35,
      "moderate_risk": 0.60,
      "low_risk": 0.80
    }
  }'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  rubric_json = EXCLUDED.rubric_json;

-- Insert VM (Motivatie Assessment)
INSERT INTO rubrics (code, rubric_json)
VALUES (
  'VM',
  '{
    "code": "VM",
    "name": "Motivatie Assessment",
    "version": "1.0.0",
    "description": "Rubric voor het beoordelen van motivatie en veranderingsbereidheid",
    "dimensions": [
      {
        "id": "change_readiness",
        "name": "Veranderingsbereidheid",
        "weight": 0.40,
        "indicators": [
          {
            "id": "cr_awareness",
            "description": "Bewustzijn van noodzaak tot verandering",
            "scoring": {
              "high": "Duidelijk inzicht in noodzaak en bereidheid",
              "medium": "Enig inzicht, ambivalentie aanwezig",
              "low": "Geen of minimaal inzicht in veranderingsbehoefte"
            }
          },
          {
            "id": "cr_commitment",
            "description": "Commitment aan veranderingsproces",
            "scoring": {
              "high": "Sterke toewijding, concrete stappen gezet",
              "medium": "Matige toewijding, overwegend maar niet handelend",
              "low": "Geen commitment, weerstand tegen verandering"
            }
          }
        ]
      },
      {
        "id": "goal_orientation",
        "name": "Doelgerichtheid",
        "weight": 0.35,
        "indicators": [
          {
            "id": "go_clarity",
            "description": "Duidelijkheid van doelen",
            "scoring": {
              "high": "Specifieke, meetbare doelen geformuleerd",
              "medium": "Algemene doelen, beperkte specificiteit",
              "low": "Vage of afwezige doelstellingen"
            }
          },
          {
            "id": "go_persistence",
            "description": "Doorzettingsvermogen",
            "scoring": {
              "high": "Consistent volhouden ondanks obstakels",
              "medium": "Wisselend volhouden, soms opgeven",
              "low": "Snel opgeven bij tegenslag"
            }
          }
        ]
      },
      {
        "id": "self_efficacy",
        "name": "Zelfeffectiviteit",
        "weight": 0.25,
        "indicators": [
          {
            "id": "se_belief",
            "description": "Geloof in eigen kunnen",
            "scoring": {
              "high": "Sterk geloof in eigen competenties",
              "medium": "Gemiddeld zelfvertrouwen, situatie-afhankelijk",
              "low": "Laag zelfvertrouwen, twijfel aan eigen capaciteiten"
            }
          }
        ]
      }
    ],
    "thresholds": {
      "high_risk": 0.30,
      "moderate_risk": 0.55,
      "low_risk": 0.75
    }
  }'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  rubric_json = EXCLUDED.rubric_json;

-- Insert VC (Coping Vaardigheden)
INSERT INTO rubrics (code, rubric_json)
VALUES (
  'VC',
  '{
    "code": "VC",
    "name": "Coping Vaardigheden",
    "version": "1.0.0",
    "description": "Rubric voor het beoordelen van coping vaardigheden en emotionele regulatie",
    "dimensions": [
      {
        "id": "emotional_regulation",
        "name": "Emotionele Regulatie",
        "weight": 0.35,
        "indicators": [
          {
            "id": "er_awareness",
            "description": "Bewustzijn van eigen emoties",
            "scoring": {
              "high": "Duidelijke herkenning en benoemen van emoties",
              "medium": "Gedeeltelijk bewustzijn van emoties",
              "low": "Beperkt of geen bewustzijn van emoties"
            }
          },
          {
            "id": "er_management",
            "description": "Vermogen om emoties te reguleren",
            "scoring": {
              "high": "Effectieve strategieën voor emotieregulatie",
              "medium": "Sommige regulatiestrategieën, wisselend effectief",
              "low": "Moeite met emotieregulatie"
            }
          }
        ]
      },
      {
        "id": "problem_solving",
        "name": "Probleemoplossend Vermogen",
        "weight": 0.30,
        "indicators": [
          {
            "id": "ps_approach",
            "description": "Systematische benadering van problemen",
            "scoring": {
              "high": "Gestructureerde aanpak, meerdere oplossingen overwegen",
              "medium": "Enige structuur, beperkte opties overwegen",
              "low": "Chaotische of afwezige probleemoplossing"
            }
          }
        ]
      },
      {
        "id": "social_support",
        "name": "Sociaal Steun Netwerk",
        "weight": 0.20,
        "indicators": [
          {
            "id": "ss_availability",
            "description": "Beschikbaarheid van steun",
            "scoring": {
              "high": "Sterk sociaal netwerk beschikbaar",
              "medium": "Beperkt maar aanwezig netwerk",
              "low": "Weinig tot geen sociale steun"
            }
          }
        ]
      },
      {
        "id": "resilience",
        "name": "Veerkracht",
        "weight": 0.15,
        "indicators": [
          {
            "id": "r_bounce_back",
            "description": "Vermogen om te herstellen van tegenslagen",
            "scoring": {
              "high": "Snelle en effectieve recovery",
              "medium": "Geleidelijke recovery, wisselend tempo",
              "low": "Moeite met herstel, langdurige impact"
            }
          }
        ]
      }
    ],
    "thresholds": {
      "high_risk": 0.30,
      "moderate_risk": 0.55,
      "low_risk": 0.75
    }
  }'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  rubric_json = EXCLUDED.rubric_json;

-- Insert VS (Safety & Crisis Assessment)
INSERT INTO rubrics (code, rubric_json)
VALUES (
  'VS',
  '{
    "code": "VS",
    "name": "Safety & Crisis Assessment",
    "version": "1.0.0",
    "description": "Rubric voor veiligheidsbeoordeling en crisis risico inschatting",
    "dimensions": [
      {
        "id": "suicide_risk",
        "name": "Suïcide Risico",
        "weight": 0.45,
        "indicators": [
          {
            "id": "sr_ideation",
            "description": "Aanwezigheid van suïcidale gedachten",
            "scoring": {
              "high": "Geen suïcidale ideatie",
              "medium": "Passieve doodswens, geen concrete plannen",
              "low": "Actieve suïcidale ideatie met plan"
            }
          },
          {
            "id": "sr_intent",
            "description": "Intentie en planning",
            "scoring": {
              "high": "Geen intentie of planning",
              "medium": "Vage planning, geen concrete voorbereidingen",
              "low": "Duidelijke intentie met concrete voorbereidingen"
            }
          },
          {
            "id": "sr_means",
            "description": "Toegang tot middelen",
            "scoring": {
              "high": "Geen toegang tot letale middelen",
              "medium": "Beperkte toegang, enige barrières aanwezig",
              "low": "Direct toegang tot letale middelen"
            }
          }
        ]
      },
      {
        "id": "self_harm",
        "name": "Zelfbeschadiging",
        "weight": 0.25,
        "indicators": [
          {
            "id": "sh_history",
            "description": "Geschiedenis van zelfbeschadiging",
            "scoring": {
              "high": "Geen geschiedenis van zelfbeschadiging",
              "medium": "Eerdere zelfbeschadiging, momenteel gestopt",
              "low": "Recente of actieve zelfbeschadiging"
            }
          },
          {
            "id": "sh_urges",
            "description": "Huidige drang tot zelfbeschadiging",
            "scoring": {
              "high": "Geen drang of gedachten",
              "medium": "Occasionele gedachten, onder controle",
              "low": "Frequente drang, moeite met weerstand"
            }
          }
        ]
      },
      {
        "id": "crisis_factors",
        "name": "Crisis Versterkers",
        "weight": 0.30,
        "indicators": [
          {
            "id": "cf_recent_loss",
            "description": "Recent verlies of trauma",
            "scoring": {
              "high": "Geen recent verlies",
              "medium": "Verlies maar adequate coping",
              "low": "Recent significant verlies met slechte coping"
            }
          },
          {
            "id": "cf_substance",
            "description": "Middelengebruik",
            "scoring": {
              "high": "Geen problematisch gebruik",
              "medium": "Matig gebruik, geen ernstige problemen",
              "low": "Problematisch gebruik, verhoogd risico"
            }
          },
          {
            "id": "cf_isolation",
            "description": "Sociale isolatie",
            "scoring": {
              "high": "Goed verbonden, actief sociaal netwerk",
              "medium": "Beperkt netwerk maar enige verbinding",
              "low": "Ernstige isolatie, geen sociaal vangnet"
            }
          }
        ]
      }
    ],
    "thresholds": {
      "high_risk": 0.40,
      "moderate_risk": 0.65,
      "low_risk": 0.85
    }
  }'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  rubric_json = EXCLUDED.rubric_json;
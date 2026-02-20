import { GoogleGenAI } from '@google/genai';
import { SSOT_DATA } from './data/ssot'; 
import { CURRICULUM_PATHS, getLearningPath } from './data/curriculum';
import { store, createAudit, createBreach, incrementSessionMessageCount, recordLatency } from './store';
import type { ChatRequest, ChatResponse, EAIAnalysis, LearnerProfile, MechanicalState, NudgeRequest, LearningNode } from './types';
import { responseSchema } from './schema';

const MODEL_PRO = 'gemini-3-pro-preview';
const MODEL_FLASH = 'gemini-3-flash-preview';

const RUIJSSENAARS_THEORY = `
THEORETISCH KADER (RUIJSSENAARS):
1. FEITENKENNIS (K1): Doel=Automatiseren. Aanpak=Inprenten/Flitsen. Fout=Vragen naar inzicht.
2. PROCEDURELE KENNIS (K2): Doel=Uitvoeren. Aanpak=Modeling (voordoen -> samen -> zelf).
3. METACOGNITIE (K3): Doel=Regie. Aanpak=Reflectie/Monitoring.
`;

const generateSystemPrompt = (profile: LearnerProfile, currentNode: LearningNode | null) => {
  const context = {
    rubrics: SSOT_DATA.rubrics,
    commands: SSOT_DATA.command_library.commands,
    gates: SSOT_DATA.interaction_protocol.logic_gates,
    diagnostics: SSOT_DATA.didactic_diagnostics,
    phases: SSOT_DATA.rubrics.find(r => r.rubric_id === 'P_Procesfase')?.bands
  };

  let curriculumContext = "";
  if (currentNode) {
      curriculumContext = `
ACTIEVE LEERLIJN MODULE:
- Huidige Stap: ${currentNode.title}
- ID: ${currentNode.id}
- Leerdoel: ${currentNode.description}
- Didactische Focus: ${currentNode.didactic_focus}
- Mastery Criteria (Wanneer is het 'AF'?): ${currentNode.mastery_criteria}
- Veelgemaakte fouten: ${currentNode.common_misconceptions?.join(', ')}

INSTRUCTIE: 
Focus je coaching SPECIFIEK op deze stap. 
Als je overtuigd bent dat de leerling dit beheerst volgens de criteria, zet dan 'mastery_check: true' in je analyse.
`;
  }

  return `
Je bent de EAI Leercoach (NL). Je bent strikt gebonden aan de volgende SSOT Architectuur v15.0.

CONTEXT DATA:
${JSON.stringify(context)}

${RUIJSSENAARS_THEORY}

PROFIEL LEERLING:
${JSON.stringify(profile)}

${curriculumContext}

PROTOCOL:
1. Analyseer de input op P (Fase), TD (Taakdichtheid), C (Co-regulatie) en K (Kennis).
2. CONTROLEER 'LOGIC GATES': Als een gate getriggerd wordt (bijv. K1=Feitenkennis), MOET je de 'enforcement' regel volgen.
3. SINGLE QUESTION RULE: Stel maximaal 1 vraag per bericht.
4. JSON OUTPUT ONLY.
`;
};

const scrubPII = (input: string): { scrubbed: string; detected: string[] } => {
  const detected: string[] = [];
  let output = input;
  const patterns = [
    { label: 'email', regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
    { label: 'phone', regex: /\b(\+?\d[\d\s().-]{7,}\d)\b/g },
    { label: 'bsn', regex: /\b\d{9}\b/g }
  ];
  patterns.forEach(({ label, regex }) => {
    if (regex.test(output)) detected.push(label);
    output = output.replace(regex, `[REDACTED_${label.toUpperCase()}]`);
  });
  return { scrubbed: output, detected };
};

const normalizeAnalysis = (a: any, profile: LearnerProfile): EAIAnalysis => {
  const asStrArray = (v: any) => (Array.isArray(v) ? v.filter((x: any) => typeof x === 'string') : []);
  const srl = typeof a?.srl_state === 'string' ? a.srl_state : 'UNKNOWN';

  return {
    process_phases: asStrArray(a?.process_phases),
    coregulation_bands: asStrArray(a?.coregulation_bands),
    task_densities: asStrArray(a?.task_densities),
    secondary_dimensions: asStrArray(a?.secondary_dimensions),
    active_fix: typeof a?.active_fix === 'string' ? a.active_fix : null,
    reasoning: typeof a?.reasoning === 'string' ? a.reasoning : '',
    current_profile: a?.current_profile || profile,
    task_density_balance: typeof a?.task_density_balance === 'number' ? a.task_density_balance : 50,
    epistemic_status: typeof a?.epistemic_status === 'string' ? a.epistemic_status : 'ONBEKEND',
    cognitive_mode: typeof a?.cognitive_mode === 'string' ? a.cognitive_mode : 'ONBEKEND',
    srl_state: ['PLAN', 'MONITOR', 'REFLECT', 'ADJUST', 'UNKNOWN'].includes(srl) ? srl : 'UNKNOWN',
    mastery_check: !!a?.mastery_check
  };
};

const buildMechanical = (latencyMs: number, model: string, inputTokens = 0, outputTokens = 0): MechanicalState => ({
  latencyMs,
  inputTokens,
  outputTokens,
  model,
  temperature: 0.4,
  timestamp: new Date().toISOString()
});

const evaluateBreaches = (analysis: EAIAnalysis, sessionId: string) => {
  const td = analysis.task_densities.find((b) => b.startsWith('TD'));
  const p = analysis.process_phases.find((b) => b.startsWith('P'));
  if (td === 'TD5' && p === 'P3') {
    return createBreach(sessionId, 'LOGIC_GATE_TD5_P3', 'HIGH', {
      detected: { td, p }
    });
  }
  return null;
};

const estimateTokens = (text: string) => Math.ceil(text.length / 4);

const mockResponse = (message: string, profile: LearnerProfile) => {
  const analysis: EAIAnalysis = {
    process_phases: ['P2'],
    coregulation_bands: ['C2'],
    task_densities: ['TD3'],
    secondary_dimensions: ['E2'],
    active_fix: null,
    reasoning: 'Heuristic fallback (no API key).',
    current_profile: profile,
    task_density_balance: 50,
    epistemic_status: 'INTERPRETATIE',
    cognitive_mode: 'PRAGMATISCH',
    srl_state: 'MONITOR',
    mastery_check: false
  };

  return {
    analysis,
    text: `Ik heb je input ontvangen. Wat is je exacte leerdoel voor vandaag? (fallback)`
  };
};

export const generateChatResponse = async (payload: ChatRequest): Promise<ChatResponse> => {
  const start = Date.now();
  const apiKey = process.env.API_KEY;
  
  incrementSessionMessageCount(payload.sessionId);

  // 1. Resolve Mastery State
  let currentNode: LearningNode | null = null;
  let activePathId: string | null = null;

  if (payload.userId) {
      const path = getLearningPath(payload.profile.subject, payload.profile.level);
      if (path) {
          activePathId = `${path.subject}_${path.level}`.toUpperCase().replace(/\s/g, '');
          const masteryKey = `${payload.userId}:${activePathId}`;
          let mastery = store.mastery.get(masteryKey);
          
          if (!mastery) {
              mastery = {
                  userId: payload.userId,
                  pathId: activePathId,
                  currentNodeId: path.nodes[0].id,
                  status: 'INTRO',
                  history: []
              };
              store.mastery.set(masteryKey, mastery);
          }
          currentNode = path.nodes.find(n => n.id === mastery!.currentNodeId) || path.nodes[0];
      }
  }

  const { scrubbed, detected } = scrubPII(payload.message);
  const audit = createAudit(payload.sessionId, 'CHAT_RECEIVED', {
    detectedPII: detected,
    scrubbed
  });

  let analysis: EAIAnalysis;
  let text: string;
  let modelUsed = MODEL_PRO;

  if (!apiKey) {
      const mock = mockResponse(scrubbed, payload.profile);
      analysis = mock.analysis;
      text = mock.text;
      modelUsed = 'mock';
  } else {
      const genAI = new GoogleGenAI({ apiKey });
      try {
          const result = await genAI.models.generateContent({
            model: MODEL_PRO,
            contents: [{ role: 'user', parts: [{ text: scrubbed }] }],
            config: {
              systemInstruction: generateSystemPrompt(payload.profile, currentNode),
              responseMimeType: 'application/json',
              responseSchema
            }
          });

          const raw = result.text || '{}';
          const parsed = JSON.parse(raw);
          analysis = normalizeAnalysis(parsed.analysis, payload.profile);
          text = parsed.conversational_response || "Er is een fout opgetreden.";
      } catch (e) {
          console.error("Gemini Error", e);
          const mock = mockResponse(scrubbed, payload.profile);
          analysis = mock.analysis;
          text = "System Error: " + (e as Error).message;
          modelUsed = 'error';
      }
  }

  const latencyMs = Date.now() - start;
  const mechanical = buildMechanical(
      latencyMs,
      modelUsed,
      estimateTokens(scrubbed),
      estimateTokens(text)
  );
  recordLatency(latencyMs);

  // Logic Gate Check (Post-Hoc)
  const breach = evaluateBreaches(analysis, payload.sessionId);
  if (breach) {
    mechanical.logicGateBreach = {
      trigger_band: breach.breachType,
      rule_description: 'Instruction Phase prohibits full AI Dominance.',
      detected_value: JSON.stringify(breach.details),
      priority: breach.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
    };
  }

  // Mastery Update
  if (analysis.mastery_check && currentNode && payload.userId && activePathId) {
      const path = getLearningPath(payload.profile.subject, payload.profile.level);
      if (path) {
          const currentIndex = path.nodes.findIndex(n => n.id === currentNode!.id);
          const nextNode = path.nodes[currentIndex + 1];
          const masteryKey = `${payload.userId}:${activePathId}`;
          const currentMastery = store.mastery.get(masteryKey)!;
          
          currentMastery.history.push({
              nodeId: currentNode.id,
              evidence: "AI_CONFIRMED",
              createdAt: Date.now(),
              score: 100
          });
          
          if (nextNode) {
              currentMastery.currentNodeId = nextNode.id;
              currentMastery.status = 'INTRO';
              createAudit(payload.userId, 'MASTERY_ADVANCE', { from: currentNode.id, to: nextNode.id });
          } else {
              currentMastery.status = 'MASTERED';
              currentMastery.currentNodeId = null;
          }
          store.mastery.set(masteryKey, currentMastery);
      }
  }

  return {
      sessionId: payload.sessionId,
      text,
      analysis,
      mechanical,
      auditId: audit.id
  };
};

export const generateNudgeResponse = async (payload: NudgeRequest) => {
  const start = Date.now();
  incrementSessionMessageCount(payload.sessionId);

  const apiKey = process.env.API_KEY;
  const prompt = `Geef een korte nudge (niveau ${payload.level}) die de leerling helpt doorgaan. Max 1 vraag.`;
  
  let analysis: EAIAnalysis;
  let text: string;
  let modelUsed = MODEL_FLASH;

  if (!apiKey) {
      const mock = mockResponse(prompt, payload.profile);
      analysis = mock.analysis;
      text = mock.text;
      modelUsed = 'mock';
  } else {
      const genAI = new GoogleGenAI({ apiKey });
      try {
          const result = await genAI.models.generateContent({
            model: MODEL_FLASH,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json', responseSchema }
          });
          const raw = result.text || '{}';
          const parsed = JSON.parse(raw);
          analysis = normalizeAnalysis(parsed.analysis, payload.profile);
          text = parsed.conversational_response;
      } catch (e) {
          const mock = mockResponse(prompt, payload.profile);
          analysis = mock.analysis;
          text = "Nudge Error";
          modelUsed = 'error';
      }
  }

  const latencyMs = Date.now() - start;
  const mechanical = buildMechanical(latencyMs, modelUsed, estimateTokens(prompt), estimateTokens(text));
  recordLatency(latencyMs);

  return {
    sessionId: payload.sessionId,
    text,
    analysis,
    mechanical,
    auditId: createAudit(payload.sessionId, 'NUDGE_SENT', { level: payload.level }).id
  };
};
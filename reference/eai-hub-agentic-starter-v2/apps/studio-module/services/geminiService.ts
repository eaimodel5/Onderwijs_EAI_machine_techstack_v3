
import { GoogleGenAI, Type, Schema, Content } from "@google/genai";
import { 
  SYSTEM_INSTRUCTION_TEMPLATE_NL 
} from "../constants";
import { EAIAnalysis, MechanicalState, RepairLog, LearnerProfile, RouterDecision, SupervisorLog, ScaffoldingState } from "../types";
import { getEAICore } from "../utils/ssotParser";
import { validateAnalysisAgainstSSOT, checkLogicGates, calculateScaffoldingTrend, EAIHistoryEntry, calculateGFactor } from "../utils/eaiLearnAdapter";

let genAI: GoogleGenAI | null = null;

const DEMO_API_KEY: string = ""; 
const MODEL_PRO = 'gemini-3-pro-preview';
const MODEL_FLASH = 'gemini-3-flash-preview';

// SCALING: Increased from 12 to 50 to support long-term scaffolding.
const MAX_HISTORY_ITEMS = 50;

let chatHistory: Content[] = [];
// Internal state for trend tracking in service (simplified, ideally passed from app state)
let internalAgencyHistory: number[] = []; 

export const checkApiKeyConfigured = (): boolean => {
    if (DEMO_API_KEY && DEMO_API_KEY.length > 0) return true;
    try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) return true;
    } catch (e) {}
    return false;
};

export const initializeGemini = () => {
  let finalKey = DEMO_API_KEY;
  try {
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
          if (!finalKey) finalKey = process.env.API_KEY;
      }
  } catch (e) {}
  if (!finalKey) return;
  genAI = new GoogleGenAI({ apiKey: finalKey });
};

export const resetChatSession = () => {
    chatHistory = [];
    internalAgencyHistory = [];
};

const trimHistory = () => {
    if (chatHistory.length > MAX_HISTORY_ITEMS) {
        chatHistory = chatHistory.slice(-MAX_HISTORY_ITEMS);
    }
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    conversational_response: { type: Type.STRING },
    analysis: {
      type: Type.OBJECT,
      properties: {
        process_phases: { type: Type.ARRAY, items: { type: Type.STRING } },
        coregulation_bands: { type: Type.ARRAY, items: { type: Type.STRING } },
        task_densities: { type: Type.ARRAY, items: { type: Type.STRING } },
        secondary_dimensions: { type: Type.ARRAY, items: { type: Type.STRING } },
        active_fix: { type: Type.STRING, nullable: true },
        reasoning: { type: Type.STRING },
        current_profile: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, nullable: true },
            subject: { type: Type.STRING, nullable: true },
            level: { type: Type.STRING, nullable: true },
            grade: { type: Type.STRING, nullable: true },
            goal: { type: Type.STRING, nullable: true },
          }
        },
        task_density_balance: { type: Type.NUMBER },
        epistemic_status: { type: Type.STRING },
        cognitive_mode: { type: Type.STRING },
        srl_state: { type: Type.STRING, enum: ["PLAN", "MONITOR", "REFLECT", "ADJUST", "UNKNOWN"] }
      },
      required: ["process_phases", "coregulation_bands", "task_densities", "reasoning", "task_density_balance", "srl_state"],
    },
  },
  required: ["conversational_response", "analysis"],
};

const cleanJsonString = (input: string): string => {
    let clean = (input || '').trim();
    if (clean.startsWith('```')) {
        clean = clean.replace(/^```[a-zA-Z]*\s*/i, '').replace(/\s*```\s*$/i, '');
    }
    const first = clean.indexOf('{');
    const last = clean.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
        clean = clean.slice(first, last + 1);
    }
    return clean.trim();
};

// PHASE 1: Anti-Leakage Filter
const applyAntiLeakage = (text: string): string => {
    const core = getEAICore();
    let cleaned = text;

    core.commands.forEach(cmd => {
        const regex = new RegExp(`${cmd.command}\\b`, 'g');
        cleaned = cleaned.replace(regex, '');
    });

    const allBands = core.rubrics.flatMap(r => r.bands.map(b => b.band_id));
    allBands.forEach(band => {
         const regex = new RegExp(`(\\[${band}\\]|\\(${band}\\)|\\b${band}\\b)`, 'g');
         cleaned = cleaned.replace(regex, '');
    });

    return cleaned.replace(/\s+/g, ' ').trim();
};

/**
 * Phase 5.1: Markdown Structure Healer
 * Ensures tables are not glued to text, enabling correct rendering.
 */
const fixMarkdownFormatting = (text: string): string => {
    if (!text) return "";
    
    let healed = text;
    
    // Pattern 1: Table glued to end of sentence
    // Looks for: (punctuation)(space)(pipe)(content)(pipe)
    // Example: "vechten'. | Wie |"
    healed = healed.replace(/([.!?'])\s+(\|.+?\|.+?\|)/g, '$1\n\n$2');

    return healed;
};

const VALID_SRL_STATES = ["PLAN", "MONITOR", "REFLECT", "ADJUST", "UNKNOWN"];

const normalizeAnalysis = (a: any): EAIAnalysis => {
    const obj = (a && typeof a === 'object') ? a : {};
    const asStrArray = (v: any) => Array.isArray(v) ? v.filter(x => typeof x === 'string') : [];
    
    let srl = typeof obj.srl_state === 'string' ? obj.srl_state : 'UNKNOWN';
    if (!VALID_SRL_STATES.includes(srl)) {
        srl = 'UNKNOWN';
    }

    return {
        process_phases: asStrArray(obj.process_phases),
        coregulation_bands: asStrArray(obj.coregulation_bands),
        task_densities: asStrArray(obj.task_densities),
        secondary_dimensions: asStrArray(obj.secondary_dimensions),
        active_fix: typeof obj.active_fix === 'string' ? obj.active_fix : null,
        reasoning: typeof obj.reasoning === 'string' ? obj.reasoning : '',
        task_density_balance: Math.max(0, Math.min(100, typeof obj.task_density_balance === 'number' ? obj.task_density_balance : 50)),
        epistemic_status: typeof obj.epistemic_status === 'string' ? obj.epistemic_status : 'ONBEKEND',
        cognitive_mode: typeof obj.cognitive_mode === 'string' ? obj.cognitive_mode : 'ONBEKEND',
        srl_state: srl,
        current_profile: obj.current_profile || {}
    };
};

const getCompactSSOT = () => {
    const core = getEAICore();
    return JSON.stringify({
        commands: core.commands,
        rubrics: core.rubrics.map(r => ({
            id: r.rubric_id,
            name: r.name,
            bands: r.bands.map(b => ({ 
                id: b.band_id, 
                label: b.label,
                description: b.description, 
                learner_obs: b.learner_obs || [],
                ai_obs: b.ai_obs || [],
                fix: b.fix,
                fix_ref: b.fix_ref,
                mechanistic: b.mechanistic 
            }))
        }))
    });
};

const determineIntent = async (message: string, historyLength: number): Promise<RouterDecision> => {
    if (!genAI) return { target_model: MODEL_FLASH, thinking_budget: 0, intent_category: 'FAST', reasoning: 'No API' };

    if (historyLength < 2 && message.length < 15 && !message.startsWith('/')) {
         return { target_model: MODEL_FLASH, thinking_budget: 0, intent_category: 'FAST', reasoning: 'Heuristic: Simple start' };
    }

    const routerSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            category: { type: Type.STRING, enum: ['FAST', 'MID', 'SLOW'] },
            reasoning: { type: Type.STRING }
        },
        required: ['category', 'reasoning']
    };

    const routerPrompt = `
    Analyze the complexity of this user input in an educational context.
    DEFINITIONS:
    - FAST: Recall (K1), simple checks (C0), greetings.
    - MID: Procedure (K2), Scaffolding (TD2), Explanation.
    - SLOW: Metacognition (K3), Critical thinking (E4/E5), Synthesis (S5).
    INPUT: "${message}"
    Return JSON: { category, reasoning }
    `;

    try {
        const result = await genAI.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: routerPrompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: routerSchema,
                temperature: 0.1
            }
        });

        const raw = JSON.parse(result.text || "{}");
        const category = raw.category || 'MID';

        if (category === 'SLOW') {
            return { target_model: MODEL_PRO, thinking_budget: 8000, intent_category: 'SLOW', reasoning: raw.reasoning };
        } else if (category === 'MID') {
            return { target_model: MODEL_PRO, thinking_budget: 2000, intent_category: 'MID', reasoning: raw.reasoning };
        } else {
            return { target_model: MODEL_FLASH, thinking_budget: 0, intent_category: 'FAST', reasoning: raw.reasoning };
        }

    } catch (e) {
        console.warn("Router failed, fallback to Pro:", e);
        return { target_model: MODEL_PRO, thinking_budget: 0, intent_category: 'MID', reasoning: 'Router Failure' };
    }
};

/**
 * Helper: Translates Education Level to Didactic Language Protocol
 */
const getLanguageDirective = (level: string | null): string => {
    const l = (level || '').toUpperCase();
    if (l.includes('VMBO')) {
        return "TAALPROTOCOL (CRITICAL): NIVEAU 1F/2F (Praktisch). Gebruik korte zinnen. Wees direct en concreet. Vermijd abstract jargon zonder directe uitleg. Focus op 'hoe' en 'wat'.";
    }
    if (l.includes('HAVO')) {
        return "TAALPROTOCOL (CRITICAL): NIVEAU 3F (Theoretisch). Gebruik heldere structuur. Vakterminologie is toegestaan mits functioneel. Focus op verbanden en toepassingen.";
    }
    if (l.includes('VWO') || l.includes('GYMNASIUM')) {
        return "TAALPROTOCOL (CRITICAL): NIVEAU 4F (Academisch). Hoge informatiedichtheid en abstractie zijn toegestaan. Daag uit met complexe concepten, nuance en metapercpectieven.";
    }
    return "TAALPROTOCOL: ADAPTIEF. Scan de input van de leerling en match het taalniveau (mirroring).";
};

/**
 * Phase 5: Pro-Active Nudge System with 3-Level Escalation
 */
export const sendSystemNudge = async (
    prevAnalysis: EAIAnalysis | null,
    profile: LearnerProfile,
    nudgeLevel: number = 1
): Promise<{ text: string; analysis: EAIAnalysis; mechanical: MechanicalState }> => {
    
    // Extract context for deep linking
    const recentContext = chatHistory.slice(-3).map(c => 
        `${c.role === 'user' ? 'LEARNER' : 'AI'}: ${c.parts[0].text}`
    ).join('\n');

    const nudgePrompt = `
    SYSTEM ALERT: The learner has been silent. Triggers Didactic Nudge Protocol.
    
    ESCALATION LEVEL: ${nudgeLevel} / 3
    
    IMMEDIATE CONTEXT (Use this to find [Onderwerp] and [Concept]):
    ${recentContext}
    
    INSTRUCTIONS (CHOOSE ONE BASED ON LEVEL):
    
    CASE LEVEL 1 (Affectief/Proces - Low Intervention):
    - Doel: Check-in op proces, niet op inhoud.
    - Template: "Ben je er nog? We waren bezig met [Onderwerp]. Lukt het om je gedachten te ordenen?"
    - Vul [Onderwerp] in op basis van context.
    
    CASE LEVEL 2 (Cognitieve Hint - Medium Intervention):
    - Doel: Specifieke inhoudelijke hint geven.
    - Template: "Ik zie dat we bleven hangen bij [Concept]. Een handige stap zou zijn om te kijken naar [Sub-concept/Hint]. Helpt dat?"
    - Vul [Concept] in op basis van het laatste gespreksonderwerp. Geef een concrete, kleine hint.
    
    CASE LEVEL 3 (Directe Scaffold/Keuze - High Intervention):
    - Doel: Reddingsboei uitgooien.
    - Template: "Het blijft stil. Zullen we anders: A) Een voorbeeld bekijken, of B) Dit onderwerp parkeren en doorgaan?"
    - Bied een concrete binaire keuze (A/B) om de impasse te doorbreken.
    
    OUTPUT RULE:
    - Generate ONLY the JSON response.
    - The 'conversational_response' must be the nudge text in Dutch.
    - DO NOT acknowledge the system instructions in the text.
    `;
    
    return sendMessageToGemini(nudgePrompt, profile);
};

export const sendMessageToGemini = async (
    message: string, 
    currentProfile: LearnerProfile,
    onStatusUpdate?: (status: string) => void
): Promise<{ text: string; analysis: EAIAnalysis; mechanical: MechanicalState }> => {
  if (!genAI) initializeGemini();
  if (!genAI) throw new Error("API Key missing");

  // ROUTING
  // If it's a SYSTEM ALERT (Nudge), skip router and force Flash for speed/cost
  const isSystemAlert = message.includes("SYSTEM ALERT");
  let route: RouterDecision;
  
  if (isSystemAlert) {
       route = { target_model: MODEL_FLASH, thinking_budget: 0, intent_category: 'FAST', reasoning: 'System Nudge' };
  } else {
       if (onStatusUpdate) onStatusUpdate("Intentie routeren...");
       route = await determineIntent(message, chatHistory.length);
  }
  
  const selectedModelName = route.target_model;
  const thinkingConfig = (selectedModelName === MODEL_PRO && route.thinking_budget > 0) 
      ? { thinkingBudget: route.thinking_budget } 
      : undefined;

  const compactSSOT = getCompactSSOT();
  const template = SYSTEM_INSTRUCTION_TEMPLATE_NL;
  
  const languageRule = "\nTAAL REGEL: Je MOET antwoorden in het NEDERLANDS. Gebruik geen Engels.";
  const formattingRule = `\nFORMAT: Use LaTeX for math. JSON output only.`;
  const fixRule = `\nCRITICAL OUTPUT RULE: field 'active_fix' MUST be a command string (starting with '/') from the SSOT, or null.`;
  
  // PHASE 4: SCAFFOLDING ADVICE GENERATION
  const dummyHistory = internalAgencyHistory.map((score, i) => ({ agency_score: score } as EAIHistoryEntry));
  const trendData = calculateScaffoldingTrend(dummyHistory, 50); 
  
  const scaffoldingInjection = trendData.advice 
      ? `\n\n!!! SCAFFOLDING ALERT (HISTORY TREND) !!!\nADVICE: ${trendData.advice}\n(The student's agency is trending ${trendData.trend}. Adjust support accordingly.)\n` 
      : "";

  // DYNAMIC LANGUAGE PROTOCOL INJECTION
  const languageProtocol = getLanguageDirective(currentProfile.level);

  const contextPinning = `
\nACTIVE LEARNER CONTEXT (PERSISTENT):
- Name: ${currentProfile.name || 'Unknown'}
- Level/Grade: ${currentProfile.level || '?'} / ${currentProfile.grade || '?'}
- Subject: ${currentProfile.subject || 'General'}
- PRIMARY LEARNING GOAL: "${currentProfile.goal || 'Not specified'}"
${scaffoldingInjection}
\n${languageProtocol}
`;

  const systemInstruction = template.replace('[[SSOT_INJECTION_POINT]]', `COMPACT SSOT DEFINITION:\n${compactSSOT}`) + contextPinning + languageRule + formattingRule + fixRule;

  try {
    const startTime = Date.now();
    
    // Don't add System Alerts to chat history context, only the result
    const contents: Content[] = [...chatHistory];
    if (!isSystemAlert) {
        trimHistory();
        contents.push({ role: 'user', parts: [{ text: message }] });
    } else {
        contents.push({ role: 'user', parts: [{ text: message }] });
    }
    
    if (onStatusUpdate) onStatusUpdate("Didactiek genereren (Draft)...");
    
    // --- STEP 1: GENERATE DRAFT ---
    let response = await genAI.models.generateContent({
        model: selectedModelName,
        contents,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.7,
            thinkingConfig
        }
    });

    let rawText = response.text || "{}";
    let cleanedJson = cleanJsonString(rawText);
    let parsed: any = {};
    let repairAttempts = 0;
    let repairLog: RepairLog | undefined = undefined;
    let supervisorLog: SupervisorLog | undefined = undefined;
    
    // Syntax Repair Loop
    try {
        parsed = JSON.parse(cleanedJson);
    } catch (parseError: any) {
        console.warn(`Critical Syntax Failure. Repairing...`);
        repairAttempts = 1;
        if (onStatusUpdate) onStatusUpdate("⚠️ Syntax Repair...");
        
        repairLog = { timestamp: Date.now(), error: parseError.message, brokenPayload: rawText };
        
        // Repair Call
        response = await genAI.models.generateContent({
            model: MODEL_PRO, 
            contents: [{ role: 'user', parts: [{ text: `FIX THIS JSON:\n${rawText}` }] }],
            config: { responseMimeType: "application/json", responseSchema, temperature: 0.2 }
        });
        rawText = response.text || "{}";
        cleanedJson = cleanJsonString(rawText);
        try { parsed = JSON.parse(cleanedJson); } 
        catch(e) { parsed = { conversational_response: "System Error.", analysis: {} }; }
    }

    let finalAnalysis = normalizeAnalysis(parsed.analysis);

    // --- STEP 2: SUPERVISOR LOOP (PHASE 3) ---
    // Check the draft analysis against strict Logic Gates
    const gateBreach = checkLogicGates(finalAnalysis);

    if (gateBreach && (gateBreach.priority === 'CRITICAL' || gateBreach.priority === 'HIGH')) {
        // SUPERVISOR INTERVENTION TRIGGERED
        if (onStatusUpdate) onStatusUpdate(`🛑 Supervisor: ${gateBreach.trigger_band} violation detected.`);
        
        const originalReasoning = finalAnalysis.reasoning;
        
        const supervisorPrompt = `
        !!! SUPERVISOR INTERVENTION !!!
        
        Your previous DRAFT response violated a strict didactic Logic Gate from the SSOT.
        
        VIOLATION DETECTED:
        - Trigger: ${gateBreach.trigger_band}
        - Rule: ${gateBreach.rule_description}
        - Your Output: ${gateBreach.detected_value}
        
        ACTION REQUIRED:
        You must REWRITE your response immediately.
        1. Adhere strictly to ${gateBreach.rule_description}.
        2. Adjust your 'analysis' tags to reflect this correction.
        3. Explain in 'reasoning' why you corrected yourself.
        
        PREVIOUS CONTEXT (The User Message): "${message}"
        `;

        supervisorLog = {
            timestamp: Date.now(),
            breach: gateBreach,
            original_reasoning: originalReasoning,
            correction_prompt: supervisorPrompt
        };

        if (onStatusUpdate) onStatusUpdate("⚡ Herschrijven (Supervisor)...");
        
        response = await genAI.models.generateContent({
            model: MODEL_PRO,
            contents: [...contents, { role: 'model', parts: [{ text: JSON.stringify(parsed) }] }, { role: 'user', parts: [{ text: supervisorPrompt }] }],
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
                temperature: 0.5 
            }
        });

        rawText = response.text || "{}";
        cleanedJson = cleanJsonString(rawText);
        try {
            parsed = JSON.parse(cleanedJson);
            finalAnalysis = normalizeAnalysis(parsed.analysis); 
        } catch (e) {
            console.error("Supervisor Correction Failed to parse", e);
        }
    }

    // --- STEP 3: FINALIZATION ---
    const validation = validateAnalysisAgainstSSOT(finalAnalysis);
    finalAnalysis = validation.healedAnalysis;
    
    // PHASE 3: SEMANTIC INTEGRITY CHECK (G-FACTOR)
    const semanticCheck = calculateGFactor(finalAnalysis);

    // Update internal agency history for next turn
    if (finalAnalysis.task_density_balance !== undefined) {
         internalAgencyHistory.push(finalAnalysis.task_density_balance);
         if (internalAgencyHistory.length > 10) internalAgencyHistory.shift();
    }

    const rawConversationalResponse = parsed.conversational_response || "...";
    let safeResponseText = applyAntiLeakage(rawConversationalResponse);
    
    // --- PHASE 5.1: FORMATTING HEALER (MARKDOWN FIXES) ---
    safeResponseText = fixMarkdownFormatting(safeResponseText);

    const endTime = Date.now();
    
    if (!isSystemAlert) {
         chatHistory.push({ role: 'user', parts: [{ text: message }] });
    }
    chatHistory.push({ role: 'model', parts: [{ text: safeResponseText }] });
    trimHistory();

    const usage = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0 };
    return {
      text: safeResponseText,
      analysis: finalAnalysis,
      mechanical: {
          latencyMs: endTime - startTime,
          inputTokens: usage.promptTokenCount,
          outputTokens: usage.candidatesTokenCount,
          model: selectedModelName,
          temperature: 0.7,
          timestamp: new Date(),
          repairAttempts: repairAttempts,
          repairLog: repairLog,
          supervisorLog: supervisorLog,
          softValidationLog: validation.warnings,
          logicGateBreach: validation.logicGateBreach, 
          routerDecision: route,
          semanticValidation: semanticCheck
      }
    };
  } catch (error) {
    console.error("Gemini Failure:", error);
    throw error;
  }
};

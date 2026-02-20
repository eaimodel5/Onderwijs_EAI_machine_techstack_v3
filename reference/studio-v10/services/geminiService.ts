import { GoogleGenAI } from "@google/genai";
import { EAIAnalysis, MechanicalState, LearnerProfile } from '../types';
import { getEAICore } from '../utils/ssotParser';
import { SYSTEM_INSTRUCTION_TEMPLATE_NL } from '../constants';
import { responseSchema } from './schema';
import { validateAnalysisAgainstSSOT, calculateGFactor } from '../utils/eaiLearnAdapter';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

let sessionId = '';

const ensureSessionId = () => {
  if (!sessionId) {
    sessionId = (globalThis.crypto?.randomUUID?.() || `sess_${Date.now()}`);
  }
  return sessionId;
};

// Anti-Leakage: remove internal SSOT codes from the output text presented to user
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

export const checkApiKeyConfigured = (): boolean => {
  return !!process.env.API_KEY;
};

export const resetChatSession = () => {
  sessionId = '';
};

export const sendMessageToGemini = async (
  message: string,
  onStatus: (status: string) => void,
  profile: LearnerProfile
): Promise<{ text: string; analysis: EAIAnalysis; mechanical: MechanicalState }> => {
  ensureSessionId();
  onStatus('Genereren...');
  
  const start = Date.now();
  const core = getEAICore();
  
  // Inject FULL SSOT Context (Rubrics, Commands, Gates) for Master Level compliance
  const promptContext = {
      rubrics: core.rubrics,
      commands: core.commands,
      logic_gates: core.interaction_protocol?.logic_gates || [],
      context_model: core.context_model,
      diagnostics: core.didactic_diagnostics
  };

  const systemPrompt = SYSTEM_INSTRUCTION_TEMPLATE_NL.replace(
      '[[SSOT_INJECTION_POINT]]', 
      JSON.stringify(promptContext)
  );

  const userContent = `Profiel: ${JSON.stringify(profile)}\n\nInput: ${message}`;

  try {
      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // High reasoning model
        contents: [{ role: 'user', parts: [{ text: userContent }] }],
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: responseSchema
        }
      });

      const rawText = result.text || '{}';
      let parsed: any;
      try {
          parsed = JSON.parse(rawText);
      } catch (e) {
          console.error("Failed to parse JSON", rawText);
          parsed = { 
              conversational_response: "Er is een technische fout opgetreden bij het verwerken van het antwoord.",
              analysis: { reasoning: "JSON Parse Error" }
          };
      }

      let analysis: EAIAnalysis = parsed.analysis || {};
      const text = parsed.conversational_response || "";

      // Validate & Heal Analysis
      const validation = validateAnalysisAgainstSSOT(analysis);
      analysis = validation.healedAnalysis;

      const end = Date.now();
      const latencyMs = end - start;
      const gFactor = calculateGFactor(analysis);

      const mechanical: MechanicalState = {
          latencyMs,
          inputTokens: 0, 
          outputTokens: 0,
          model: 'gemini-3-pro-preview',
          temperature: 0.4,
          timestamp: new Date().toISOString(),
          logicGateBreach: validation.logicGateBreach,
          repairAttempts: validation.warnings.length > 0 ? 1 : 0,
          repairLog: validation.warnings.length > 0 ? {
              timestamp: Date.now(),
              error: 'SSOT Deviation',
              brokenPayload: JSON.stringify(validation.warnings)
          } : undefined,
          semanticValidation: gFactor
      };

      return {
        text: applyAntiLeakage(text),
        analysis,
        mechanical
      };

  } catch (error) {
      console.error(error);
      throw error;
  }
};

export const sendSystemNudge = async (
  lastAnalysis: EAIAnalysis,
  profile: LearnerProfile,
  level: number
): Promise<{ text: string; analysis: EAIAnalysis; mechanical: MechanicalState }> => {
  ensureSessionId();
  const start = Date.now();
  
  const prompt = `Geef een korte nudge (niveau ${level}) die de leerling helpt doorgaan. Baseer je op de vorige analyse: ${JSON.stringify(lastAnalysis)}. Max 1 vraag.`;
  
  const core = getEAICore();
  const promptContext = {
      rubrics: core.rubrics,
      commands: core.commands,
      logic_gates: core.interaction_protocol?.logic_gates || []
  };

  const systemPrompt = SYSTEM_INSTRUCTION_TEMPLATE_NL.replace(
      '[[SSOT_INJECTION_POINT]]', 
      JSON.stringify(promptContext)
  );

  try {
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: responseSchema
        }
      });
      
      const rawText = result.text || '{}';
      const parsed = JSON.parse(rawText);
      let analysis: EAIAnalysis = parsed.analysis || {};
      const text = parsed.conversational_response || "";
      
      const validation = validateAnalysisAgainstSSOT(analysis);
      analysis = validation.healedAnalysis;

      const mechanical: MechanicalState = {
          latencyMs: Date.now() - start,
          inputTokens: 0,
          outputTokens: 0,
          model: 'gemini-3-flash-preview',
          temperature: 0.4,
          timestamp: new Date().toISOString(),
          semanticValidation: calculateGFactor(analysis)
      };

      return {
          text: applyAntiLeakage(text),
          analysis,
          mechanical
      };
  } catch(e) {
      throw e;
  }
};
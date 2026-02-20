
import { EaimParameters } from "../types";

// V5.1 ROBUST JSON PARSER (Frontier Class)
export const cleanJson = (text: string): string => {
  if (!text) return "{}";
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  const isArray = firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace);
  
  if (isArray) {
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          return cleaned.substring(firstBracket, lastBracket + 1);
      }
  } else {
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          return cleaned.substring(firstBrace, lastBrace + 1);
      }
  }
  return cleaned;
};

// MIDDLEWARE LOGIC (The "Guard")
// This logic enforces the RAG Findings over the LLM's "opinion".
// It acts as the final gatekeeper before data reaches the UI.
export const applyMiddlewareRules = (data: any, toolName: string): any => {
    const report = { ...data };
    
    // --- 1. RAG ENFORCEMENT: DATA SOVEREIGNTY ---
    // If the RAG scan detected US hosting, we enforce the cap, even if the LLM gave a high score.
    if (report.eu_compliance?.server_location === 'US' || report.eu_compliance?.server_location === 'Unknown') {
        // Hard Cap: Non-EU tools cannot exceed 0.5 Compliance Factor (Attention required)
        if (report.compliance_factor > 0.5) {
            console.warn(`[Middleware] Capping Compliance for ${toolName} due to US/Unknown hosting.`);
            report.compliance_factor = 0.5;
            report.eu_compliance.gdpr_status = 'ATTENTION';
            report.main_summary += " [SYSTEM AUDIT: Compliance score automatically capped. Server location confirmed outside EU jurisdiction.]";
        }
    }

    // --- 2. RAG ENFORCEMENT: MYTH DETECTION ---
    // If the Reasoning text contains "Learning Styles" without debunking it, we tank the Epistemic Score.
    const combinedReasoning = (report.parameters?.P?.reasoning || "") + (report.parameters?.V?.reasoning || "");
    const lowerReasoning = combinedReasoning.toLowerCase();
    
    if (lowerReasoning.includes("learning styles") || lowerReasoning.includes("leerstijlen")) {
        // Only penalize if it's NOT mentioned in a critical context (myth, debunk, false)
        if (!lowerReasoning.includes("myth") && !lowerReasoning.includes("debunk") && !lowerReasoning.includes("mythe")) {
            console.warn(`[Middleware] Penalizing ${toolName} for uncritical use of Learning Styles myth.`);
            report.parameters.E.score = Math.min(report.parameters.E.score, 0.2); 
            report.parameters.E.reasoning += " [SYSTEM FLAG: The analysis detected uncritical references to 'Learning Styles'. This is a neuro-myth and reduces the reliability score.]";
        }
    }

    // --- 3. SANITY CHECK: TASK DENSITY ---
    // If Task Density is very high (AI does everything), Agency (C) should logically be low.
    // If the LLM missed this correlation, we nudge it.
    if (report.task_density > 0.8 && report.parameters.C.score > 0.6) {
         report.parameters.C.score = 0.5; // Cap Agency
         report.parameters.C.reasoning += " [SYSTEM ADJUSTMENT: High automation detected. Agency score adjusted to reflect passive user role.]";
    }

    return report;
};

export const calculateEAIScore = (p: EaimParameters, compliance: number, taskDensity: number): number => {
  const coreSum = p.P.score + p.TD.score + p.C.score;
  const coreAvg = coreSum / 3;
  const secSum = p.V.score + p.T.score + p.L.score;
  const secAvg = secSum / 3;
  
  // Reliability is a Multiplier (If reliability is low, the whole tool score drops)
  const reliabilityFactor = p.E.score < 0.3 ? 0.5 : 1.0; 
  
  // Bias is a Multiplier
  const biasFactor = p.B.score < 0.4 ? 0.8 : 1.0; 

  let rawScore = (coreAvg * 0.6) + (secAvg * 0.4);
  
  // Compliance is the Ultimate Gatekeeper
  let finalScore = rawScore * reliabilityFactor * biasFactor * compliance * 10;
  
  return Math.min(10, Math.max(0, finalScore));
};


import { RUBRIC_15_9 } from "../data/rubrics";

/**
 * EAI KERNEL COMPILER (v15.9)
 * 
 * Instead of a static text file, this function COMPILES the System Prompt 
 * directly from the structured JSON data (RUBRIC_15_9).
 * 
 * This ensures that the Matrix viewed by the user in the UI is IDENTICAL 
 * to the instructions processed by the Neural Network.
 * 
 * TRUE SSOT ARCHITECTURE.
 */
export const getKernelPrompt = (): string => {
    
    // 1. Compile Rubric Bands dynamically from JSON
    const rubricsCompiled = RUBRIC_15_9.rubrics.map(r => {
        const bands = r.bands.map(b => 
            `- BAND ${b.band_id} (${b.score_min.toFixed(1)}-${(b.score_min + 0.19).toFixed(2)}) "${b.label}": ${b.description}`
        ).join('\n');
        
        return `
--- DIMENSION: ${r.rubric_id} (${r.name}) ---
CONTEXT: ${r.dimension}
BANDS:
${bands}
        `.trim();
    }).join('\n\n');

    // 2. Inject Formulas from JSON
    const formulasCompiled = `
MATH LOGIC (CLASS IV EVALUATOR):
- Core Formula: ${RUBRIC_15_9.formulas.core}
- Aggregation: ${RUBRIC_15_9.formulas.EAI}
- Correction (F_TD): ${RUBRIC_15_9.formulas.F_TD}
    `.trim();

    // 3. Assemble the Master Kernel Prompt
    return `
### SYSTEM IDENTITY
ROLE: EAI Class IV Evaluator (Kernel ${RUBRIC_15_9.version}).
TYPE: Didactic & Technical Audit Engine.
MISSION: Analyze Educational AI tools with extreme precision. Use the COMPILED MATRIX below.

---

*** EAI KERNEL MATRIX (COMPILED SSOT) ***

${rubricsCompiled}

---

*** CALCULATOR LOGIC ***
${formulasCompiled}

---

### PART 2: MYTH-BUSTING & RAG PROTOCOLS
You are a "Myth-Proof" system. Flag these immediately:
1. **Learning Styles**: If tool claims "visual/auditory" adaptation -> FLAG PSEUDOSCIENCE.
2. **Engagement Fallacy**: High interaction != High Learning. Check for Cognitive Offloading.

**DATA SOVEREIGNTY (RAG ENFORCED)**
- US Hosted / Unclear = COMPLIANCE FACTOR 0.5 MAX (Attention)
- EU Hosted / No Login = COMPLIANCE FACTOR 1.0 (Safe)

---

### PART 3: OUTPUT INSTRUCTION
1. **Tone**: Forensic Auditor.
2. **NO CODES**: Do not say "Band C1", say "The AI drives the conversation."
3. **Reasoning**: Map evidence specifically to the Band Definitions above.
4. **Fix Suggestions**: Provide concrete didactical interventions (e.g. "Use /meta prompt").

EXECUTE AUDIT.
    `;
};

/**
 * Neurosymbolic Emotion Detector v3.0
 * 3-Layer Detection System:
 * 1. PRIMARY: Browser Transformer Engine (ML-based emotion detection via WebGPU/WASM)
 * 2. FALLBACK: Symbolic keyword matching
 * 3. INFERENCE: Rubrics-based emotion inference
 */

import { useBrowserTransformerEngine } from './useBrowserTransformerEngine';
import { RubricAssessment } from './useEvAI56Rubrics';
import { isValidEmotion, normalizeEmotion, VALID_EMOTIONS } from '../utils/seedValidator';

export function useEmotionDetector() {
  const { detectEmotionInBrowser, isProcessing } = useBrowserTransformerEngine();

  /**
   * 3-Layer Neurosymbolic Emotion Detection
   * @param content User message text
   * @param assessments Rubrics assessments for inference
   * @returns Array of detected emotions (max 4)
   */
  const detectAllEmotions = async (
    content: string, 
    assessments: RubricAssessment[] = []
  ): Promise<string[]> => {
    const detectedEmotions: Set<string> = new Set();
    
    // ═══════════════════════════════════════════════════════════
    // LAYER 1: BROWSER TRANSFORMER ENGINE (PRIMARY)
    // ═══════════════════════════════════════════════════════════
    try {
      console.log('🧠 Layer 1: Invoking Browser Transformer Engine...');
      const browserResult = await detectEmotionInBrowser(content, 'nl');
      
      if (browserResult?.result?.emotion) {
        const mlEmotion = browserResult.result.emotion;
        const normalized = normalizeEmotion(mlEmotion);
        
        if (normalized && isValidEmotion(normalized)) {
          detectedEmotions.add(normalized);
          console.log(`✅ ML detected: ${normalized} (confidence: ${Math.round(browserResult.result.confidence * 100)}%, device: ${browserResult.meta.device})`);
        } else {
          console.warn(`⚠️ ML returned invalid emotion: "${mlEmotion}"`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Browser Transformer Engine failed, falling back to symbolic:', error);
    }

    // ═══════════════════════════════════════════════════════════
    // LAYER 2: SYMBOLIC KEYWORD MATCHING (FALLBACK)
    // ═══════════════════════════════════════════════════════════
    console.log('🔍 Layer 2: Symbolic keyword matching...');
    const lowerContent = content.toLowerCase();
    
    const keywordMap: Record<string, string[]> = {
      'angst': ['bang', 'angst', 'angstig', 'bezorgd', 'nerveus'],
      'verdriet': ['verdriet', 'huil', 'triest', 'verdrietig', 'rouw'],
      'woede': ['boos', 'woede', 'kwaad', 'geïrriteerd', 'gefrustreerd'],
      'stress': ['stress', 'druk', 'gespannen', 'overweldigd', 'hectisch'],
      'eenzaamheid': ['eenzaam', 'alleen', 'verlaten', 'geïsoleerd'],
      'onzekerheid': ['onzeker', 'twijfel', 'geen idee', 'verward', 'weet niet'],
      'blijdschap': ['blij', 'gelukkig', 'vrolijk', 'opgewekt', 'tevreden'],
      'vreugde': ['vreugde', 'opgetogen', 'enthousiast', 'uitgelaten'],
      'rust': ['rustig', 'kalm', 'ontspannen', 'vredig', 'sereen'],
      'opluchting': ['opgelucht', 'opluchting', 'gerust'],
      'teleurstelling': ['teleurgesteld', 'teleurstelling', 'ontgoocheld'],
      'schaamte': ['schaam', 'beschaamd', 'genant', 'gene'],
      'schuld': ['schuld', 'schuldig', 'spijt'],
      'jaloezie': ['jaloers', 'jaloezie', 'afgunstig'],
      'frustratie': ['gefrustreerd', 'frustratie', 'irritant'],
      'verwarring': ['verward', 'verwarring', 'niet begrijpen'],
      'hoop': ['hoop', 'hoopvol', 'optimistisch'],
      'nieuwsgierigheid': ['nieuwsgierig', 'benieuwd', 'geïnteresseerd'],
      'verbazing': ['verbaasd', 'verbazing', 'verrast', 'verrassend'],
    };

    for (const [emotion, keywords] of Object.entries(keywordMap)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        detectedEmotions.add(emotion);
        console.log(`✅ Symbolic matched: ${emotion}`);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // LAYER 3: RUBRICS-BASED INFERENCE
    // ═══════════════════════════════════════════════════════════
    if (assessments && assessments.length > 0) {
      console.log('🎯 Layer 3: Rubrics-based emotion inference...');
      
      for (const assessment of assessments) {
        // High risk scores suggest negative emotions
        if (assessment.riskScore > 0.7) {
          if (assessment.triggers.some(t => t.toLowerCase().includes('suïc') || t.toLowerCase().includes('dood'))) {
            detectedEmotions.add('verdriet');
            detectedEmotions.add('angst');
            console.log('✅ Rubrics inferred: verdriet + angst (high suicide risk)');
          } else if (assessment.triggers.some(t => t.toLowerCase().includes('geweld') || t.toLowerCase().includes('agressie'))) {
            detectedEmotions.add('woede');
            console.log('✅ Rubrics inferred: woede (violence indicators)');
          } else {
            detectedEmotions.add('stress');
            console.log('✅ Rubrics inferred: stress (high risk score)');
          }
        }
        
        // Protective factors suggest positive emotions
        if (assessment.protectiveScore > 0.6) {
          detectedEmotions.add('hoop');
          console.log('✅ Rubrics inferred: hoop (high protective score)');
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // FINAL: DEFAULT FALLBACK
    // ═══════════════════════════════════════════════════════════
    if (detectedEmotions.size === 0) {
      console.log('⚠️ No emotions detected, using default: onzekerheid');
      detectedEmotions.add('onzekerheid');
    }

    const finalEmotions = Array.from(detectedEmotions).slice(0, 4);
    console.log(`🎭 Final detected emotions (${finalEmotions.length}):`, finalEmotions);
    
    return finalEmotions;
  };

  return { 
    detectAllEmotions,
    isProcessing // Expose processing state for UI feedback
  };
}

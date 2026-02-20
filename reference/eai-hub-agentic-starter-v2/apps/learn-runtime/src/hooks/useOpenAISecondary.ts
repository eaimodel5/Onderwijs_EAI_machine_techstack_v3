import { supabase } from '@/integrations/supabase/client';

export interface StrategicBriefing {
  goal: string;
  context: string;
  keyPoints: string[];
  priority?: 'low' | 'medium' | 'high';
  rubricInsights?: {
    riskScore: number;
    protectiveScore: number;
    dominantPattern: string;
    triggers: string[];
  };
}

/**
 * Lightweight Strategic Briefing Generator
 * Uses gpt-4o-mini for cost-effective strategic analysis
 * Only called conditionally (high risk, low confidence, or early conversation)
 */
export async function createStrategicBriefing(
  userInput: string,
  rubricResult?: {
    overallRisk: number;
    overallProtective: number;
    dominantPattern: string;
    assessments: Array<{ triggers: string[] }>;
  },
  conversationHistory?: any[]
): Promise<StrategicBriefing> {
  console.log('🎯 Creating Strategic Briefing (lightweight)...');
  console.log('   Risk score:', rubricResult?.overallRisk);
  console.log('   Protective score:', rubricResult?.overallProtective);
  console.log('   Dominant pattern:', rubricResult?.dominantPattern);

  try {
    // Construct lightweight prompt for strategic direction
    const recentHistory = (conversationHistory || [])
      .slice(-4)
      .map(h => `${h.role}: ${h.content}`)
      .join('\n');

    const allTriggers = rubricResult?.assessments
      ?.flatMap(a => a.triggers)
      .slice(0, 10) || [];

    const prompt = `Analyseer deze emotionele situatie en geef strategische richting.

Gebruiker: "${userInput}"

${rubricResult ? `
RUBRICS ANALYSE:
- Risico: ${rubricResult.overallRisk}/100
- Bescherming: ${rubricResult.overallProtective}/100  
- Patroon: ${rubricResult.dominantPattern}
- Triggers: ${allTriggers.join(', ')}
` : ''}

${recentHistory ? `CONVERSATIE CONTEXT:\n${recentHistory}` : ''}

Geef een beknopte strategische briefing (max 100 woorden) met:
1. Primair doel van het gesprek
2. Contextuele factoren
3. 2-3 kernpunten voor de AI assistent

Antwoord in JSON:
{
  "goal": "hoofddoel",
  "context": "situatiecontext", 
  "keyPoints": ["punt1", "punt2", "punt3"],
  "priority": "low|medium|high"
}`;

    const { data, error } = await supabase.functions.invoke('evai-core', {
      body: {
        operation: 'chat',
        model: 'gpt-4o-mini', // Lightweight model for briefing
        messages: [
          {
            role: 'system',
            content: 'Je bent een therapeutische strategieadviseur. Geef beknopte, actiegerichte briefings.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 250,
        response_format: { type: 'json_object' }
      }
    });

    if (error) {
      console.error('❌ Strategic briefing error:', error);
      throw error;
    }

    const payload: any = data;
    if (!payload?.ok) {
      throw new Error(payload?.error || 'Briefing generation failed');
    }

    const content = payload.content as string;
    const parsed = JSON.parse(content);

    const briefing: StrategicBriefing = {
      goal: parsed.goal || 'Emotionele ondersteuning bieden',
      context: parsed.context || userInput.slice(0, 100),
      keyPoints: parsed.keyPoints || ['Valideer emoties', 'Bied veilige ruimte'],
      priority: parsed.priority || 'medium',
      rubricInsights: rubricResult ? {
        riskScore: rubricResult.overallRisk,
        protectiveScore: rubricResult.overallProtective,
        dominantPattern: rubricResult.dominantPattern,
        triggers: allTriggers
      } : undefined
    };

    console.log('✅ Strategic briefing created:', briefing.goal);
    return briefing;

  } catch (error) {
    console.error('🔴 Strategic briefing failed:', error);
    // Return fallback briefing
    return {
      goal: 'Emotionele ondersteuning bieden',
      context: userInput.slice(0, 100),
      keyPoints: [
        'Valideer emoties authentiek',
        'Stel verdiepende vragen',
        'Bied concrete handvatten bij vastlopen'
      ],
      priority: 'medium',
      rubricInsights: rubricResult ? {
        riskScore: rubricResult.overallRisk,
        protectiveScore: rubricResult.overallProtective,
        dominantPattern: rubricResult.dominantPattern,
        triggers: rubricResult.assessments?.flatMap(a => a.triggers).slice(0, 10) || []
      } : undefined
    };
  }
}

// LLM Response Generator with v20 EAA constraints + NGBSE Bias Check
// This module generates contextual responses using OpenAI with ethical constraints

interface LLMGenerationRequest {
  input: string;
  emotion: string;
  allowedInterventions: string[];
  eaaProfile: {
    ownership: number;
    autonomy: number;
    agency: number;
  };
  conversationHistory: Array<{ role: string; content: string }>;
}

interface LLMGenerationResponse {
  response: string;
  model: string;
  reasoning: string;
}

export async function generateLLMResponse(
  req: LLMGenerationRequest,
  openaiApiKey: string
): Promise<LLMGenerationResponse> {
  const { input, emotion, allowedInterventions, eaaProfile, conversationHistory } = req;
  
  // Build system prompt with EAA constraints
  const systemPrompt = buildSystemPrompt(emotion, allowedInterventions, eaaProfile);
  
  // Build conversation context
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-6).map(h => ({
      role: h.role,
      content: h.content
    })),
    { role: 'user', content: input }
  ];
  
  console.log('🤖 LLM Generation:', {
    emotion,
    agency: eaaProfile.agency.toFixed(2),
    interventions: allowedInterventions.length,
    historyLength: conversationHistory.length
  });
  
  // Call OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 200
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  const generatedText = data.choices[0]?.message?.content || '';
  
  if (!generatedText) {
    throw new Error('Empty response from OpenAI');
  }
  
  return {
    response: generatedText,
    model: 'gpt-4o-mini',
    reasoning: `Generated with agency=${eaaProfile.agency.toFixed(2)}, interventions=${allowedInterventions.join(',')}`
  };
}

export function buildSystemPrompt(
  emotion: string,
  allowedInterventions: string[],
  eaaProfile: { ownership: number; autonomy: number; agency: number },
  seedGuidance?: string,
  userInput?: string,
  conversationHistory?: Array<{ role: string; content: string }>
): string {
  // BESTE VRIEND MODUS - korte, echte responses
  let prompt = `Je bent de beste vriend van de gebruiker. Reageer EXACT zoals een goede vriend zou appen.

REGELS (STRICT):
- MAX 1-2 zinnen. Nooit langer.
- Praat normaal, niet als therapeut
- Geen vragen tenzij echt relevant
- Match hun energie en vibe

VERBODEN (gebruik NOOIT):
❌ "Het is begrijpelijk dat..."
❌ "Veel mensen ervaren..."
❌ "Ik hoor dat je..."
❌ "Dat moet moeilijk zijn..."
❌ "Neem gerust de tijd..."
❌ "Het is oké om..."
❌ "Ik begrijp dat..."
❌ Lange uitleg of advies

GOEDE VOORBEELDEN:
✅ "Damn, balen man" (bij frustratie)
✅ "Nice! Vertel!" (bij goed nieuws)
✅ "Ah shit, wat is er gebeurd?" (bij verdriet)
✅ "Haha lekker toch" (bij iets leuks)
✅ "Oef, heftig" (bij zwaar nieuws)

De persoon voelt zich: ${emotion}
`;

  // Korte context hint (geen therapeutische opdrachten!)
  if (seedGuidance && !(/^(hi|hallo|hey|hoi)/i.test(userInput || ''))) {
    const hint = seedGuidance.length > 50 ? seedGuidance.substring(0, 50) + '...' : seedGuidance;
    prompt += `\nInspiratie: ${hint}`;
  }

  prompt += `

Wees kort. Wees echt. Max 1-2 zinnen.`;
  
  return prompt;
}

export async function handleBiasCheck(userInput: string, aiResponse: string): Promise<any> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.error('❌ OPENAI_API_KEY not configured for bias check');
    return {
      biasReport: {
        detected: false,
        types: [],
        severity: 'low' as const,
        description: 'Bias check unavailable - API key missing',
        confidence: 0.0,
      },
      fallbackUsed: true,
    };
  }

  const systemPrompt = `Je bent een expert in het detecteren van bias in AI-gegenereerde teksten.
Analyseer de gegeven AI-response op de volgende types bias:
- Gender bias (stereotypering van mannen/vrouwen)
- Culturele bias (aannames over cultuur/normen)
- Leeftijds bias (aannames over leeftijd)
- Socio-economische bias (aannames over status)

Retourneer ALLEEN een JSON object met dit exacte formaat:
{
  "detected": boolean,
  "types": ["gender", "cultural", etc.],
  "severity": "low" | "medium" | "high" | "critical",
  "description": "korte beschrijving van gedetecteerde bias",
  "confidence": number (0.0-1.0)
}`;

  const userPrompt = `User Input: "${userInput}"
AI Response: "${aiResponse}"

Analyseer deze response op bias. Wees kritisch maar realistisch.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';

    let biasReport;
    try {
      biasReport = JSON.parse(content);
    } catch {
      biasReport = {
        detected: false,
        types: [],
        severity: 'low',
        description: 'Parse error',
        confidence: 0,
      };
    }

    return { biasReport, fallbackUsed: false };
  } catch (error) {
    console.error('🔴 Bias check error:', error);
    throw error; // Re-throw to trigger heuristic fallback
  }
}

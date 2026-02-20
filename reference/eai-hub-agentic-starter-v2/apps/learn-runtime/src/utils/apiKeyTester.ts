
import { OPENAI_MODEL } from '../openaiConfig';

export interface ApiKeyTestResult {
  isValid: boolean;
  error?: string;
  model?: string;
  responseTime?: number;
  details?: any;
}

export async function testOpenAIApiKey(apiKey: string): Promise<ApiKeyTestResult> {
  if (!apiKey?.trim()) {
    return {
      isValid: false,
      error: 'API key is empty or undefined'
    };
  }

  // Basic format validation
  if (!apiKey.startsWith('sk-')) {
    return {
      isValid: false,
      error: 'API key does not start with "sk-" (invalid format)'
    };
  }

  console.log('🧪 Testing OpenAI API Key format and validity...');
  const startTime = Date.now();

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Key test failed:', response.status, errorData);
      
      return {
        isValid: false,
        error: `HTTP ${response.status}: ${errorData?.error?.message || response.statusText}`,
        responseTime,
        details: errorData
      };
    }

    const data = await response.json();
    console.log('✅ API Key is valid, models available:', data.data?.length || 0);
    
    return {
      isValid: true,
      model: OPENAI_MODEL,
      responseTime,
      details: data
    };

  } catch (error) {
    console.error('🔴 Network error during API key test:', error);
    return {
      isValid: false,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime
    };
  }
}

export async function testOpenAIChat(apiKey: string): Promise<ApiKeyTestResult> {
  console.log('🧪 Testing OpenAI Chat Completion with updated model...');
  const startTime = Date.now();

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "API test successful" if you receive this message.' }
        ],
        max_tokens: 10,
        temperature: 0
      })
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Chat completion test failed:', response.status, errorData);
      
      return {
        isValid: false,
        error: `Chat API Error: ${errorData?.error?.message || response.statusText}`,
        responseTime,
        details: errorData
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('✅ Chat completion successful:', content);
    
    return {
      isValid: true,
      model: OPENAI_MODEL,
      responseTime,
      details: { response: content, usage: data.usage }
    };

  } catch (error) {
    console.error('🔴 Chat completion test error:', error);
    return {
      isValid: false,
      error: `Chat test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime
    };
  }
}

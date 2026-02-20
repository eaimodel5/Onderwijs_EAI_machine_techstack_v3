import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleBiasCheck, buildSystemPrompt } from "./llm-generator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_PRIMARY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_SAFETY = Deno.env.get("OPENAI_API_KEY_SAFETY");
const VECTOR_API_KEY = Deno.env.get("VECTOR_API_KEY");

// Rate limiting: 60 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientId);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientId = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimit = checkRateLimit(clientId);

  if (!rateLimit.allowed) {
    console.warn(`⚠️ Rate limit exceeded for client: ${clientId}`);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: 60 
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Limit": RATE_LIMIT.toString(),
          "X-RateLimit-Remaining": "0",
          "Retry-After": "60"
        } 
      }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { operation } = body || {};

    console.log(`🧠 evai-core: operation=${operation}`);
    console.log(`🔑 Secrets status: OPENAI=${!!OPENAI_PRIMARY}, SAFETY=${!!OPENAI_SAFETY}, VECTOR=${!!VECTOR_API_KEY}`);

    // OPERATION: chat
    if (operation === "chat") {
      return await handleChat(body);
    }

    // OPERATION: embedding
    if (operation === "embedding") {
      return await handleEmbedding(body);
    }

    // OPERATION: batch-embed (NEW - FASE 2)
    if (operation === "batch-embed") {
      return await handleBatchEmbed(body);
    }

    // OPERATION: safety
    if (operation === "safety") {
      return await handleSafety(body);
    }

    // OPERATION: generate-response (NEW - Seed + LLM Fusion)
    if (operation === "generate-response") {
      return await handleGenerateResponse(body);
    }

    // OPERATION: bias-check (NGBSE)
    if (operation === "bias-check") {
      const { userInput, aiResponse } = body;
      const result = await handleBiasCheck(userInput, aiResponse);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: false, error: "Unknown operation. Use: chat, embedding, batch-embed, safety, generate-response, or bias-check" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("🔴 evai-core error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleChat(body: any) {
  console.log(`🔑 Chat: OPENAI_PRIMARY exists? ${!!OPENAI_PRIMARY}`);
  console.log(`🔑 Chat: OPENAI_PRIMARY length: ${OPENAI_PRIMARY?.length || 0}`);
  
  if (!OPENAI_PRIMARY || OPENAI_PRIMARY.trim() === '') {
    console.error("🔴 OPENAI_API_KEY not configured or empty");
    return new Response(
      JSON.stringify({ ok: false, error: "OPENAI_API_KEY not configured or empty" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const {
    messages,
    prompt,
    model = "gpt-4o-mini",
    temperature = 0.5,
    max_tokens = 400,
    response_format,
  } = body || {};

  console.log(`🔑 Chat: model=${model}`);

  const finalMessages = Array.isArray(messages) && messages.length
    ? messages
    : [{ role: "user", content: prompt || "Say OK" }];

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_PRIMARY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: finalMessages,
      temperature,
      max_tokens,
      ...(response_format ? { response_format } : {}),
    }),
  });

  const status = resp.status;
  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const errMsg = data?.error?.message || resp.statusText || "OpenAI chat error";
    console.error('🔴 OpenAI chat error:', errMsg, 'status:', status);
    return new Response(
      JSON.stringify({ ok: false, status, error: errMsg }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const content = data?.choices?.[0]?.message?.content ?? "";
  return new Response(
    JSON.stringify({
      ok: true,
      model: data?.model || model,
      content,
      usage: data?.usage,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleEmbedding(body: any) {
  const keyToUse = VECTOR_API_KEY || OPENAI_PRIMARY;
  if (!keyToUse) {
    return new Response(
      JSON.stringify({ ok: false, error: "No embeddings API key configured" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const {
    input,
    model = "text-embedding-3-small",
  } = body || {};

  if (!input || (typeof input !== "string" && !Array.isArray(input))) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid input for embeddings" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log(`🔑 Embedding: model=${model}`);

  const normalizedInput = typeof input === "string" ? input : input;
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${keyToUse}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: normalizedInput,
    }),
  });

  const status = resp.status;
  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const errMsg = data?.error?.message || resp.statusText || "OpenAI embedding error";
    console.error('🔴 OpenAI embedding error:', errMsg, 'status:', status);
    return new Response(
      JSON.stringify({ ok: false, status, error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const embeddings = Array.isArray(data?.data)
    ? data.data.map((d: any) => d.embedding)
    : [];

  return new Response(
    JSON.stringify({
      ok: true,
      model: data?.model || model,
      embeddings,
      embedding: embeddings[0] || null,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleSafety(body: any) {
  const keyToUse = OPENAI_SAFETY || OPENAI_PRIMARY;
  if (!keyToUse) {
    return new Response(
      JSON.stringify({ ok: false, error: "No safety API key configured" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { text, model = "gpt-4o-mini" } = body || {};

  if (!text || typeof text !== "string") {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid text for safety check" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log(`🔑 Safety: model=${model}`);

  const messages = [
    {
      role: "system",
      content:
        "You are a content safety analyzer. Respond ONLY with compact JSON using this schema: {decision:'allow'|'review'|'block', score:number (0-1), severity:'low'|'medium'|'high', flags:string[], reasons:string[], details:string}. Never include additional keys or text. Pick decision='block' for unsafe/harmful content, 'review' for borderline or policy-sensitive content, otherwise 'allow'. Ensure score reflects likelihood of being safe (0=unsafe, 1=clearly safe).",
    },
    {
      role: "user",
      content: `Analyze this text for safety concerns and follow the schema strictly. Text:"${text}"`,
    },
  ];

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${keyToUse}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 150,
      response_format: { type: "json_object" },
    }),
  });

  const status = resp.status;
  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const errMsg = data?.error?.message || resp.statusText || "OpenAI safety error";
    console.error('🔴 OpenAI safety error:', errMsg, 'status:', status);
    return new Response(
      JSON.stringify({ ok: false, status, error: errMsg }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const content = data?.choices?.[0]?.message?.content ?? "{}";
  let safetyResult: Record<string, unknown>;
  try {
    safetyResult = JSON.parse(content);
  } catch {
    safetyResult = { decision: "review", score: 0.5, severity: "medium", flags: ["parse_error"], reasons: ["Unable to parse model response"], details: "Model response parse failure" };
  }

  const normalizeDecision = (value: unknown, severity: string, safe?: boolean): "allow" | "review" | "block" => {
    if (value === "allow" || value === "review" || value === "block") {
      return value;
    }
    if (typeof safe === "boolean") {
      return safe ? "allow" : "block";
    }
    switch (severity) {
      case "high":
        return "block";
      case "medium":
        return "review";
      default:
        return "allow";
    }
  };

  const rawSeverity = typeof safetyResult?.severity === "string" ? safetyResult.severity.toLowerCase() : undefined;
  const severity = rawSeverity === "medium" || rawSeverity === "high" ? rawSeverity : "low";
  const decision = normalizeDecision(safetyResult?.decision, severity, safetyResult?.safe as boolean | undefined);
  const numericScore = typeof safetyResult?.score === "number" ? safetyResult.score : undefined;
  const derivedScore = typeof numericScore === "number" && Number.isFinite(numericScore)
    ? Math.min(Math.max(numericScore, 0), 1)
    : decision === "block"
      ? 0
      : decision === "review"
        ? 0.5
        : 0.95;
  const flags = Array.isArray(safetyResult?.flags)
    ? safetyResult.flags.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const reasons = Array.isArray(safetyResult?.reasons)
    ? safetyResult.reasons.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const details = typeof safetyResult?.details === "string" && safetyResult.details.trim().length > 0
    ? safetyResult.details.trim()
    : typeof safetyResult?.reason === "string"
      ? String(safetyResult.reason)
      : decision === "block"
        ? "Content rejected by safety policy"
        : decision === "review"
          ? "Content requires additional review"
          : "No safety concerns detected";

  return new Response(
    JSON.stringify({
      ok: decision !== "block",
      decision,
      score: derivedScore,
      severity,
      flags,
      reasons,
      details,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleBatchEmbed(body: any) {
  const keyToUse = VECTOR_API_KEY || OPENAI_PRIMARY;
  if (!keyToUse) {
    return new Response(
      JSON.stringify({ ok: false, error: "No embeddings API key configured" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { items = [], batchSize = 10 } = body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid items array for batch embedding" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log(`🔄 Batch embed: Processing ${items.length} items in batches of ${batchSize}`);

  const results: any[] = [];
  const errors: any[] = [];
  
  // Process in batches to avoid rate limits
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`);
    
    for (const item of batch) {
      const { id, text } = item;
      
      if (!id || !text) {
        errors.push({ id: id || 'unknown', error: 'Missing id or text' });
        continue;
      }

      try {
        const resp = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${keyToUse}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: text.substring(0, 8000),
          }),
        });

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok) {
          const errMsg = data?.error?.message || resp.statusText || "OpenAI embedding error";
          console.error(`❌ Batch embed error for item ${id}:`, errMsg);
          errors.push({ id, error: errMsg, status: resp.status });
          continue;
        }

        const embedding = data?.data?.[0]?.embedding;
        if (!embedding) {
          errors.push({ id, error: 'No embedding returned' });
          continue;
        }

        results.push({ id, embedding, success: true });
        
      } catch (error) {
        console.error(`❌ Batch embed exception for item ${id}:`, error);
        errors.push({ id, error: (error as Error).message });
      }
    }
    
    // Rate limiting: small delay between batches
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  const successCount = results.length;
  const errorCount = errors.length;
  const totalProcessed = successCount + errorCount;

  console.log(`✅ Batch embed complete: ${successCount}/${totalProcessed} successful, ${errorCount} errors`);

  return new Response(
    JSON.stringify({
      ok: true,
      results,
      errors,
      summary: {
        total: items.length,
        processed: totalProcessed,
        successful: successCount,
        failed: errorCount,
        successRate: (successCount / totalProcessed * 100).toFixed(2) + '%'
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGenerateResponse(body: any) {
  if (!OPENAI_PRIMARY) {
    return new Response(
      JSON.stringify({ ok: false, error: "OPENAI_API_KEY not configured" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const {
    seedGuidance,
    userInput,
    conversationHistory = [],
    emotion,
    eaaProfile,
    allowedInterventions = [],
    tdMatrix,
    regisseurBriefing,
    eaiRules,
    rubricsAssessment,
    fusionMetadata,
    safetyCheck
  } = body || {};

  if (!seedGuidance || !userInput || !emotion || !eaaProfile) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing required fields for generate-response" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log('🤖 LLM Generation (v20):', {
    emotion,
    agency: eaaProfile.agency.toFixed(2),
    tdFlag: tdMatrix?.flag || 'unknown',
    regisseurAdvice: regisseurBriefing?.advice || 'none',
    rubricsRisk: rubricsAssessment?.overallRisk || 0,
    fusionStrategy: fusionMetadata?.strategy || 'unknown',
    interventions: allowedInterventions.length,
    historyLength: conversationHistory.length
  });

  // Build natural system prompt (v20 metadata used internally, not exposed to LLM)
  const systemPrompt = buildSystemPrompt(
    emotion,
    allowedInterventions,
    eaaProfile,
    seedGuidance,
    userInput,
    conversationHistory
  );

  // Build conversation messages
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-6).map((h: any) => ({
      role: h.role,
      content: h.content
    })),
    { role: 'user', content: userInput }
  ];

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_PRIMARY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.8,
        max_tokens: 60
      })
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('🔴 OpenAI API error:', resp.status, errorText);
      return new Response(
        JSON.stringify({ ok: false, error: `OpenAI API error: ${resp.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    const generatedText = data.choices[0]?.message?.content || '';

    if (!generatedText) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Empty response from OpenAI' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        response: generatedText,
        model: 'gpt-4o-mini',
        reasoning: `Generated with agency=${eaaProfile.agency.toFixed(2)}, interventions=${allowedInterventions.join(',')}`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('🔴 Generate response error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// ✅ buildSystemPrompt is now imported from llm-generator.ts
// v20 metadata (TD-Matrix, Regisseur, EAI, Rubrics) is used for INTERNAL decision-making
// but NOT exposed to the LLM to keep responses natural

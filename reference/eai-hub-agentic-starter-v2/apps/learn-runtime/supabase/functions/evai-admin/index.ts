
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// Rate limiting for admin: 30 requests per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 1000;

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

  // Rate limiting
  const clientId = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimit = checkRateLimit(clientId);

  if (!rateLimit.allowed) {
    console.warn(`⚠️ Rate limit exceeded for admin client: ${clientId}`);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: "Rate limit exceeded",
        retryAfter: 60 
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Retry-After": "60"
        } 
      }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { operation } = body || {};

    console.log(`🔐 evai-admin: operation=${operation}`);

    // OPERATION: auth
    if (operation === "auth") {
      return handleAuth(body);
    }

    // OPERATION: test-openai-key
    if (operation === "test-openai-key") {
      return await handleTestOpenAIKey(body);
    }

    // OPERATION: consolidate-knowledge
    if (operation === "consolidate-knowledge") {
      return await handleConsolidateKnowledge(body);
    }

    return new Response(
      JSON.stringify({ ok: false, error: "Unknown operation. Use: auth, test-openai-key, or consolidate-knowledge" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("🔴 evai-admin error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function handleAuth(body: any) {
  const { password } = body || {};
  
  if (!ADMIN_PASSWORD) {
    return new Response(
      JSON.stringify({ ok: false, error: "ADMIN_PASSWORD not configured" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const isValid = password === ADMIN_PASSWORD;
  console.log(`🔐 Admin auth attempt: ${isValid ? "SUCCESS" : "FAILED"}`);

  return new Response(
    JSON.stringify({ ok: true, authenticated: isValid }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleTestOpenAIKey(body: any) {
  const incomingKey = typeof body?.apiKey === "string" ? body.apiKey : undefined;
  const apiKey = !incomingKey || incomingKey === "server-key-test" ? OPENAI_API_KEY : incomingKey;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ ok: true, isValid: false, error: "Server OpenAI API key not configured" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const maskedKey = `${apiKey.substring(0, 4)}...`;
  console.log(`🧪 Testing OpenAI key: ${maskedKey}`);

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 5,
      }),
    });

    const status = resp.status;
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      const errMsg = data?.error?.message || resp.statusText || "Unknown error";
      return new Response(
        JSON.stringify({ ok: true, isValid: false, error: errMsg }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, isValid: true, model: data?.model || "gpt-4o-mini" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: true, isValid: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * Consolidate Knowledge Handler
 * Triggers database cleanup and unified knowledge consolidation
 */
async function handleConsolidateKnowledge(body: any) {
  console.log("🧹 Knowledge consolidation triggered");
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Supabase credentials not configured");
    }
    
    // Import Supabase client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    // Call cleanup function
    const { data: cleanupResult, error: cleanupError } = await supabase
      .rpc("cleanup_invalid_emotions");
    
    if (cleanupError) {
      console.error("❌ Cleanup failed:", cleanupError);
      throw cleanupError;
    }
    
    console.log("✅ Cleanup completed:", cleanupResult);
    
    // Call consolidate function
    const { error: consolidateError } = await supabase
      .rpc("consolidate_knowledge");
    
    if (consolidateError) {
      console.error("❌ Consolidation failed:", consolidateError);
      throw consolidateError;
    }
    
    console.log("✅ Consolidation completed");
    
    return new Response(
      JSON.stringify({ 
        ok: true,
        success: true,
        message: "Knowledge consolidation completed",
        cleanup: cleanupResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("❌ Knowledge consolidation error:", error);
    return new Response(
      JSON.stringify({ 
        ok: false,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

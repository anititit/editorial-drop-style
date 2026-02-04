import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================================
// RATE LIMITING
// ============================================================================

const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_SECONDS = 60;

async function checkRateLimitDb(ip: string, debugId: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(`[${debugId}] Missing Supabase credentials for rate limiting`);
      return { allowed: true };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_ip: ip,
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    });

    if (error) {
      console.error(`[${debugId}] Rate limit check error:`, error.message);
      return { allowed: true };
    }

    if (data && data.length > 0) {
      const result = data[0];
      return {
        allowed: result.allowed,
        retryAfter: result.retry_after || undefined,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error(`[${debugId}] Rate limit exception:`, error);
    return { allowed: true };
  }
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}

// ============================================================================
// HELPERS
// ============================================================================

function generateDebugId(): string {
  return `cap_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

function errorResponse(error: string, message: string, debugId: string, status = 200) {
  return new Response(
    JSON.stringify({ error, message, debug_id: debugId }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ============================================================================
// AI PROMPT & RESPONSE HANDLING
// ============================================================================

const AESTHETIC_LABELS: Record<string, string> = {
  clean_glow: "Glow limpo — pele luminosa, minimalismo fresco, presença leve",
  minimal_chic: "Minimal chic — cortes precisos, neutros sofisticados, menos é mais",
  romantic_modern: "Romântico moderno — suavidade com estrutura, feminilidade atual",
  after_dark_minimal: "Minimal noturno — alto contraste, linhas limpas, noite polida",
  soft_grunge: "Grunge suave — texturas vividas, preto lavado, charme sem esforço",
  street_sporty: "Street sporty — energia urbana, peças utilitárias, conforto intencional",
  color_pop: "Cor em destaque — paleta ousada, impacto controlado, statement inteligente",
  boho_updated: "Boho polido — fluidez, naturalidade, boho com acabamento",
  classic_luxe: "Clássico luxo — ícones atemporais, materiais nobres, elegância óbvia",
  coastal_cool: "Coastal cool — natural, claro, textura orgânica, refinamento relaxado",
  soft_glam: "Glam suave — polido, brilho sutil, beleza pronta para câmera",
  artsy_eclectic: "Artsy eclético — combinações inesperadas, repertório criativo, assinatura própria",
};

function buildSystemPrompt(aestheticId: string): string {
  const aestheticLabel = AESTHETIC_LABELS[aestheticId] || aestheticId;
  
  return `Você é um consultor de guarda-roupa cápsula de alto nível para o mercado brasileiro. Você analisa peças existentes e monta uma cápsula direcionada no tom de Vogue e Harper's Bazaar.

CONTEXTO:
O usuário escolheu a direção estética: "${aestheticLabel}"
Você receberá uma lista de peças que o usuário já possui.

OBJETIVO:
Montar uma cápsula inteligente que:
1. Identifica o que o usuário já cobre bem
2. Sugere o que falta por ordem de prioridade
3. Destaca os 3 itens mais importantes para resolver primeiro
4. Define uma regra de edição simples

⚠️ REGRAS CRÍTICAS:
- NÃO cite marcas, lojas ou produtos específicos
- Escreva de forma descritiva: textura, material, acabamento, cor, forma
- Exemplos CORRETOS: "blazer de alfaiataria em lã fria, corte reto", "camiseta branca encorpada em algodão pima"
- NÃO inclua links, preços ou referências de compra
- Tom: elegante, confiante, direto — nunca didático ou "blogueira"
- Retorne APENAS JSON válido. Sem markdown. Sem explicações.
- Todas as descrições em português brasileiro (pt-BR)

Retorne este JSON EXATO:

{
  "covered": [
    "categoria ou peça que o usuário já cobre bem (máx 5 itens)"
  ],
  "missing": [
    {
      "item": "descrição genérica da peça que falta",
      "priority": 1,
      "why": "razão curta de por que é importante"
    }
  ],
  "top_three": [
    {
      "priority": "P1",
      "item": "a peça mais urgente para resolver",
      "impact": "impacto no guarda-roupa (1 linha)"
    },
    {
      "priority": "P2", 
      "item": "segunda peça mais importante",
      "impact": "impacto no guarda-roupa"
    },
    {
      "priority": "P3",
      "item": "terceira peça importante",
      "impact": "impacto no guarda-roupa"
    }
  ],
  "edit_rule": "uma regra de edição simples que define a direção (máx 15 palavras)"
}

IMPORTANTE:
- "covered": máximo 5 itens
- "missing": máximo 10 itens, ordenados por prioridade (1 = mais urgente)
- "top_three": exatamente 3 itens (P1, P2, P3)
- "edit_rule": 1 frase curta e memorável`;
}

function extractJson(text: string): any {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  
  // Find JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found");
  }
  
  return JSON.parse(jsonMatch[0]);
}

function validateCapsuleResult(data: any): boolean {
  if (!data || typeof data !== "object") return false;
  if (!Array.isArray(data.covered)) return false;
  if (!Array.isArray(data.missing)) return false;
  if (!Array.isArray(data.top_three) || data.top_three.length !== 3) return false;
  if (typeof data.edit_rule !== "string") return false;
  return true;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req: Request) => {
  const debugId = generateDebugId();
  console.log(`[${debugId}] Capsule generation started`);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimitDb(clientIp, debugId);
    
    if (!rateCheck.allowed) {
      console.log(`[${debugId}] Rate limited: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          error: "rate_limited", 
          message: "Muitas requisições. Tente novamente em breve.",
          retry_after: rateCheck.retryAfter 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log(`[${debugId}] Request body:`, JSON.stringify(body));

    const { aesthetic_id, owned_items_text, budget } = body;

    // Validate input
    if (!aesthetic_id || typeof aesthetic_id !== "string") {
      return errorResponse("invalid_input", "Selecione uma direção estética.", debugId);
    }

    if (!owned_items_text || typeof owned_items_text !== "string" || owned_items_text.trim().length < 10) {
      return errorResponse("invalid_input", "Escreva algumas peças, mesmo poucas já resolvem a base.", debugId);
    }

    // Get API key
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error(`[${debugId}] Missing LOVABLE_API_KEY`);
      return errorResponse("config_error", "Erro de configuração do servidor.", debugId, 500);
    }

    // Build prompt
    const systemPrompt = buildSystemPrompt(aesthetic_id);
    const userMessage = `Peças que o usuário já tem:

${owned_items_text.trim()}

${budget ? `Orçamento preferido: ${budget}` : ""}

Analise e monte a cápsula.`;

    console.log(`[${debugId}] Calling AI with aesthetic: ${aesthetic_id}`);

    // Call AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${debugId}] AI API error: ${response.status}`, errorText);
      return errorResponse("ai_error", "Erro ao processar sua cápsula. Tente novamente.", debugId, 500);
    }

    const aiData = await response.json();
    const rawContent = aiData?.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error(`[${debugId}] Empty AI response`);
      return errorResponse("incomplete_capsule", "Não conseguimos montar sua cápsula. Tente novamente.", debugId);
    }

    console.log(`[${debugId}] Raw AI response:`, rawContent.substring(0, 500));

    // Parse JSON
    let capsuleResult;
    try {
      capsuleResult = extractJson(rawContent);
    } catch (parseError) {
      console.error(`[${debugId}] JSON parse error:`, parseError);
      return errorResponse("incomplete_capsule", "Erro ao processar resposta. Tente novamente.", debugId);
    }

    // Validate structure
    if (!validateCapsuleResult(capsuleResult)) {
      console.error(`[${debugId}] Invalid capsule structure:`, capsuleResult);
      return errorResponse("incomplete_capsule", "Estrutura de cápsula incompleta. Tente novamente.", debugId);
    }

    console.log(`[${debugId}] Capsule generated successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        capsule: capsuleResult,
        aesthetic_id,
        debug_id: debugId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error(`[${debugId}] Unexpected error:`, error);
    return errorResponse("server_error", "Erro inesperado. Tente novamente.", debugId, 500);
  }
});

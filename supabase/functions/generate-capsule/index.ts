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
// INPUT NORMALIZATION (Brand-to-generic mapping)
// ============================================================================

const BRAND_MAPPINGS: Record<string, string> = {
  // Sneakers
  "vans": "tênis branco casual, sola reta",
  "air force": "tênis branco robusto, casual",
  "airforce": "tênis branco robusto, casual",
  "af1": "tênis branco robusto, casual",
  "converse": "tênis de lona, cano baixo",
  "all star": "tênis de lona, cano baixo",
  "allstar": "tênis de lona, cano baixo",
  "adidas samba": "tênis retrô de perfil baixo",
  "samba": "tênis retrô de perfil baixo",
  "nike": "tênis esportivo casual",
  "adidas": "tênis esportivo casual",
  "new balance": "tênis esportivo casual",
  "nb": "tênis esportivo casual",
  "puma": "tênis esportivo casual",
  "jordan": "tênis esportivo alto",
  // Fast fashion (remove brand)
  "zara": "", "shein": "", "h&m": "", "hm": "", "forever 21": "", "renner": "", 
  "c&a": "", "cea": "", "riachuelo": "", "marisa": "",
  // Beauty brands
  "sephora": "", "mac": "", "m.a.c": "", "dior": "", "chanel": "", "ysl": "", 
  "nars": "", "fenty": "", "charlotte tilbury": "", "bobbi brown": "",
  "o boticário": "", "boticário": "", "natura": "", "eudora": "", "avon": "",
  "maybelline": "", "revlon": "", "loreal": "", "l'oreal": "",
  // Luxury brands
  "gucci": "", "prada": "", "louis vuitton": "", "lv": "", "balenciaga": "",
  "bottega": "", "burberry": "", "versace": "", "valentino": "", "celine": "",
  "saint laurent": "", "hermès": "", "hermes": "", "fendi": "", "loewe": "",
  "coach": "", "michael kors": "", "kate spade": "", "tory burch": "",
  // Brazilian brands
  "arezzo": "", "schutz": "", "santa lolla": "", "anacapri": "", "farm": "",
  "animale": "", "le lis": "", "le lis blanc": "", "maria filó": "", "shoulder": "",
  "mixed": "", "bo.bô": "", "bobo": "", "osklen": "",
};

const SLANG_MAPPINGS: Record<string, string> = {
  "shorts jeans": "short de denim",
  "short jeans": "short de denim",
  "calça alfaiataria": "calça reta de alfaiataria",
  "camisa social": "camisa de botão, corte limpo",
  "blusinha": "top leve, alça fina",
  "bota cano curto": "bota de cano curto, couro liso",
  "bolsa pequena": "bolsa pequena estruturada",
  "bolsinha": "bolsa pequena estruturada",
  "cropped": "top cropped",
  "legging": "legging de lycra",
  "moletom": "moletom de algodão, corte relaxado",
  "jaqueta jeans": "jaqueta de denim",
  "sapatênis": "tênis casual de perfil baixo",
  "sapato social": "oxford de couro",
  "rasteirinha": "sandália rasteira, tiras finas",
};

const COLOR_MAPPINGS: Record<string, string> = {
  "branco": "off-white", "off white": "off-white", "creme": "off-white",
  "bege": "bege", "nude": "bege",
  "jeans claro": "denim claro", "jeans escuro": "denim escuro",
  "verde militar": "verde-oliva", "azul marinho": "azul-marinho",
  "bordô": "burgundy", "vinho": "burgundy",
};

function removeEmojis(text: string): string {
  return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/gu, '').trim();
}

function normalizeOwnedItems(text: string): string[] {
  const items = text
    .split(/[,;|\n]+/)
    .map(item => removeEmojis(item.trim()))
    .filter(item => item.length > 1);

  const normalized: string[] = [];

  for (let item of items) {
    const lowerItem = item.toLowerCase();
    
    // Check brands (longest first)
    const sortedBrands = Object.keys(BRAND_MAPPINGS).sort((a, b) => b.length - a.length);
    for (const brand of sortedBrands) {
      if (lowerItem.includes(brand)) {
        const replacement = BRAND_MAPPINGS[brand];
        if (replacement) {
          const remaining = item.replace(new RegExp(brand, 'gi'), '').trim();
          item = remaining.length > 2 ? `${replacement}, ${remaining}` : replacement;
        } else {
          item = item.replace(new RegExp(brand, 'gi'), '').trim();
        }
        break;
      }
    }

    // Apply slang normalization
    const sortedSlang = Object.keys(SLANG_MAPPINGS).sort((a, b) => b.length - a.length);
    for (const slang of sortedSlang) {
      if (item.toLowerCase().includes(slang)) {
        item = item.replace(new RegExp(slang, 'gi'), SLANG_MAPPINGS[slang]);
        break;
      }
    }

    // Normalize colors
    for (const [color, normalized_color] of Object.entries(COLOR_MAPPINGS)) {
      if (item.toLowerCase().includes(color)) {
        item = item.replace(new RegExp(color, 'gi'), normalized_color);
        break;
      }
    }

    // Cleanup
    item = item.replace(/\s+/g, ' ').replace(/,\s*,/g, ',').trim();
    if (item.length > 2) {
      normalized.push(item.charAt(0).toUpperCase() + item.slice(1));
    }
  }

  return [...new Set(normalized)];
}

// Sanitize AI output to remove any brands that slipped through
function sanitizeOutputItems(items: string[]): string[] {
  return items.map(item => {
    let sanitized = item;
    const lowerItem = item.toLowerCase();
    
    const sortedBrands = Object.keys(BRAND_MAPPINGS).sort((a, b) => b.length - a.length);
    for (const brand of sortedBrands) {
      if (lowerItem.includes(brand)) {
        const replacement = BRAND_MAPPINGS[brand];
        if (replacement) {
          sanitized = replacement;
        } else {
          sanitized = sanitized.replace(new RegExp(brand, 'gi'), '').trim();
        }
        break;
      }
    }
    
    return sanitized.replace(/\s+/g, ' ').trim();
  }).filter(item => item.length > 2);
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

function buildSystemPrompt(aestheticId: string, normalizedItems: string[]): string {
  const aestheticLabel = AESTHETIC_LABELS[aestheticId] || aestheticId;
  
  return `Você é um consultor de guarda-roupa cápsula de alto nível para o mercado brasileiro. Tom Vogue/Harper's Bazaar.

CONTEXTO:
Direção estética: "${aestheticLabel}"
Peças do usuário: ${normalizedItems.join(", ")}

OBJETIVO:
1. Identificar o que já cobre bem
2. Sugerir o que falta por prioridade
3. Destacar 3 itens mais importantes
4. Definir uma regra de edição

⚠️ REGRAS DE ESCRITA OBRIGATÓRIAS:

FORMATAÇÃO:
- Nome do item: **Bold**, sem adjetivos no título (ex: "Blazer de lã" e não "Blazer de lã versátil")
- Descrição: 2-3 frases curtas. Cada frase: 5-15 palavras.
- Use quebras de linha, não bullet points.

PALAVRAS BANIDAS (nunca use):
- "versátil" (mostre, não diga)
- "essencial" (tudo é essencial)
- "básico" (nada aqui é básico)
- "peça" (redundante)
- "adiciona" (verbo fraco)
- "funciona para" (mostre a função)

VERBOS FORTES (use estes):
- transforma, finaliza, alonga, sofistica, ancora, define, eleva

SUBSTANTIVOS PRECISOS:
- fundação, complemento, ponto final, estrutura, silhueta

ADJETIVOS RAROS:
- silencioso, discreto, fluido, preciso, intencional

RITMO:
- Varie o tamanho: Curta. Média. Curta de novo.
- Fragmentos com impacto: "A fundação."
- Estrutura paralela: "Finaliza. Sofistica. Transforma."

REGRAS CRÍTICAS:
- NUNCA cite marcas (Nike, Zara, Gucci, etc.)
- Escreva descritivo: textura, material, acabamento, cor, forma
- ZERO links, preços ou referências de compra
- Retorne APENAS JSON válido. Sem markdown.
- Português brasileiro (pt-BR)

ESTRUTURA JSON:

{
  "covered": [
    "categoria que o usuário já cobre (máx 5, SEM MARCAS)"
  ],
  "missing": [
    {
      "item": "nome bold do item (ex: Blazer de lã fria)",
      "priority": 1,
      "why": "descrição com verbos fortes, 2-3 frases curtas, ritmo variado"
    }
  ],
  "top_three": [
    {
      "priority": "P1",
      "item": "nome bold (ex: Trench coat de algodão)",
      "impact": "descrição editorial curta com verbos fortes. Fragmento. Ritmo."
    },
    {
      "priority": "P2", 
      "item": "nome bold",
      "impact": "descrição editorial curta"
    },
    {
      "priority": "P3",
      "item": "nome bold",
      "impact": "descrição editorial curta"
    }
  ],
  "edit_rule": "regra de edição simples, memorável (máx 12 palavras)"
}

EXEMPLO DE DESCRIÇÃO BOA:
"Ancora looks de transição. Silhueta alongada que sofistica qualquer composição. O ponto final."

EXEMPLO DE DESCRIÇÃO RUIM:
"É uma peça versátil e essencial que adiciona elegância e funciona para várias ocasiões."

IMPORTANTE:
- "covered": máximo 5 itens
- "missing": máximo 10 itens, ordenados por prioridade
- "top_three": exatamente 3 itens (P1, P2, P3)
- "edit_rule": 1 frase curta e memorável`;
}

function extractJson(text: string): any {
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON object found");
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

    // Normalize user input (remove brands, apply mappings)
    const normalizedItems = normalizeOwnedItems(owned_items_text);
    console.log(`[${debugId}] Normalized items:`, normalizedItems);

    if (normalizedItems.length < 2) {
      return errorResponse("insufficient_items", "Você pode citar 3 a 6 peças, mesmo básicas, para eu fechar a cápsula com precisão.", debugId);
    }

    // Get API key
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error(`[${debugId}] Missing LOVABLE_API_KEY`);
      return errorResponse("config_error", "Erro de configuração do servidor.", debugId, 500);
    }

    // Build prompt with normalized items
    const systemPrompt = buildSystemPrompt(aesthetic_id, normalizedItems);
    const userMessage = `Analise as peças normalizadas acima e monte a cápsula.`;

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

    // Sanitize output to ensure no brands slipped through
    capsuleResult.covered = sanitizeOutputItems(capsuleResult.covered);
    capsuleResult.missing = capsuleResult.missing.map((m: any) => ({
      ...m,
      item: sanitizeOutputItems([m.item])[0] || m.item,
    }));
    capsuleResult.top_three = capsuleResult.top_three.map((t: any) => ({
      ...t,
      item: sanitizeOutputItems([t.item])[0] || t.item,
    }));

    console.log(`[${debugId}] Capsule generated successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        capsule: capsuleResult,
        aesthetic_id,
        normalized_items: normalizedItems,
        debug_id: debugId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error(`[${debugId}] Unexpected error:`, error);
    return errorResponse("server_error", "Erro inesperado. Tente novamente.", debugId, 500);
  }
});

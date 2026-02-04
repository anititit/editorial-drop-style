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
  
  return `Você é um consultor de guarda-roupa cápsula de alto nível. Tom Vogue/Harper's Bazaar.

CONTEXTO:
Direção estética: "${aestheticLabel}"
Peças do usuário: ${normalizedItems.join(", ")}

OBJETIVO:
1. Identificar o que já cobre bem (max 5)
2. Sugerir AS 5 PEÇAS MAIS IMPACTANTES que faltam
3. Definir uma regra de edição

⚠️ ALGORITMO DE PRIORIDADE (para selecionar as 5 peças):

1. **Versatilidade** - Combina com mais itens que o usuário já tem
2. **Severidade da lacuna** - Categoria completamente ausente > tem alguns itens
3. **Fundação primeiro** - Calças > Tops > Sapatos > Acessórios
4. **Mix de preços** - Equilibre opções acessíveis e premium

⚠️ REGRAS DE ESCRITA:

FORMATO DAS DESCRIÇÕES:
- UMA frase por item (não 2-3)
- MÁXIMO 10 palavras por frase
- Sem explicações, só o impacto
- Verbos ativos: transforma, finaliza, alonga, sofistica

PALAVRAS BANIDAS:
- "versátil", "essencial", "básico", "peça", "adiciona", "funciona para"

EXEMPLOS:
✅ BOM: "Ancora qualquer look de transição."
✅ BOM: "Silhueta alongada. Sofistica tudo."
✅ BOM: "O ponto final que faltava."
❌ RUIM: "É uma peça versátil que adiciona elegância ao look."

REGRAS CRÍTICAS:
- NUNCA cite marcas
- ZERO links ou preços
- Retorne APENAS JSON válido
- Português brasileiro (pt-BR)

ESTRUTURA JSON:

{
  "covered": [
    "categoria que o usuário já cobre (máx 5)"
  ],
  "priority_five": [
    {
      "position": 1,
      "item": "Nome do item (ex: Calça de alfaiataria)",
      "impact": "Uma frase. Máximo 10 palavras."
    },
    {
      "position": 2,
      "item": "Nome do item",
      "impact": "Uma frase curta."
    },
    {
      "position": 3,
      "item": "Nome do item",
      "impact": "Uma frase curta."
    },
    {
      "position": 4,
      "item": "Nome do item",
      "impact": "Uma frase curta."
    },
    {
      "position": 5,
      "item": "Nome do item",
      "impact": "Uma frase curta."
    }
  ],
  "bonus_items": [
    {
      "item": "Item adicional",
      "impact": "Frase curta"
    }
  ],
  "edit_rule": "regra de edição simples (máx 10 palavras)"
}

IMPORTANTE:
- "covered": máximo 5 itens
- "priority_five": EXATAMENTE 5 itens, ordenados por impacto
- "bonus_items": 3-5 itens adicionais (para "Precisa de mais?")
- "edit_rule": frase curta e memorável`;
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
  if (!Array.isArray(data.priority_five) || data.priority_five.length < 3) return false;
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
    
    // Sanitize priority_five
    if (Array.isArray(capsuleResult.priority_five)) {
      capsuleResult.priority_five = capsuleResult.priority_five.map((p: any) => ({
        ...p,
        item: sanitizeOutputItems([p.item])[0] || p.item,
      }));
    }
    
    // Sanitize bonus_items if present
    if (Array.isArray(capsuleResult.bonus_items)) {
      capsuleResult.bonus_items = capsuleResult.bonus_items.map((b: any) => ({
        ...b,
        item: sanitizeOutputItems([b.item])[0] || b.item,
      }));
    }

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

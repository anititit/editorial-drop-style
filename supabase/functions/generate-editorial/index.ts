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
  return `dbg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

function errorResponse(error: string, message: string, debugId: string, status = 200) {
  return new Response(
    JSON.stringify({ error, message, debug_id: debugId }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ============================================================================
// INPUT VALIDATION
// ============================================================================

const ALLOWED_CATEGORIES = ["moda", "beleza", "joias", "food", "wellness", "design", "lifestyle", "tech"];
const ALLOWED_OBJECTIVES = ["consistencia", "premium", "conversao", "lancamento"];

function sanitizeBrandInfo(brandInfo: any): {
  name: string;
  category: string;
  objective: string;
} {
  return {
    name: typeof brandInfo?.name === "string" ? brandInfo.name.trim().slice(0, 100) : "Marca",
    category: ALLOWED_CATEGORIES.includes(brandInfo?.category) ? brandInfo.category : "lifestyle",
    objective: ALLOWED_OBJECTIVES.includes(brandInfo?.objective) ? brandInfo.objective : "consistencia",
  };
}

function isDirectImageUrl(url: string): boolean {
  const trimmed = url.trim();
  const trustedImageCdns = [
    /images\.unsplash\.com/i,
    /images\.pexels\.com/i,
    /i\.pinimg\.com/i,
    /cdn\.pixabay\.com/i,
  ];
  if (trustedImageCdns.some((rx) => rx.test(trimmed))) {
    return true;
  }
  return /\.(png|jpe?g|webp)(\?.*)?$/i.test(trimmed);
}

function looksLikePinterestPinPage(url: string): boolean {
  return /pinterest\.[a-z.]+\/pin\//i.test(url.trim());
}

function validateUrlImages(images: string[]): { ok: true; cleaned: string[] } | { ok: false; error: string; message: string } {
  const cleaned = (images || []).map((u) => (typeof u === "string" ? u.trim() : "")).filter(Boolean);

  if (cleaned.length !== 3) {
    return {
      ok: false,
      error: "need_exactly_3",
      message: "Envie exatamente 3 imagens.",
    };
  }

  const pinPage = cleaned.find(looksLikePinterestPinPage);
  if (pinPage) {
    return {
      ok: false,
      error: "pinterest_pin_page",
      message: "Esse link é uma página do Pinterest, não uma imagem direta. Use um link i.pinimg.com ou faça upload.",
    };
  }

  const notDirect = cleaned.find((u) => !isDirectImageUrl(u));
  if (notDirect) {
    return {
      ok: false,
      error: "not_direct_image",
      message: "Cole links diretos de imagem (.jpg, .png, .webp).",
    };
  }

  return { ok: true, cleaned };
}

function validateBase64Image(data: string): { valid: boolean; error?: string } {
  const MAX_SIZE = 6 * 1024 * 1024;

  if (typeof data !== "string" || !data.startsWith("data:image/")) {
    return { valid: false, error: "Formato inválido" };
  }

  const validTypes = ["data:image/jpeg", "data:image/jpg", "data:image/png", "data:image/webp"];
  if (!validTypes.some(t => data.startsWith(t))) {
    return { valid: false, error: "Apenas JPG, PNG, WebP" };
  }

  const base64Match = data.match(/^data:image\/[a-z]+;base64,(.+)$/i);
  if (!base64Match || !/^[A-Za-z0-9+/]+=*$/.test(base64Match[1])) {
    return { valid: false, error: "Base64 inválido" };
  }

  const size = (base64Match[1].length * 3) / 4;
  if (size > MAX_SIZE) {
    return { valid: false, error: "Imagem muito grande (max 6MB)" };
  }

  return { valid: true };
}

function validateRequestBody(body: any): { ok: true; images: string[]; isUrls: boolean; brandInfo: any } | { ok: false; error: string; message: string } {
  if (!body || !Array.isArray(body.images) || body.images.length !== 3) {
    return { ok: false, error: "invalid_input", message: "Envie exatamente 3 imagens." };
  }

  const isUrls = body.isUrls === true || 
    (body.images.length > 0 && typeof body.images[0] === "string" && body.images[0].trim().startsWith("http"));

  if (isUrls) {
    const validation = validateUrlImages(body.images);
    if (!validation.ok) return validation;
  } else {
    for (let i = 0; i < body.images.length; i++) {
      const imgValidation = validateBase64Image(body.images[i]);
      if (!imgValidation.valid) {
        return { ok: false, error: "invalid_image", message: `Imagem ${i + 1}: ${imgValidation.error}` };
      }
    }
  }

  return { ok: true, images: body.images, isUrls, brandInfo: body.brandInfo };
}

// ============================================================================
// CONTENT SAFETY CHECK
// ============================================================================

const SAFETY_CHECK_PROMPT = `Analyze these images. Respond with ONLY JSON:
{"selfie": true/false, "nudity": true/false, "minors": true/false}

- selfie: Amateur personal photo with face as main subject (NOT fashion/editorial photos with models)
- nudity: Explicit nudity or sexual content
- minors: Inappropriate content involving minors

Product photos, textures, UI, objects are always allowed.`;

async function checkContentSafety(
  images: string[],
  isUrls: boolean,
  apiKey: string,
  debugId: string
): Promise<{ safe: true } | { safe: false; reason: "selfie_not_allowed" | "content_not_allowed" }> {
  const imageContent = isUrls
    ? images.map((url: string) => ({ type: "image_url", image_url: { url: url.trim() } }))
    : images.map((base64: string) => ({ type: "image_url", image_url: { url: base64 } }));

  try {
    console.log(`[${debugId}] Running safety check...`);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SAFETY_CHECK_PROMPT },
          { role: "user", content: [{ type: "text", text: "Check these 3 images." }, ...imageContent] },
        ],
        max_tokens: 100,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      console.error(`[${debugId}] Safety API error: ${response.status}`);
      return { safe: true };
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) return { safe: true };

    const contentText = normalizeModelContent(rawContent);
    console.log(`[${debugId}] Safety result: ${contentText}`);

    let safetyResult: { selfie?: boolean; nudity?: boolean; minors?: boolean };
    try {
      safetyResult = extractJson(contentText);
    } catch {
      return { safe: true };
    }

    if (safetyResult.nudity === true || safetyResult.minors === true) {
      return { safe: false, reason: "content_not_allowed" };
    }

    if (safetyResult.selfie === true) {
      return { safe: false, reason: "selfie_not_allowed" };
    }

    return { safe: true };
  } catch (error) {
    console.error(`[${debugId}] Safety error:`, error);
    return { safe: true };
  }
}

// ============================================================================
// AI PROMPT & RESPONSE HANDLING
// ============================================================================

function buildSystemPrompt(brandInfo: { name: string; category: string; objective: string }): string {
  const categoryContext: Record<string, string> = {
    moda: "moda e vestuário - silhuetas, tecidos, styling",
    beleza: "beleza e cosméticos - texturas, acabamentos, aplicações",
    joias: "joias e acessórios - materiais, detalhes, composições",
    food: "gastronomia - apresentação, ambiente, experiência",
    wellness: "bem-estar e saúde - equilíbrio, natureza, cuidado",
    design: "design e decoração - formas, materiais, espaços",
    lifestyle: "lifestyle e experiências - momentos, atmosferas, curadoria",
    tech: "tecnologia e digital - interfaces, clareza, experiência de produto",
  };

  const objectiveContext: Record<string, string> = {
    consistencia: "criar identidade visual consistente e reconhecível",
    premium: "elevar percepção de valor e posicionamento",
    conversao: "gerar desejo e ação de compra",
    lancamento: "introduzir novidade com impacto",
  };

  return `Você é um consultor editorial de marcas de alto nível para o mercado brasileiro. Analisa referências visuais e gera guias editoriais no tom de Vogue e Harper's Bazaar.

MARCA: ${brandInfo.name}
CATEGORIA: ${categoryContext[brandInfo.category] || categoryContext.lifestyle}
OBJETIVO: ${objectiveContext[brandInfo.objective] || objectiveContext.consistencia}

REGRAS CRÍTICAS:
1. Retorne APENAS JSON válido. Sem markdown. Sem explicações.
2. NUNCA recuse analisar. Se abstrato, interprete paleta, contraste, textura, mood.
3. TODOS os campos são OBRIGATÓRIOS.
4. Todo texto em português brasileiro (pt-BR).

Retorne este JSON EXATO:

{
  "profile": {
    "category": "${brandInfo.category}",
    "objective": "${brandInfo.objective}",
    "persona": {
      "archetype": "nome do arquétipo da marca (ex: A Curadora, O Inovador)",
      "cultural_age": "faixa etária cultural do público (ex: 28-35)",
      "mental_city": "cidade que representa a energia da marca",
      "essence": "frase-essência da marca em uma linha"
    },
    "visual_codes": {
      "palette_hex": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
      "contrast": "low|medium|high",
      "textures": ["3-4 texturas características"],
      "composition": ["3-4 regras de composição visual"]
    }
  },
  "editorial": {
    "headline": "título editorial impactante",
    "positioning": "frase de posicionamento da marca",
    "directions": [
      {
        "type": "signature",
        "title": "nome da direção",
        "description": "descrição curta",
        "visual_cues": ["3 dicas visuais"]
      },
      {
        "type": "aspirational",
        "title": "nome da direção",
        "description": "descrição curta",
        "visual_cues": ["3 dicas visuais"]
      },
      {
        "type": "conversion",
        "title": "nome da direção",
        "description": "descrição curta",
        "visual_cues": ["3 dicas visuais"]
      }
    ],
    "content_system": {
      "pillars": ["3 pilares de conteúdo"],
      "cadence": "sugestão de frequência",
      "quick_wins": ["3-5 ideias de conteúdo rápido"]
    },
    "footer_note": "nota editorial de fechamento"
  }
}

INSTRUÇÕES:
- persona.archetype: Use arquétipos elegantes e aspiracionais
- persona.essence: Uma frase que a marca diria
- directions: signature=identidade core, aspirational=elevação, conversion=venda
- content_system.quick_wins: Ideias executáveis imediatamente

Tom: Premium, confiante, nunca arrogante. Editorial, nunca corporativo.`;
}

function normalizeModelContent(content: any): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((p) => (typeof p === "string" ? p : (p?.text ?? ""))).join("").trim();
  }
  if (content && typeof content === "object" && typeof content.text === "string") {
    return content.text;
  }
  return String(content ?? "");
}

function stripCodeFences(s: string): string {
  let out = s.trim();
  if (out.includes("```json")) out = out.replace(/```json\s*/g, "").replace(/```\s*/g, "");
  else if (out.includes("```")) out = out.replace(/```\s*/g, "");
  return out.trim();
}

function extractJson(text: string): any {
  const cleaned = stripCodeFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    // extraction fallback
  }
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("NO_JSON_FOUND");
  }
  return JSON.parse(cleaned.slice(first, last + 1));
}

function validateEditorialStructure(obj: any): { valid: boolean; missing: string[] } {
  const requiredPaths = [
    "profile",
    "profile.persona",
    "profile.visual_codes",
    "editorial",
    "editorial.headline",
    "editorial.directions",
    "editorial.content_system",
  ];

  const missing: string[] = [];
  
  for (const path of requiredPaths) {
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
      if (!current || typeof current !== "object" || !(part in current)) {
        missing.push(path);
        break;
      }
      current = current[part];
    }
  }

  return { valid: missing.length === 0, missing };
}

async function callAI(
  images: string[],
  isUrls: boolean,
  brandInfo: { name: string; category: string; objective: string },
  apiKey: string,
  debugId: string
): Promise<{ success: true; data: any } | { success: false; error: string; message: string }> {
  const imageContent = isUrls
    ? images.map((url: string) => ({ type: "image_url", image_url: { url: url.trim() } }))
    : images.map((base64: string) => ({ type: "image_url", image_url: { url: base64 } }));

  const systemPrompt = buildSystemPrompt(brandInfo);

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        { type: "text", text: `Analise estas 3 referências visuais para a marca "${brandInfo.name}" e gere o Brand Editorial. Retorne APENAS o JSON.` },
        ...imageContent,
      ],
    },
  ];

  try {
    console.log(`[${debugId}] Calling AI for brand: ${brandInfo.name}, category: ${brandInfo.category}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${debugId}] AI API error: ${response.status} - ${errorText}`);
      return { success: false, error: "gateway_error", message: "Erro ao gerar editorial. Tente novamente." };
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error(`[${debugId}] No content in AI response`);
      return { success: false, error: "no_model_content", message: "Resposta vazia. Tente novamente." };
    }

    const contentText = normalizeModelContent(rawContent);
    console.log(`[${debugId}] AI response length: ${contentText.length}`);

    let parsed: any;
    try {
      parsed = extractJson(contentText);
    } catch (e) {
      console.error(`[${debugId}] JSON parse error:`, e);
      return { success: false, error: "malformed_json", message: "Erro ao processar. Tente novamente." };
    }

    const validation = validateEditorialStructure(parsed);
    if (!validation.valid) {
      console.error(`[${debugId}] Missing fields:`, validation.missing);
      return { success: false, error: "incomplete_editorial", message: "Resposta incompleta. Tente novamente." };
    }

    return { success: true, data: parsed };
  } catch (error) {
    console.error(`[${debugId}] AI call error:`, error);
    return { success: false, error: "network_error", message: "Erro de conexão. Tente novamente." };
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const debugId = generateDebugId();
  console.log(`[${debugId}] Request started`);

  try {
    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = await checkRateLimitDb(clientIp, debugId);
    
    if (!rateLimitResult.allowed) {
      console.log(`[${debugId}] Rate limited: ${clientIp}`);
      return new Response(
        JSON.stringify({
          error: "rate_limited",
          message: "Muitas requisições. Tente novamente em breve.",
          retry_after: rateLimitResult.retryAfter,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate body
    const body = await req.json();
    const validation = validateRequestBody(body);
    
    if (!validation.ok) {
      console.log(`[${debugId}] Validation failed: ${validation.error}`);
      return errorResponse(validation.error, validation.message, debugId);
    }

    const { images, isUrls, brandInfo: rawBrandInfo } = validation;
    const brandInfo = sanitizeBrandInfo(rawBrandInfo);

    // Get API key
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error(`[${debugId}] Missing LOVABLE_API_KEY`);
      return errorResponse("config_error", "Configuração do servidor incompleta.", debugId);
    }

    // Safety check
    const safetyResult = await checkContentSafety(images, isUrls, apiKey, debugId);
    if (!safetyResult.safe) {
      console.log(`[${debugId}] Safety blocked: ${safetyResult.reason}`);
      return errorResponse(safetyResult.reason, 
        safetyResult.reason === "selfie_not_allowed" 
          ? "Use apenas referências visuais (sem selfies)."
          : "Conteúdo não permitido.",
        debugId
      );
    }

    // Generate editorial with retry
    let result = await callAI(images, isUrls, brandInfo, apiKey, debugId);
    
    if (!result.success) {
      console.log(`[${debugId}] First attempt failed, retrying...`);
      result = await callAI(images, isUrls, brandInfo, apiKey, debugId);
    }

    if (!result.success) {
      return errorResponse(result.error, result.message, debugId);
    }

    console.log(`[${debugId}] Editorial generated successfully`);

    return new Response(JSON.stringify(result.data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[${debugId}] Handler error:`, error);
    return errorResponse("server_error", "Erro interno. Tente novamente.", debugId, 500);
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Generate a short unique debug ID for correlating logs
function generateDebugId(): string {
  return `dbg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

// Secure error response - never expose internal details to client
function errorResponse(error: string, message: string, debugId: string, status = 200) {
  return new Response(
    JSON.stringify({ error, message, debug_id: debugId }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ============================================================================
// INPUT VALIDATION
// ============================================================================

const ALLOWED_OCCASIONS = ["trabalho", "casual", "date", "noite", "viagem"];
const ALLOWED_PRICE_RANGES = ["acessivel", "medio", "premium", "misturar"];
const ALLOWED_REGIONS = ["brasil", "global"];
const ALLOWED_INTENSITIES = ["suave", "medio", "marcante"];

function sanitizePreferences(prefs: any): {
  occasion: string;
  priceRange: string;
  region: string;
  fragranceIntensity: string;
} {
  return {
    occasion: ALLOWED_OCCASIONS.includes(prefs?.occasion) ? prefs.occasion : "casual",
    priceRange: ALLOWED_PRICE_RANGES.includes(prefs?.priceRange) ? prefs.priceRange : "misturar",
    region: ALLOWED_REGIONS.includes(prefs?.region) ? prefs.region : "brasil",
    fragranceIntensity: ALLOWED_INTENSITIES.includes(prefs?.fragranceIntensity) ? prefs.fragranceIntensity : "medio",
  };
}

function isDirectImageUrl(url: string): boolean {
  const trimmed = url.trim();
  // Accept common image CDNs (Unsplash, Pexels, etc.) even without file extension
  const trustedImageCdns = [
    /images\.unsplash\.com/i,
    /images\.pexels\.com/i,
    /i\.pinimg\.com/i,
    /cdn\.pixabay\.com/i,
  ];
  if (trustedImageCdns.some((rx) => rx.test(trimmed))) {
    return true;
  }
  // Fallback: check for image extension
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
      message: "Envie exatamente 3 imagens (upload) ou cole 3 URLs.",
    };
  }

  const pinPage = cleaned.find(looksLikePinterestPinPage);
  if (pinPage) {
    return {
      ok: false,
      error: "pinterest_pin_page",
      message: "Esse link é uma página do Pinterest, não uma imagem direta. Use um link i.pinimg.com/...jpg/.png ou faça upload da imagem.",
    };
  }

  const notDirect = cleaned.find((u) => !isDirectImageUrl(u));
  if (notDirect) {
    return {
      ok: false,
      error: "not_direct_image",
      message: "Cole links diretos de imagem terminando em .jpg, .png ou .webp (ex.: i.pinimg.com/...jpg).",
    };
  }

  return { ok: true, cleaned };
}

function validateBase64Image(data: string): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (typeof data !== "string") {
    return { valid: false, error: "Invalid image data type" };
  }

  if (!data.startsWith("data:image/")) {
    return { valid: false, error: "Invalid image format" };
  }

  // Estimate size (base64 is ~4/3 of original)
  const size = (data.length * 3) / 4;
  if (size > MAX_SIZE) {
    return { valid: false, error: "Image too large (max 10MB)" };
  }

  return { valid: true };
}

function validateRequestBody(body: any): { ok: true; images: string[]; isUrls: boolean; preferences: any } | { ok: false; error: string; message: string } {
  // Validate images field exists and is an array
  if (!body || !Array.isArray(body.images)) {
    return { ok: false, error: "invalid_input", message: "Campo 'images' deve ser um array." };
  }

  // Must have exactly 3 images
  if (body.images.length !== 3) {
    return { ok: false, error: "need_exactly_3", message: "Envie exatamente 3 imagens." };
  }

  // Detect if URLs or base64
  const isUrls = body.isUrls === true || 
    (body.images.length > 0 && typeof body.images[0] === "string" && body.images[0].trim().startsWith("http"));

  if (isUrls) {
    const validation = validateUrlImages(body.images);
    if (!validation.ok) {
      return validation;
    }
  } else {
    // Validate base64 images
    for (let i = 0; i < body.images.length; i++) {
      const imgValidation = validateBase64Image(body.images[i]);
      if (!imgValidation.valid) {
        return { ok: false, error: "invalid_image", message: `Imagem ${i + 1} inválida: ${imgValidation.error}` };
      }
    }
  }

  return { ok: true, images: body.images, isUrls, preferences: body.preferences };
}

// ============================================================================
// AI PROMPT & RESPONSE HANDLING
// ============================================================================

const SYSTEM_PROMPT = `You are a luxury fashion editorial consultant for a Brazilian audience. You analyze moodboard/inspiration images and generate magazine-style editorial guides in the style of Vogue and Harper's Bazaar.

CRITICAL RULES:
1. You MUST return ONLY valid JSON. No markdown. No explanations. No text outside JSON. No code blocks.
2. NEVER refuse to analyze an image. NEVER say you cannot interpret something.
3. If images are abstract, "vibe-only" (textures, lighting, architecture, collage, art), you MUST still produce the FULL JSON output. Base the profile on palette, contrast, texture, mood, and editorial references visible in the image.
4. When uncertain due to abstract imagery, set confidence between 0.45–0.65, but NEVER omit any fields.
5. ALL fields are MANDATORY. Every single field must be filled with meaningful content.

Return this EXACT JSON shape with ALL fields filled:

{
  "profile": {
    "aesthetic_primary": "clean_glow|minimal_chic|romantic_modern|after_dark_minimal|soft_grunge|street_sporty|color_pop|boho_updated|classic_luxe|coastal_cool|soft_glam|artsy_eclectic",
    "aesthetic_secondary": "clean_glow|minimal_chic|romantic_modern|after_dark_minimal|soft_grunge|street_sporty|color_pop|boho_updated|classic_luxe|coastal_cool|soft_glam|artsy_eclectic",
    "confidence": 0.85,
    "palette_hex": ["#RRGGBB", "#RRGGBB", "#RRGGBB"],
    "contrast": "low|medium|high",
    "textures": ["texture1", "texture2", "texture3"],
    "silhouettes": ["silhouette1", "silhouette2"],
    "makeup_finish": ["dewy|satin|matte|blur|soft_glam"],
    "fragrance_family": ["fresh|floral|amber|woody|gourmand|aromatic|aquatic"],
    "vibe_keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
    "why_this": ["reason1", "reason2", "reason3"]
  },
  "editorial": {
    "headline": "string - catchy editorial headline in Portuguese",
    "dek": "string - subtitle/deck in Portuguese",
    "outfits": [
      { "title": "Look 01", "hero": "main piece description", "supporting": ["item1", "item2", "item3"], "accessory": "accessory description", "caption": "editorial caption in Portuguese" },
      { "title": "Look 02", "hero": "main piece description", "supporting": ["item1", "item2", "item3"], "accessory": "accessory description", "caption": "editorial caption in Portuguese" },
      { "title": "Look 03", "hero": "main piece description", "supporting": ["item1", "item2", "item3"], "accessory": "accessory description", "caption": "editorial caption in Portuguese" }
    ],
    "makeup": {
      "day": { "base": "base product/technique", "cheeks": "cheek product/technique", "eyes": "eye product/technique", "lips": "lip product/technique" },
      "night": { "base": "base product/technique", "cheeks": "cheek product/technique", "eyes": "eye product/technique", "lips": "lip product/technique" }
    },
    "fragrance": {
      "direction": "fragrance direction description in Portuguese",
      "affordable": "affordable fragrance suggestion",
      "mid": "mid-range fragrance suggestion",
      "premium": "premium fragrance suggestion"
    },
    "footer_note": "closing note in Portuguese"
  }
}

AESTHETIC OPTIONS (choose from these):
- clean_glow: Fresh, luminous, healthy skin focus
- minimal_chic: Pared-down elegance, quality over quantity
- romantic_modern: Soft femininity with contemporary edge
- after_dark_minimal: Sleek evening sophistication
- soft_grunge: Lived-in textures, undone beauty
- street_sporty: Athletic-inspired, urban energy
- color_pop: Bold chromatic statements
- boho_updated: Free-spirited with polish
- classic_luxe: Timeless investment pieces
- coastal_cool: Relaxed refinement, natural textures
- soft_glam: Polished, camera-ready elegance
- artsy_eclectic: Creative, unexpected combinations

All text content MUST be in Brazilian Portuguese (pt-BR).
Focus on the aesthetic qualities visible in the images - colors, textures, silhouettes, mood.
DO NOT analyze faces or personal traits. Only interpret the visual aesthetic references.`;

function normalizeModelContent(content: any): string {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((p) => (typeof p === "string" ? p : (p?.text ?? "")))
      .join("")
      .trim();
  }

  if (content && typeof content === "object") {
    if (typeof (content as any).text === "string") return (content as any).text;
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
    // Direct parse failed, attempt extraction
  }

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("NO_JSON_FOUND");
  }

  const candidate = cleaned.slice(first, last + 1);
  return JSON.parse(candidate);
}

function validateEditorialStructure(obj: any): { valid: boolean; missing: string[] } {
  const requiredPaths = [
    "profile",
    "profile.aesthetic_primary",
    "profile.confidence",
    "profile.palette_hex",
    "editorial",
    "editorial.headline",
    "editorial.outfits",
    "editorial.makeup",
    "editorial.fragrance",
  ];

  const missing: string[] = [];

  for (const path of requiredPaths) {
    const keys = path.split(".");
    let current = obj;
    let found = true;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        found = false;
        break;
      }
    }

    if (!found) {
      missing.push(path);
    }
  }

  return { valid: missing.length === 0, missing };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const debugId = generateDebugId();

  try {
    const body = await req.json();
    console.log(`[${debugId}] Request received`);

    // Validate request body structure
    const validation = validateRequestBody(body);
    if (!validation.ok) {
      console.log(`[${debugId}] Validation failed: ${validation.error}`);
      return errorResponse(validation.error, validation.message, debugId, 400);
    }

    const { images, isUrls } = validation;
    const preferences = sanitizePreferences(body.preferences);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error(`[${debugId}] LOVABLE_API_KEY not configured`);
      return errorResponse("config_error", "Serviço temporariamente indisponível.", debugId);
    }

    const preferencesContext = `
Preferências do usuário:
- Ocasião: ${preferences.occasion}
- Faixa de preço: ${preferences.priceRange}
- Região: ${preferences.region}
- Intensidade de fragrância: ${preferences.fragranceIntensity}
`;

    const imageContent = isUrls
      ? images.map((url: string) => ({ type: "image_url", image_url: { url: url.trim() } }))
      : images.map((base64: string) => ({ type: "image_url", image_url: { url: base64 } }));

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analise estas 3 imagens de referência e gere um editorial completo no estilo Vogue/Harper's. ${preferencesContext}
LEMBRETE FINAL: Retorne APENAS JSON válido (sem markdown, sem texto extra).`,
          },
          ...imageContent,
        ],
      },
    ];

    console.log(`[${debugId}] Calling AI Gateway (isUrls=${isUrls})`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages,
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${debugId}] AI Gateway error: ${response.status} - ${errorText}`);
      return errorResponse("gateway_error", "O serviço de IA está temporariamente indisponível.", debugId);
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error(`[${debugId}] No content in AI response`);
      return errorResponse("no_model_content", "Não foi possível gerar o editorial. Tente novamente.", debugId);
    }

    const contentText = normalizeModelContent(rawContent);
    console.log(`[${debugId}] AI response received (length=${contentText.length})`);

    let result: any;
    try {
      result = extractJson(contentText);
    } catch (parseError) {
      const errorMsg = parseError instanceof Error ? parseError.message : "Unknown parse error";
      console.error(`[${debugId}] JSON parse failed: ${errorMsg}`);
      console.error(`[${debugId}] Raw output preview: ${contentText.substring(0, 500)}`);

      const userMessage = errorMsg.includes("NO_JSON_FOUND")
        ? "A IA não retornou um editorial estruturado. Tente com imagens mais claras."
        : "O editorial gerado estava incompleto. Tente novamente.";

      return errorResponse("malformed_json", userMessage, debugId);
    }

    // Validate the structure of the parsed JSON
    const structureValidation = validateEditorialStructure(result);
    if (!structureValidation.valid) {
      console.error(`[${debugId}] Missing fields: ${structureValidation.missing.join(", ")}`);
      return errorResponse("incomplete_editorial", "O editorial gerado está incompleto. Tente novamente ou use imagens diferentes.", debugId);
    }

    console.log(`[${debugId}] Editorial generated successfully`);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[${debugId}] Unhandled error: ${errorMessage}`);
    return errorResponse("server_error", "Erro interno do servidor. Tente novamente.", debugId, 500);
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a luxury fashion editorial consultant for a Brazilian audience. You analyze moodboard/inspiration images and generate magazine-style editorial guides in the style of Vogue and Harper's Bazaar.

CRITICAL: You MUST return ONLY valid JSON. No markdown. No explanations. No text outside JSON. No code blocks.

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

function isDirectImageUrl(url: string) {
  return /\.(png|jpe?g|webp)(\?.*)?$/i.test(url.trim());
}

function looksLikePinterestPinPage(url: string) {
  return /pinterest\.[a-z.]+\/pin\//i.test(url.trim());
}

function validateUrlImages(images: string[]) {
  const cleaned = (images || []).map((u) => (u || "").trim()).filter(Boolean);

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
      message:
        "Esse link é uma página do Pinterest, não uma imagem direta. Use um link i.pinimg.com/...jpg/.png ou faça upload da imagem.",
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
  } catch {}

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No JSON object found in model output");
  }

  const candidate = cleaned.slice(first, last + 1);
  return JSON.parse(candidate);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // IMPORTANT: call req.json() only once
    const body = await req.json();
    console.log("REQ_BODY:", body);

    const images = body?.images;
    const preferences = body?.preferences;

    // robust URL detection (even if client sends isUrls wrong)
    const isUrlsDetected =
      body?.isUrls === true ||
      (Array.isArray(images) &&
        images.length > 0 &&
        typeof images[0] === "string" &&
        images[0].trim().startsWith("http"));

    const isUrls = Boolean(isUrlsDetected);

    if (!Array.isArray(images)) {
      return new Response(JSON.stringify({ error: "invalid_input", message: "Campo 'images' deve ser um array." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isUrls) {
      const v = validateUrlImages(images);
      if (!v.ok) {
        return new Response(JSON.stringify({ error: v.error, message: v.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "missing_key", message: "LOVABLE_API_KEY não configurada." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const preferencesContext = `
Preferências do usuário:
- Ocasião: ${preferences?.occasion || "casual"}
- Faixa de preço: ${preferences?.priceRange || "misturar"}
- Região: ${preferences?.region || "brasil"}
- Intensidade de fragrância: ${preferences?.fragranceIntensity || "medio"}
`;

    let imageContent: any[] = [];

    if (isUrls) {
      imageContent = images.map((url: string) => ({
        type: "image_url",
        image_url: { url: url.trim() },
      }));
    } else {
      // base64 images should come like "data:image/jpeg;base64,...."
      imageContent = images.map((base64: string) => ({
        type: "image_url",
        image_url: { url: base64 },
      }));
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analise estas 3 imagens de referência e gere um editorial completo no estilo Vogue/Harper’s. ${preferencesContext}
LEMBRETE FINAL: Retorne APENAS JSON válido (sem markdown, sem texto extra).`,
          },
          ...imageContent,
        ],
      },
    ];

    console.log("Calling Lovable AI Gateway... isUrls=", isUrls);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // If gemini-2.5-pro keeps returning 400, try: "google/gemini-2.0-flash"
        model: "google/gemini-2.5-pro",
        messages,
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      // IMPORTANT: do not throw; return JSON so UI doesn't blank
      return new Response(
        JSON.stringify({
          error: "gateway_error",
          status: response.status,
          message: "O serviço de IA recusou a requisição.",
          details: errorText,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    console.log("AI Gateway response received");

    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) {
      return new Response(
        JSON.stringify({
          error: "no_model_content",
          message: "Não foi possível gerar o editorial. Tente novamente.",
          debug: data,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const contentText = normalizeModelContent(rawContent);
    console.log("MODEL_RAW_OUTPUT (first 500 chars):", contentText.substring(0, 500));

    let result: any;
    try {
      result = extractJson(contentText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("MODEL_RAW_OUTPUT:", contentText);

      return new Response(
        JSON.stringify({
          error: "invalid_model_json",
          message:
            "Não foi possível gerar o editorial com essas referências. Tente novamente ou use imagens diferentes.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: "server_error", message: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

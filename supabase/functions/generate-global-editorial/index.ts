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
  return `global_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

function errorResponse(error: string, message: string, debugId: string, status = 200) {
  return new Response(
    JSON.stringify({ error, message, debug_id: debugId }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
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

function buildSystemPrompt(): string {
  return `You are a high-end personal style consultant for a global audience. You analyze visual references and generate aesthetic readings in the tone of Vogue and Harper's Bazaar.

This is a PERSONAL STYLE service. You analyze visual references to understand the PERSON's aesthetic identity.

⚠️ CRITICAL PRODUCT RULES (MVP - NO AFFILIATES):

CLOTHING AND BEAUTY = ALWAYS GENERIC:
- DO NOT mention brands, stores, websites, or specific products in clothing, makeup, or skincare.
- Write descriptively: texture, material, finish, color, shape, and intention.
- CORRECT Examples:
  • "tailored wool blazer with clean lines"
  • "nude rose lipstick with satin finish"
  • "fine-strap leather sandals in natural tan"
  • "lightweight moisturizer with controlled glow"
- INCORRECT Examples (DO NOT USE):
  • "The Row blazer" ❌
  • "MAC Ruby Woo lipstick" ❌
  • "Schutz sandals" ❌

FRAGRANCE = ONLY EXCEPTION:
- Fragrances CAN mention real perfume names.
- Limit to exactly 3 fragrances (1 per tier: affordable, mid-range, premium).

NEVER INCLUDE:
- Purchase links
- "affiliate", "buy now", "click to buy"
- Specific prices in text (only approximate_price_usd in JSON)
- Store or website names

CRITICAL RULES:
1. Return ONLY valid JSON. No markdown. No explanations.
2. NEVER refuse to analyze. If abstract, interpret palette, contrast, texture, mood.
3. ALL fields are REQUIRED.
4. All text MUST be in ENGLISH. Global, easy, clear — not slang-heavy.
5. Tone: Vogue/Harper's Bazaar — elegant, confident, aspirational, never instructional.

FRAGRANCE COMPOSITION (EXACTLY 3):
1. FIRST: 1 AFFORDABLE fragrance (up to $60 USD) - price_tier: "affordable"
2. SECOND: 1 MID-RANGE fragrance ($60-150 USD) - price_tier: "mid"
3. THIRD: 1 PREMIUM fragrance (above $150 USD) - price_tier: "premium"

⚠️ FIXED ORDER: Always Affordable → Mid-range → Premium in the array.
⚠️ USE REAL NAMES of well-known, globally available perfumes.

LANGUAGE GUIDELINES:
- Short sentences, confident tone
- Avoid idioms and American slang
- Minimal, readable, premium
- Editorial voice, not conversational

Return this EXACT JSON:

{
  "profile": {
    "aesthetic_primary": "main style name (e.g. Minimal Chic, Modern Romantic, Classic Luxe)",
    "aesthetic_secondary": "secondary complementary style",
    "confidence": 0.85,
    "palette_hex": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
    "contrast": "low|medium|high",
    "textures": ["3-4 textures that define the style"],
    "silhouettes": ["3-4 characteristic silhouettes"],
    "makeup_finish": "description of ideal makeup finish (GENERIC, no brands)",
    "fragrance_family": "dominant olfactory family",
    "why_this": [
      "Reason 1 based on references (max 18 words)",
      "Reason 2 based on references (max 18 words)",
      "Reason 3 based on references (max 18 words)"
    ]
  },
  "editorial": {
    "headline": "impactful editorial headline about the personal style",
    "dek": "phrase that complements the headline (1-2 lines)",
    "looks": [
      {
        "title": "Day Look",
        "hero_piece": "main piece GENERIC (e.g. oversized linen blazer in cream)",
        "supporting": ["generic item 1", "generic item 2"],
        "accessory": "generic accessory (e.g. structured leather tote in tan)",
        "caption": "short editorial caption"
      },
      {
        "title": "Transition Look",
        "hero_piece": "generic main piece",
        "supporting": ["item 1", "item 2"],
        "accessory": "generic accessory",
        "caption": "editorial caption"
      },
      {
        "title": "Evening Look",
        "hero_piece": "generic main piece",
        "supporting": ["item 1", "item 2"],
        "accessory": "generic accessory",
        "caption": "editorial caption"
      }
    ],
    "makeup_day": {
      "base": "generic day base/skin recommendation (e.g. lightweight foundation with natural finish)",
      "cheeks": "day cheeks (e.g. peach cream blush)",
      "eyes": "day eyes (e.g. black mascara, groomed brows)",
      "lips": "day lips (e.g. rose tinted lip oil)"
    },
    "makeup_night": {
      "base": "generic night base/skin",
      "cheeks": "night cheeks",
      "eyes": "night eyes",
      "lips": "night lips"
    },
    "fragrances": [
      { 
        "name": "REAL Affordable Perfume Name", 
        "brand": "Real Brand",
        "notes": "main olfactory notes", 
        "price_tier": "affordable",
        "approximate_price_usd": 50,
        "why_it_matches": "one short line explaining the connection to the style"
      },
      { 
        "name": "REAL Mid-Range Perfume Name", 
        "brand": "Real Brand",
        "notes": "notes", 
        "price_tier": "mid",
        "approximate_price_usd": 100,
        "why_it_matches": "connection"
      },
      { 
        "name": "REAL Premium Perfume Name", 
        "brand": "Real Brand",
        "notes": "notes", 
        "price_tier": "premium",
        "approximate_price_usd": 250,
        "why_it_matches": "connection"
      }
    ],
    "footer_note": "elegant editorial closing note",
    "commerce": {
      "shortlist": [
        { "category": "Hero", "item_name": "GENERIC key piece (e.g. long wool coat, straight cut)", "price_lane": "Affordable|Mid-range|Premium", "rationale": "why it works" },
        { "category": "Supporting", "item_name": "GENERIC supporting piece", "price_lane": "Affordable|Mid-range|Premium", "rationale": "why it works" },
        { "category": "Accessory", "item_name": "GENERIC accessory (e.g. structured leather bag)", "price_lane": "Affordable|Mid-range|Premium", "rationale": "why it works" },
        { "category": "Beauty", "item_name": "GENERIC beauty item (e.g. hydrating serum with hyaluronic acid)", "price_lane": "Affordable|Mid-range|Premium", "rationale": "why it works" },
        { "category": "Scent", "item_name": "fragrance (can cite real name) or generic candle", "price_lane": "Affordable|Mid-range|Premium", "rationale": "why it works" }
      ],
      "look_recipes": [
        { "formula": "GENERIC outfit formula (e.g. oversized blazer + midi dress + leather loafers)" },
        { "formula": "GENERIC outfit formula" },
        { "formula": "GENERIC outfit formula" }
      ],
      "search_terms": ["term 1", "term 2", "term 3", "term 4", "term 5"]
    }
  }
}

FINAL INSTRUCTIONS:
- aesthetic_primary/secondary: Use evocative names in English
- confidence: 0.85 default, 0.45-0.65 if images are very abstract
- looks: Each look must have GENERIC, specific pieces - never cite brands
- makeup: Specific techniques and finishes, NEVER brands
- fragrances: Use REAL perfumes. Only category where brands are allowed.
- why_this: EXACTLY 3 bullets, max 18 words each, confident editorial tone. No AI/analysis references.

Tone: Premium, confident, never arrogant. Fashion editorial, not generic consulting.
For clothing and beauty, do not use brands. Always write in a generic and descriptive way.`;
}

async function callAI(
  images: string[],
  isUrls: boolean,
  apiKey: string,
  debugId: string
): Promise<{ success: true; data: any } | { success: false; error: string; message: string }> {
  const systemPrompt = buildSystemPrompt();

  const imageContent = isUrls
    ? images.map((url: string) => ({ type: "image_url", image_url: { url: url.trim() } }))
    : images.map((base64: string) => ({ type: "image_url", image_url: { url: base64 } }));

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        { type: "text", text: "Analyze these 3 reference images and generate the complete aesthetic profile and editorial. Return ONLY the JSON." },
        ...imageContent,
      ],
    },
  ];

  try {
    console.log(`[${debugId}] Calling AI for Global B2C editorial...`);

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
      return { success: false, error: "ai_error", message: "Could not generate the editorial. Please try again." };
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error(`[${debugId}] No content in AI response`);
      return { success: false, error: "empty_response", message: "Empty response. Please try again." };
    }

    const contentText = normalizeModelContent(rawContent);
    console.log(`[${debugId}] AI response length: ${contentText.length}`);

    let parsed: any;
    try {
      parsed = extractJson(contentText);
    } catch (e) {
      console.error(`[${debugId}] JSON parse error:`, e);
      return { success: false, error: "json_parse_error", message: "Error processing response. Please try again." };
    }

    if (!parsed.profile || !parsed.editorial) {
      console.error(`[${debugId}] Incomplete structure`);
      return { success: false, error: "incomplete_structure", message: "Incomplete response. Please try again." };
    }

    return { success: true, data: parsed };
  } catch (error) {
    console.error(`[${debugId}] AI call exception:`, error);
    return { success: false, error: "network_error", message: "Connection error. Please try again." };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const debugId = generateDebugId();
  console.log(`[${debugId}] Global B2C Editorial request started`);

  try {
    // Rate limiting check
    const clientIp = getClientIp(req);
    const rateLimitResult = await checkRateLimitDb(clientIp, debugId);

    if (!rateLimitResult.allowed) {
      console.log(`[${debugId}] Rate limited: ${clientIp}`);
      return new Response(
        JSON.stringify({
          error: "rate_limited",
          message: "Too many requests. Please try again later.",
          retry_after: rateLimitResult.retryAfter,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { images = [], isUrls = false } = body;

    if (!Array.isArray(images) || images.length !== 3) {
      return errorResponse("invalid_input", "Upload exactly 3 images.", debugId);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error(`[${debugId}] Missing LOVABLE_API_KEY`);
      return errorResponse("config_error", "Server configuration incomplete.", debugId);
    }

    // Call AI with retry
    let result = await callAI(images, isUrls, apiKey, debugId);

    if (!result.success) {
      console.log(`[${debugId}] First attempt failed, retrying...`);
      result = await callAI(images, isUrls, apiKey, debugId);
    }

    if (!result.success) {
      return errorResponse(result.error, result.message, debugId);
    }

    console.log(`[${debugId}] Global B2C editorial generated successfully`);

    return new Response(JSON.stringify(result.data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[${debugId}] Request handler error:`, error);
    return errorResponse("server_error", "Internal error. Please try again.", debugId, 500);
  }
});

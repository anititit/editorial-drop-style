import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateDebugId(): string {
  return `studio_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
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
    // Direct parse failed
  }
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("NO_JSON_FOUND");
  }
  const candidate = cleaned.slice(first, last + 1);
  return JSON.parse(candidate);
}

function buildSystemPrompt(
  hasVisual: boolean,
  hasBrands: boolean,
  brandNames: string[],
  category: string,
  note: string
): string {
  let inputContext = "";

  const categoryLabels: Record<string, string> = {
    fashion: "Fashion",
    beauty: "Beauty",
    food: "Food & Drink",
    tech: "Tech",
  };

  const categoryContext = `Category: ${categoryLabels[category] || category}`;
  const noteContext = note ? `\nAdditional context from client: "${note}"` : "";

  if (hasVisual && hasBrands) {
    inputContext = `You will receive TWO types of reference:
1. Visual moodboard/reference images (inform palette, textures, composition)
2. Inspirational brands: ${brandNames.join(", ")} (inform positioning, tone, visual language)

Your task is to MERGE these references editorially, finding the connection between the visual aesthetic and the universe of the cited brands.`;
  } else if (hasVisual) {
    inputContext = `You will receive visual moodboard/reference images that inform palette, textures, composition, and aesthetic direction.`;
  } else if (hasBrands) {
    inputContext = `You will receive inspirational brand references: ${brandNames.join(", ")}

Analyze the universe of these brands to extract:
- Positioning and tone of voice
- Characteristic visual language
- Implicit aesthetic codes
- Audience and aspiration

IMPORTANT: Never suggest copying these brands. Use them as creative direction to develop an ORIGINAL identity.`;
  }

  return `You are a high-end creative director. You generate brand direction documents in the editorial tone of Vogue and Harper's Bazaar.

${categoryContext}${noteContext}

${inputContext}

CRITICAL TONE RULES:
1. This is a BRAND DIRECTION document, not a social media guide.
2. NEVER use operational language: "post", "engagement", "calendar", "script", "content".
3. NEVER include posting frequency, calendars, shotlists, or content systems.
4. Tone: polished, restrained, editorial. Vogue, not consultancy.
5. All text MUST be in ENGLISH. Global, easy, magazine tone.

TECHNICAL RULES:
1. Return ONLY valid JSON. No markdown. No text outside JSON.
2. NEVER mention copying or imitating brands.
3. All fields are REQUIRED.
4. NEVER repeat information between sections. Each section must add new value.

Return this EXACT JSON:

{
  "persona": {
    "archetype": "archetype name (e.g. The Curator, The Visionary)",
    "mental_city": "city that represents the energy (e.g. Paris, Copenhagen)",
    "ambition": "what they want to be/represent",
    "would_say": "a phrase they would say",
    "would_never_say": "a phrase they would never say"
  },
  "positioning": "single positioning phrase (1 elegant sentence)",
  "brand_codes": {
    "visual": {
      "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
      "contrast": "low|medium|high",
      "textures": ["3-4 characteristic textures"],
      "composition": ["3-4 visual composition rules"],
      "light": "description of characteristic light direction"
    },
    "verbal": {
      "tone": "tone of voice description",
      "rhythm": "writing rhythm description",
      "allowed_words": ["5-6 allowed words"],
      "forbidden_words": ["5-6 forbidden words"]
    }
  },
  "why_it_works": [
    "reason 1 (max 18 words, declarative, no process explanation)",
    "reason 2 (max 18 words, declarative, no process explanation)",
    "reason 3 (max 18 words, declarative, no process explanation)"
  ],
  "looks": [
    {
      "title": "look name",
      "hero_piece": "main piece",
      "supporting": ["supporting piece 1", "supporting piece 2"],
      "accessory": "key accessory",
      "caption": "short editorial caption"
    },
    {
      "title": "look name 2",
      "hero_piece": "main piece",
      "supporting": ["supporting piece 1", "supporting piece 2"],
      "accessory": "key accessory",
      "caption": "short editorial caption"
    },
    {
      "title": "look name 3",
      "hero_piece": "main piece",
      "supporting": ["supporting piece 1", "supporting piece 2"],
      "accessory": "key accessory",
      "caption": "short editorial caption"
    }
  ],
  "makeup": {
    "base": "base recommendation",
    "cheeks": "cheeks recommendation",
    "eyes": "eyes recommendation",
    "lips": "lips recommendation"
  },
  "fragrances": [
    {
      "name": "fragrance name (generic, no brand)",
      "notes": "olfactory notes",
      "price_tier": "affordable|mid|premium",
      "why_it_matches": "why it fits the direction"
    },
    {
      "name": "fragrance name 2",
      "notes": "olfactory notes",
      "price_tier": "affordable|mid|premium",
      "why_it_matches": "why it fits"
    }
  ],
  "commerce": {
    "shortlist": [
      { "category": "Hero", "item_name": "generic key piece", "price_lane": "Affordable|Mid-range|Premium", "rationale": "why it works" },
      { "category": "Supporting", "item_name": "supporting piece", "price_lane": "Affordable|Mid-range|Premium", "rationale": "why it works" },
      { "category": "Beauty", "item_name": "beauty or lifestyle item", "price_lane": "Affordable|Mid-range|Premium", "rationale": "why it works" },
      { "category": "Scent", "item_name": "fragrance or candle", "price_lane": "Affordable|Mid-range|Premium", "rationale": "why it works" },
      { "category": "Wildcard", "item_name": "unexpected wildcard item", "price_lane": "Affordable|Mid-range|Premium", "rationale": "why it works" }
    ],
    "look_recipes": [
      { "formula": "look/styling formula in one line (no brands)" },
      { "formula": "look/styling formula in one line (no brands)" },
      { "formula": "look/styling formula in one line (no brands)" }
    ],
    "search_terms": ["term 1", "term 2", "term 3", "term 4", "term 5"]
  },
  "closing_note": "short, poetic closing paragraph aligned with the brand. Editorial, not instructional."
}

CONTENT INSTRUCTIONS:
- persona.archetype: Elegant, aspirational archetypes
- positioning: One phrase that defines the differentiator editorially
- why_it_works: EXACTLY 3 bullets, declarative, confident. Never explain process or mention AI.
- looks: 3 conceptual looks. "Three visual readings of the same direction."
- makeup: Texture, finish, and intention.
- fragrances: 2-3 suggestions, generic names (no specific brands).
- commerce.shortlist: 5 GENERIC items (no brands), each with category, price lane, and short rationale
- commerce.look_recipes: 3 styling formulas in one line
- commerce.search_terms: 5-8 search terms reflecting the brand's visual codes
- closing_note: Poetic reflection. Editorial, never operational.

Overall tone: Premium, confident, never arrogant. Editorial, never operational.`;
}

async function callAI(
  images: string[],
  isUrls: boolean,
  brandRefs: string[],
  category: string,
  note: string,
  apiKey: string,
  debugId: string
): Promise<{ success: true; data: any } | { success: false; error: string; message: string }> {
  const hasVisual = images.length > 0;
  const hasBrands = brandRefs.length > 0;

  const systemPrompt = buildSystemPrompt(hasVisual, hasBrands, brandRefs, category, note);

  const userContent: any[] = [];

  // Build user message based on input type
  if (hasVisual && hasBrands) {
    userContent.push({
      type: "text",
      text: `Analyze these visual references along with the inspirational brands (${brandRefs.join(", ")}) and generate the complete brand direction document. Merge both sources editorially. Return ONLY the JSON.`,
    });
  } else if (hasVisual) {
    userContent.push({
      type: "text",
      text: "Analyze these reference images and generate the complete brand direction document. Return ONLY the JSON.",
    });
  } else if (hasBrands) {
    userContent.push({
      type: "text",
      text: `Analyze the universe of ${brandRefs.join(", ")} and generate an original brand direction document inspired by them. Return ONLY the JSON.`,
    });
  }

  // Add images if present
  if (hasVisual) {
    const imageContent = isUrls
      ? images.map((url: string) => ({ type: "image_url", image_url: { url: url.trim() } }))
      : images.map((base64: string) => ({ type: "image_url", image_url: { url: base64 } }));
    userContent.push(...imageContent);
  }

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];

  try {
    console.log(`[${debugId}] Calling AI for Global Studio (visual: ${hasVisual}, brands: ${hasBrands})...`);

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

    // Basic structure validation
    if (!parsed.persona || !parsed.positioning || !parsed.brand_codes || !parsed.why_it_works) {
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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const debugId = generateDebugId();
  console.log(`[${debugId}] Global Studio request started`);

  try {
    const body = await req.json();
    const { images = [], isUrls = false, brandRefs = [], category = "fashion", note = "" } = body;

    // Validate input
    const hasVisual = Array.isArray(images) && images.length > 0;
    const hasBrands = Array.isArray(brandRefs) && brandRefs.length >= 2;

    if (!hasVisual && !hasBrands) {
      return errorResponse("invalid_input", "Provide visual references or at least 2 brands.", debugId);
    }

    if (hasVisual && images.length !== 3) {
      return errorResponse("invalid_input", "Upload exactly 3 visual references.", debugId);
    }

    if (hasBrands && (brandRefs.length < 2 || brandRefs.length > 3)) {
      return errorResponse("invalid_input", "Provide 2–3 brand references.", debugId);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error(`[${debugId}] Missing LOVABLE_API_KEY`);
      return errorResponse("config_error", "Server configuration incomplete.", debugId);
    }

    // Call AI with retry
    let result = await callAI(images, isUrls, brandRefs, category, note, apiKey, debugId);

    if (!result.success) {
      console.log(`[${debugId}] First attempt failed, retrying...`);
      result = await callAI(images, isUrls, brandRefs, category, note, apiKey, debugId);
    }

    if (!result.success) {
      return errorResponse(result.error, result.message, debugId);
    }

    console.log(`[${debugId}] Global Studio editorial generated successfully`);

    return new Response(JSON.stringify(result.data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[${debugId}] Request handler error:`, error);
    return errorResponse("server_error", "Internal error. Please try again.", debugId, 500);
  }
});

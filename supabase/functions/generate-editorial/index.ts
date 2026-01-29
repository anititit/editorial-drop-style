import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { images, isUrls, preferences } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating editorial for", images?.length || 0, "images");
    console.log("Preferences:", preferences);

    // Build user message with preferences context
    const preferencesContext = `
Preferências do usuário:
- Ocasião: ${preferences?.occasion || "casual"}
- Faixa de preço: ${preferences?.priceRange || "misturar"}
- Região: ${preferences?.region || "brasil"}
- Intensidade de fragrância: ${preferences?.fragranceIntensity || "medio"}
`;

    // Build image content for the message
    let imageContent: any[] = [];
    
    if (isUrls) {
      // For URLs, include them as image_url type
      imageContent = images.map((url: string) => ({
        type: "image_url",
        image_url: { url }
      }));
    } else {
      // For base64 images
      imageContent = images.map((base64: string) => ({
        type: "image_url",
        image_url: { url: base64 }
      }));
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze these 3 moodboard/inspiration images and generate a complete luxury editorial guide. ${preferencesContext}

Remember: Return ONLY valid JSON, no markdown, no explanations.`
          },
          ...imageContent
        ]
      }
    ];

    console.log("Calling Lovable AI Gateway...");

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione mais créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Gateway response received");

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("Raw AI response:", content.substring(0, 500));

    // Parse JSON from response, handling potential markdown code blocks
    let jsonContent = content;
    
    // Remove markdown code blocks if present
    if (content.includes("```json")) {
      jsonContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (content.includes("```")) {
      jsonContent = content.replace(/```\n?/g, "");
    }

    // Trim whitespace
    jsonContent = jsonContent.trim();

    let result;
    try {
      result = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Content to parse:", jsonContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log("Successfully parsed editorial result");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

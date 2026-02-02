import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateDebugId(): string {
  return `pro_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
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

function buildProSystemPrompt(
  hasVisual: boolean, 
  hasBrands: boolean, 
  brandNames: string[],
  brandInfo?: { name: string; category: string; objective: string }
): string {
  let inputContext = "";
  
  // Add brand context if provided
  let brandContext = "";
  if (brandInfo?.name) {
    const categoryLabels: Record<string, string> = {
      moda: "Moda",
      beleza: "Beleza", 
      joias: "Joias",
      food: "Food & Drink",
      wellness: "Wellness",
      design: "Design",
      lifestyle: "Lifestyle",
      tech: "Tech",
    };
    const objectiveLabels: Record<string, string> = {
      consistencia: "Consistência visual",
      reposicionamento: "Reposicionamento de marca",
      conversao: "Conversão e vendas",
      lancamento: "Lançamento de marca/produto",
    };
    
    brandContext = `
CONTEXTO DA MARCA:
- Nome: ${brandInfo.name}
- Categoria: ${categoryLabels[brandInfo.category] || brandInfo.category}
- Objetivo principal: ${objectiveLabels[brandInfo.objective] || brandInfo.objective}

Use estas informações para contextualizar todo o editorial. O nome da marca deve influenciar o tom e a personalidade.`;
  }
  
  if (hasVisual && hasBrands) {
    inputContext = `Você receberá DOIS tipos de referência:
1. Imagens de moodboard/referência visual (informam paleta, texturas, composição)
2. Marcas admiradas: ${brandNames.join(", ")} (informam posicionamento, tom, linguagem visual)

Sua tarefa é MESCLAR essas referências de forma editorial, encontrando a conexão entre a estética visual e o universo das marcas citadas. Explique essa conexão de forma sutil no positioning.`;
  } else if (hasVisual) {
    inputContext = `Você receberá imagens de moodboard/referência visual que informam paleta, texturas, composição e direção estética.`;
  } else if (hasBrands) {
    inputContext = `Você receberá referências de marcas admiradas: ${brandNames.join(", ")}

Analise o universo dessas marcas para extrair:
- Posicionamento e tom de voz
- Linguagem visual característica
- Códigos estéticos implícitos
- Público e aspiração

IMPORTANTE: Nunca sugira copiar essas marcas. Use-as como norte criativo para desenvolver uma identidade ORIGINAL.`;
  }

  return `Você é um consultor de direção criativa e branding de alto nível para marcas brasileiras. Você gera um Brand Editorial Kit completo no tom de revistas como Vogue e Harper's Bazaar.
${brandContext}

${inputContext}

REGRAS CRÍTICAS:
1. Retorne APENAS JSON válido. Sem markdown. Sem explicações. Sem texto fora do JSON.
2. NUNCA mencione copiar ou imitar marcas. Use referências como inspiração para criar algo original.
3. Se receber imagens abstratas, interprete paleta, contraste, textura e mood.
4. Todos os campos são OBRIGATÓRIOS.
5. Todo conteúdo textual DEVE ser em português brasileiro (pt-BR).
6. Se um nome de marca foi fornecido, use-o para personalizar o tom e a direção criativa.

Retorne este JSON EXATO com TODOS os campos preenchidos:

{
  "persona": {
    "archetype": "nome do arquétipo (ex: A Curadora, A Visionária, A Anfitriã)",
    "cultural_age": "faixa etária cultural, não cronológica (ex: 28-35)",
    "mental_city": "cidade que representa a energia da marca (ex: Paris, Copenhagen, São Paulo)",
    "ambition": "o que ela quer ser/representar",
    "avoidances": ["3 coisas que ela evita"],
    "would_say": "uma frase que ela diria",
    "would_never_say": "uma frase que ela nunca diria"
  },
  "positioning": "frase única de posicionamento da marca",
  "brand_codes": {
    "visual": {
      "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
      "contrast": "low|medium|high",
      "textures": ["3-4 texturas características"],
      "composition_rules": ["3-4 regras de composição visual"]
    },
    "verbal": {
      "tone": "descrição do tom de voz",
      "rhythm": "descrição do ritmo da escrita",
      "allowed_words": ["5-6 palavras permitidas"],
      "forbidden_words": ["5-6 palavras proibidas"]
    }
  },
  "creative_directions": [
    {
      "type": "signature",
      "title": "nome da direção criativa",
      "lighting": "descrição da luz",
      "framing": "descrição do enquadramento",
      "styling": "descrição do styling",
      "post_ideas": ["3 ideias de post"]
    },
    {
      "type": "aspirational",
      "title": "nome da direção criativa",
      "lighting": "descrição da luz",
      "framing": "descrição do enquadramento",
      "styling": "descrição do styling",
      "post_ideas": ["3 ideias de post"]
    },
    {
      "type": "conversion",
      "title": "nome da direção criativa",
      "lighting": "descrição da luz",
      "framing": "descrição do enquadramento",
      "styling": "descrição do styling",
      "post_ideas": ["3 ideias de post"]
    }
  ],
  "content_system": {
    "pillars": ["3 pilares de conteúdo"],
    "cadence": "sugestão de cadência semanal",
    "shotlist": ["12 tipos de shot para o mês"]
  },
  "copy_kit": {
    "tagline": "tagline da marca",
    "claims": ["3 claims de marca"],
    "hooks": ["10 hooks para Reels/Stories"],
    "captions": ["5 legendas modelo"],
    "ctas": ["5 CTAs para usar"]
  },
  "dos_donts": {
    "dos": ["5 coisas para fazer"],
    "donts": ["5 coisas para não fazer"]
  }
}

INSTRUÇÕES DE CONTEÚDO:
- persona.archetype: Use arquétipos elegantes e aspiracionais
- positioning: Uma frase poderosa que define o diferencial${hasBrands ? " (conecte sutilmente às referências de marca)" : ""}
- creative_directions: signature=identidade visual core, aspirational=elevação da marca, conversion=foco em vendas
- content_system.shotlist: 12 shots práticos e executáveis
- copy_kit.hooks: Ganchos que funcionam em Reels/TikTok, curtos e impactantes
- dos_donts: Regras claras e específicas, não genéricas

Tom geral: Premium, confiante, nunca arrogante. Útil, nunca óbvio.`;
}

async function callAI(
  images: string[],
  isUrls: boolean,
  brandRefs: string[],
  brandInfo: { name: string; category: string; objective: string } | undefined,
  apiKey: string,
  debugId: string
): Promise<{ success: true; data: any } | { success: false; error: string; message: string }> {
  const hasVisual = images.length > 0;
  const hasBrands = brandRefs.length > 0;
  
  const systemPrompt = buildProSystemPrompt(hasVisual, hasBrands, brandRefs, brandInfo);
  
  const userContent: any[] = [];
  
  // Build user message based on input type
  if (hasVisual && hasBrands) {
    userContent.push({
      type: "text",
      text: `Analise estas referências visuais junto com as marcas admiradas (${brandRefs.join(", ")}) e gere o Brand Editorial Kit completo. Mescle as duas fontes de inspiração de forma editorial. Retorne APENAS o JSON.`,
    });
  } else if (hasVisual) {
    userContent.push({
      type: "text",
      text: "Analise estas imagens de referência e gere o Brand Editorial Kit completo. Retorne APENAS o JSON.",
    });
  } else if (hasBrands) {
    userContent.push({
      type: "text",
      text: `Analise o universo das marcas ${brandRefs.join(", ")} e gere um Brand Editorial Kit original inspirado nelas. Retorne APENAS o JSON.`,
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
    console.log(`[${debugId}] Calling AI for Pro editorial (visual: ${hasVisual}, brands: ${hasBrands})...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${debugId}] AI API error: ${response.status} - ${errorText}`);
      return { success: false, error: "ai_error", message: "Não foi possível gerar o editorial. Tente novamente." };
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error(`[${debugId}] No content in AI response`);
      return { success: false, error: "empty_response", message: "Resposta vazia da IA. Tente novamente." };
    }

    const contentText = normalizeModelContent(rawContent);
    console.log(`[${debugId}] AI response length: ${contentText.length}`);

    let parsed: any;
    try {
      parsed = extractJson(contentText);
    } catch (e) {
      console.error(`[${debugId}] JSON parse error:`, e);
      return { success: false, error: "json_parse_error", message: "Erro ao processar resposta. Tente novamente." };
    }

    // Basic structure validation
    if (!parsed.persona || !parsed.positioning || !parsed.brand_codes || !parsed.creative_directions) {
      console.error(`[${debugId}] Incomplete structure`);
      return { success: false, error: "incomplete_structure", message: "Resposta incompleta. Tente novamente." };
    }

    return { success: true, data: parsed };
  } catch (error) {
    console.error(`[${debugId}] AI call exception:`, error);
    return { success: false, error: "network_error", message: "Erro de conexão. Tente novamente." };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const debugId = generateDebugId();
  console.log(`[${debugId}] PRO Editorial request started`);

  try {
    const body = await req.json();
    const { images = [], isUrls = false, brandRefs = [], brandInfo } = body;

    // Validate input - at least one type of reference must be provided
    const hasVisual = Array.isArray(images) && images.length > 0;
    const hasBrands = Array.isArray(brandRefs) && brandRefs.length >= 2;

    if (!hasVisual && !hasBrands) {
      return errorResponse("invalid_input", "Envie referências visuais ou pelo menos 2 marcas.", debugId);
    }

    // If visual references provided, must be exactly 3
    if (hasVisual && images.length !== 3) {
      return errorResponse("invalid_input", "Envie exatamente 3 referências visuais.", debugId);
    }

    // If brand references provided, must be 2-3
    if (hasBrands && (brandRefs.length < 2 || brandRefs.length > 3)) {
      return errorResponse("invalid_input", "Envie 2 a 3 marcas de referência.", debugId);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error(`[${debugId}] Missing LOVABLE_API_KEY`);
      return errorResponse("config_error", "Configuração do servidor incompleta.", debugId);
    }

    // Call AI with retry
    let result = await callAI(images, isUrls, brandRefs, brandInfo, apiKey, debugId);

    // Retry once on failure
    if (!result.success) {
      console.log(`[${debugId}] First attempt failed, retrying...`);
      result = await callAI(images, isUrls, brandRefs, brandInfo, apiKey, debugId);
    }

    if (!result.success) {
      return errorResponse(result.error, result.message, debugId);
    }

    console.log(`[${debugId}] PRO Editorial generated successfully`);

    return new Response(JSON.stringify(result.data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[${debugId}] Request handler error:`, error);
    return errorResponse("server_error", "Erro interno. Tente novamente.", debugId, 500);
  }
});

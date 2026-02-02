// Pro Editorial Types - Brand Editorial Kit (Branding-First)

export interface BrandPersona {
  archetype: string;
  cultural_age: string;
  mental_city: string;
  ambition: string;
  avoidances: string[];
  would_say: string;
  would_never_say: string;
}

export interface BrandCodes {
  visual: {
    palette: string[];
    contrast: "low" | "medium" | "high";
    textures: string[];
    composition: string[];
    light: string;
  };
  verbal: {
    tone: string;
    rhythm: string;
    allowed_words: string[];
    forbidden_words: string[];
  };
}

export interface EditorialDirection {
  type: "signature" | "aspirational" | "conversion";
  title: string;
  visual_mood: string;
  composition: string;
  styling_environment: string;
  usage_context: string;
}

export interface EditorialExample {
  title: string;
  description: string;
}

export interface ProEditorialResult {
  persona: BrandPersona;
  positioning: string;
  brand_codes: BrandCodes;
  editorial_directions?: EditorialDirection[]; // Optional for "essencial" mode
  editorial_example: EditorialExample;
  editorial_closing: string;
}

// Default fallback for errors
export const DEFAULT_PRO_RESULT: ProEditorialResult = {
  persona: {
    archetype: "A Curadora",
    cultural_age: "28-35",
    mental_city: "Paris",
    ambition: "Referência em bom gosto dentro do seu nicho",
    avoidances: ["Exagero", "Ostentação vazia", "Seguir tendências sem critério"],
    would_say: "Menos, mas melhor.",
    would_never_say: "Comprei porque todo mundo tem.",
  },
  positioning: "Para mulheres que preferem investir em peças que contam histórias a seguir o que está na vitrine.",
  brand_codes: {
    visual: {
      palette: ["#F5F5F5", "#2C2C2C", "#D4C4B0", "#8B7355", "#E8E4DF"],
      contrast: "medium",
      textures: ["linho", "algodão orgânico", "couro macio", "seda natural"],
      composition: ["Espaço negativo generoso", "Simetria sutil", "Enquadramento central"],
      light: "Luz natural difusa, golden hour suave, sem flash direto",
    },
    verbal: {
      tone: "Confiante, nunca arrogante. Íntimo sem ser casual.",
      rhythm: "Frases curtas, respiros longos. Pontuação precisa.",
      allowed_words: ["essencial", "atemporal", "curadoria", "intenção", "presença", "silêncio"],
      forbidden_words: ["exclusivo", "imperdível", "corre", "última chance", "promoção", "arrasa"],
    },
  },
  editorial_directions: [
    {
      type: "signature",
      title: "O Uniforme Editado",
      visual_mood: "Minimalismo sofisticado com calor humano",
      composition: "Plano médio, fundo neutro, produto protagonista",
      styling_environment: "Monocromático com textura, ambiente limpo",
      usage_context: "Identidade visual core da marca, comunicações institucionais",
    },
    {
      type: "aspirational",
      title: "A Cidade Mental",
      visual_mood: "Arquitetônico, cinematográfico, aspiracional",
      composition: "Grande angular, linhas de fuga, luz dramática",
      styling_environment: "Oversized com acessório statement, cenário urbano",
      usage_context: "Campanhas sazonais, momentos de elevação da marca",
    },
    {
      type: "conversion",
      title: "O Detalhe Decisivo",
      visual_mood: "Intimista, tátil, focado",
      composition: "Close nos detalhes, mãos presentes, textura visível",
      styling_environment: "Peça-herói isolada, fundo íntimo",
      usage_context: "Lançamentos de produto, momentos de decisão de compra",
    },
  ],
  editorial_example: {
    title: "Campanha Primavera — O Silêncio que Veste",
    description: "Uma série de três imagens capturando o ritual matinal: o café que esfria na xícara enquanto ela escolhe o casaco. Luz de janela. Paleta restrita aos neutros da marca. Nenhum rosto visível — apenas mãos, tecido, e a promessa do dia.",
  },
  editorial_closing: "Marcas não se constroem com palavras demais. Constroem-se com escolhas consistentes, silêncios intencionais, e a coragem de repetir o que funciona. Este editorial não é um manual — é um espelho. Use-o para reconhecer, não para copiar.",
};

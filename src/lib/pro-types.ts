// Pro Editorial Types - Brand Editorial Kit

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
    composition_rules: string[];
  };
  verbal: {
    tone: string;
    rhythm: string;
    allowed_words: string[];
    forbidden_words: string[];
  };
}

export interface CreativeDirection {
  type: "signature" | "aspirational" | "conversion";
  title: string;
  lighting: string;
  framing: string;
  styling: string;
  post_ideas: string[];
}

export interface ContentSystem {
  pillars: string[];
  cadence: string;
  shotlist: string[];
}

export interface CopyKit {
  tagline: string;
  claims: string[];
  hooks: string[];
  captions: string[];
  ctas: string[];
}

export interface DosDonts {
  dos: string[];
  donts: string[];
}

export interface ProEditorialResult {
  persona: BrandPersona;
  positioning: string;
  brand_codes: BrandCodes;
  creative_directions: CreativeDirection[];
  content_system: ContentSystem;
  copy_kit: CopyKit;
  dos_donts: DosDonts;
}

// Default fallback for errors
export const DEFAULT_PRO_RESULT: ProEditorialResult = {
  persona: {
    archetype: "A Curadora",
    cultural_age: "28-35",
    mental_city: "São Paulo",
    ambition: "Referência em bom gosto dentro do seu nicho",
    avoidances: ["Exagero", "Ostentação vazia", "Seguir tendências sem critério"],
    would_say: "Menos, mas melhor.",
    would_never_say: "Comprei porque todo mundo tem.",
  },
  positioning: "Para mulheres que preferem investir em peças que contam histórias a seguir o que está na vitrine.",
  brand_codes: {
    visual: {
      palette: ["#F5F5F5", "#2C2C2C", "#D4C4B0"],
      contrast: "medium",
      textures: ["linho", "algodão orgânico", "couro macio"],
      composition_rules: ["Espaço negativo generoso", "Simetria sutil", "Luz natural"],
    },
    verbal: {
      tone: "Confiante, nunca arrogante",
      rhythm: "Frases curtas, respiros longos",
      allowed_words: ["essencial", "atemporal", "curadoria", "intenção"],
      forbidden_words: ["exclusivo", "imperdível", "corre", "última chance"],
    },
  },
  creative_directions: [
    {
      type: "signature",
      title: "O Uniforme Editado",
      lighting: "Luz natural, golden hour suave",
      framing: "Plano médio, fundo neutro",
      styling: "Monocromático com textura",
      post_ideas: ["Flat lay do look completo", "Detalhe de textura close", "Transição dia-noite"],
    },
    {
      type: "aspirational",
      title: "A Cidade Mental",
      lighting: "Sombras dramáticas, contraste alto",
      framing: "Grande angular, arquitetura presente",
      styling: "Oversized com acessório statement",
      post_ideas: ["Walking shot urbano", "Reflexo em vitrine", "Silhueta editorial"],
    },
    {
      type: "conversion",
      title: "O Close que Vende",
      lighting: "Ring light difuso, sem sombras duras",
      framing: "Close no produto, mãos visíveis",
      styling: "Peça-herói isolada",
      post_ideas: ["Unboxing elegante", "Antes/depois sutil", "3 formas de usar"],
    },
  ],
  content_system: {
    pillars: ["Estilo Pessoal", "Processo Criativo", "Lifestyle Editado"],
    cadence: "4-5 posts/semana: 2 Reels, 2 Stories séries, 1 carrossel",
    shotlist: [
      "Hero look frontal",
      "Detalhe textura",
      "Transição",
      "Flat lay minimalista",
      "POV espelho",
      "Walking urbano",
      "Close acessório",
      "Behind the scenes",
      "Moodboard vivo",
      "Produto isolado",
      "Lifestyle moment",
      "Quote card",
    ],
  },
  copy_kit: {
    tagline: "Estilo editado. Intenção clara.",
    claims: [
      "Menos peças, mais presença.",
      "Curadoria > Quantidade.",
      "O uniforme que você não precisa pensar.",
    ],
    hooks: [
      "O segredo não é ter mais...",
      "Isso muda tudo no seu armário",
      "Por que as francesas acertam sempre?",
      "O detalhe que ninguém nota, mas todo mundo sente",
      "Pare de comprar isso",
      "A peça que salvou meu look",
      "Você não precisa de tendência",
      "Menos scroll, mais intenção",
      "O que eu uso todo dia",
      "Por que isso funciona",
    ],
    captions: [
      "Não é sobre o que está na moda. É sobre o que faz sentido pra você.",
      "Armário editado: menos decisões, mais clareza.",
      "A melhor versão do básico.",
      "Invisto em peças que trabalham por mim.",
      "Estilo é repetição consciente.",
    ],
    ctas: [
      "Salva pra quando for montar o look",
      "Qual peça você editaria primeiro?",
      "Comenta a sua versão",
      "Link na bio pra quem quer começar",
      "Envia pra quem precisa ver isso",
    ],
  },
  dos_donts: {
    dos: [
      "Mostrar processo, não só resultado",
      "Luz natural sempre que possível",
      "Repetir cores da paleta",
      "Pausas visuais entre elementos",
      "Falar como uma amiga bem-vestida",
    ],
    donts: [
      "Filtros que alteram cor de pele",
      "Texto demais no Reel",
      "Trend audio sem fit estético",
      "Fundo poluído ou desordenado",
      "Urgência artificial (corre, últimas!)",
    ],
  },
};

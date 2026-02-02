// B2C Brand Editorial Types (for founders/small businesses)

export interface BrandPersonaLight {
  archetype: string;
  cultural_age: string;
  mental_city: string;
  essence: string;
}

export interface VisualBrandCodes {
  palette_hex: string[];
  contrast: "low" | "medium" | "high";
  textures: string[];
  composition: string[];
}

export interface EditorialDirection {
  type: "signature" | "aspirational" | "conversion";
  title: string;
  description: string;
  visual_cues: string[];
}

export interface MiniContentSystem {
  pillars: string[];
  cadence: string;
  quick_wins: string[];
}

export interface BrandProfile {
  category: string;
  objective: string;
  persona: BrandPersonaLight;
  visual_codes: VisualBrandCodes;
}

export interface BrandEditorial {
  headline: string;
  positioning: string;
  directions: EditorialDirection[];
  content_system: MiniContentSystem;
  footer_note: string;
}

export interface EditorialResult {
  profile: BrandProfile;
  editorial: BrandEditorial;
}

export interface SavedResult {
  id: string;
  timestamp: number;
  result: EditorialResult;
  preferences: UserPreferences;
}

export interface UserPreferences {
  brandName: string;
  category: string;
  objective: string;
}

// Brand categories
export const BRAND_CATEGORIES = [
  { id: "moda", label: "Moda" },
  { id: "beleza", label: "Beleza" },
  { id: "joias", label: "Joias" },
  { id: "food", label: "Food & Drink" },
  { id: "wellness", label: "Wellness" },
  { id: "design", label: "Design" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "tech", label: "Tech" },
] as const;

export const BRAND_OBJECTIVES = [
  { id: "consistencia", label: "Consistência" },
  { id: "reposicionamento", label: "Reposicionamento" },
  { id: "conversao", label: "Conversão" },
  { id: "lancamento", label: "Lançamento" },
] as const;

// Default/fallback result
export const DEFAULT_RESULT: EditorialResult = {
  profile: {
    category: "lifestyle",
    objective: "consistencia",
    persona: {
      archetype: "A Curadora",
      cultural_age: "28-35",
      mental_city: "São Paulo",
      essence: "Menos, mas melhor.",
    },
    visual_codes: {
      palette_hex: ["#F5F5F5", "#2C2C2C", "#D4C4B0", "#8B7355", "#E8E4DF"],
      contrast: "medium",
      textures: ["linho", "algodão", "couro macio"],
      composition: ["Espaço negativo generoso", "Simetria sutil", "Luz natural"],
    },
  },
  editorial: {
    headline: "Editorial em Construção",
    positioning: "Para quem prefere investir em clareza a seguir tendências.",
    directions: [
      {
        type: "signature",
        title: "O Essencial",
        description: "Identidade visual core da marca.",
        visual_cues: ["Luz natural", "Fundo neutro", "Produto isolado"],
      },
      {
        type: "aspirational",
        title: "A Referência",
        description: "Elevação e desejo.",
        visual_cues: ["Composição editorial", "Contraste dramático", "Contexto aspiracional"],
      },
      {
        type: "conversion",
        title: "O Detalhe",
        description: "Foco em venda e ação.",
        visual_cues: ["Close no produto", "Clareza máxima", "CTA visual"],
      },
    ],
    content_system: {
      pillars: ["Produto", "Processo", "Lifestyle"],
      cadence: "3-4 posts/semana",
      quick_wins: [
        "Flat lay minimalista",
        "Behind the scenes",
        "Detalhe de produto",
      ],
    },
    footer_note: "Este é um resultado parcial. Tente novamente com outras referências.",
  },
};

// Legacy type mappings for backwards compatibility
export interface MakeupStep {
  base: string;
  cheeks: string;
  eyes: string;
  lips: string;
}

export interface Outfit {
  title: string;
  hero: string;
  supporting: string[];
  accessory: string;
  caption: string;
}

export interface Fragrance {
  direction: string;
  affordable: string;
  mid: string;
  premium: string;
}

// Aesthetic display name mapping (kept for Pro)
export const AESTHETIC_NAMES: Record<string, string> = {
  clean_glow: "Brilho Limpo",
  minimal_chic: "Minimalista Chique",
  romantic_modern: "Romântica Atual",
  after_dark_minimal: "Noite Precisa",
  soft_grunge: "Grunge Suave",
  street_sporty: "Street Esportivo",
  color_pop: "Cor em Destaque",
  boho_updated: "Boho Urbano",
  classic_luxe: "Clássica Luxo",
  coastal_cool: "Litoral Refinado",
  soft_glam: "Glam Polido",
  artsy_eclectic: "Artística Mix",
};

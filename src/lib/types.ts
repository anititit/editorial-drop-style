// Editorial Result Types

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

export interface Profile {
  aesthetic_primary: string;
  aesthetic_secondary: string;
  confidence: number;
  palette_hex: string[];
  contrast: "low" | "medium" | "high";
  textures: string[];
  silhouettes: string[];
  makeup_finish: string[];
  fragrance_family: string[];
  vibe_keywords: string[];
  why_this: string[];
}

export interface Editorial {
  headline: string;
  dek: string;
  outfits: Outfit[];
  makeup: {
    day: MakeupStep;
    night: MakeupStep;
  };
  fragrance: Fragrance;
  footer_note: string;
}

export interface EditorialResult {
  profile: Profile;
  editorial: Editorial;
}

export interface SavedResult {
  id: string;
  timestamp: number;
  result: EditorialResult;
  preferences: UserPreferences;
}

export interface UserPreferences {
  occasion: string;
  priceRange: string;
  region: string;
  fragranceIntensity: string;
}

// Aesthetic display name mapping
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

// Default/fallback result
export const DEFAULT_RESULT: EditorialResult = {
  profile: {
    aesthetic_primary: "minimal_chic",
    aesthetic_secondary: "clean_glow",
    confidence: 0,
    palette_hex: ["#F5F5F5", "#2C2C2C", "#D4C4B0"],
    contrast: "medium",
    textures: ["algodão", "linho", "seda"],
    silhouettes: ["reto", "oversized"],
    makeup_finish: ["satin"],
    fragrance_family: ["fresh"],
    vibe_keywords: ["elegante", "simples", "atemporal"],
    why_this: ["Baseado nas suas referências visuais."],
  },
  editorial: {
    headline: "Editorial em Construção",
    dek: "Não foi possível gerar o editorial completo.",
    outfits: [
      {
        title: "Look 01",
        hero: "Peça não identificada",
        supporting: ["Item de apoio"],
        accessory: "Acessório simples",
        caption: "Um look para explorar.",
      },
      {
        title: "Look 02",
        hero: "Peça não identificada",
        supporting: ["Item de apoio"],
        accessory: "Acessório simples",
        caption: "Um look para explorar.",
      },
      {
        title: "Look 03",
        hero: "Peça não identificada",
        supporting: ["Item de apoio"],
        accessory: "Acessório simples",
        caption: "Um look para explorar.",
      },
    ],
    makeup: {
      day: {
        base: "Base leve",
        cheeks: "Blush natural",
        eyes: "Máscara preta",
        lips: "Gloss transparente",
      },
      night: {
        base: "Base média cobertura",
        cheeks: "Contorno suave",
        eyes: "Delineado clássico",
        lips: "Batom nude",
      },
    },
    fragrance: {
      direction: "Notas frescas e leves",
      affordable: "Perfume acessível",
      mid: "Perfume intermediário",
      premium: "Perfume premium",
    },
    footer_note: "Este é um resultado parcial. Tente novamente com outras imagens.",
  },
};

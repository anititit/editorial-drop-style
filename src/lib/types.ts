// B2C Personal Aesthetic Identity Types (people-focused)

export interface AestheticProfile {
  aesthetic_primary: string;
  aesthetic_secondary: string;
  confidence: number;
  palette_hex: string[];
  contrast: "low" | "medium" | "high";
  textures: string[];
  silhouettes: string[];
  makeup_finish: string;
  fragrance_family: string;
  why_this: string[];
}

export interface ConceptualLook {
  title: string;
  hero_piece: string;
  supporting: string[];
  accessory: string;
  caption: string;
}

export interface MakeupRecommendation {
  base: string;
  cheeks: string;
  eyes: string;
  lips: string;
}

export interface FragranceSuggestion {
  name: string;
  notes: string;
  tier: "accessible" | "mid" | "premium";
}

export interface PersonalEditorial {
  headline: string;
  dek: string;
  looks: ConceptualLook[];
  makeup_day: MakeupRecommendation;
  makeup_night: MakeupRecommendation;
  fragrances: FragranceSuggestion[];
  footer_note: string;
}

export interface EditorialResult {
  profile: AestheticProfile;
  editorial: PersonalEditorial;
}

export interface SavedResult {
  id: string;
  timestamp: number;
  result: EditorialResult;
}

// Default/fallback result
export const DEFAULT_RESULT: EditorialResult = {
  profile: {
    aesthetic_primary: "Minimalista Chique",
    aesthetic_secondary: "Romântica Atual",
    confidence: 0.85,
    palette_hex: ["#F5F5F5", "#2C2C2C", "#D4C4B0", "#8B7355", "#E8E4DF"],
    contrast: "medium",
    textures: ["linho", "algodão orgânico", "couro macio"],
    silhouettes: ["oversized estruturado", "midi fluido", "cropped equilibrado"],
    makeup_finish: "pele natural com brilho sutil",
    fragrance_family: "amadeirado floral",
    why_this: [
      "Paleta neutra com toques terrosos indica sofisticação discreta",
      "Texturas orgânicas sugerem conforto com elegância",
      "Contraste médio revela equilíbrio entre statement e sutileza",
    ],
  },
  editorial: {
    headline: "Seu Estilo, Editado",
    dek: "Uma leitura estética que traduz suas referências em linguagem de moda.",
    looks: [
      {
        title: "Look Dia",
        hero_piece: "Blazer oversized em linho cru",
        supporting: ["T-shirt branca básica", "Calça wide leg creme"],
        accessory: "Bolsa estruturada em couro tan",
        caption: "Elegância descomplicada para o cotidiano.",
      },
      {
        title: "Look Transição",
        hero_piece: "Vestido midi em crepe com fenda lateral",
        supporting: ["Sandália de tiras finas", "Brincos dourados discretos"],
        accessory: "Clutch em palha natural",
        caption: "Do escritório ao jantar sem esforço.",
      },
      {
        title: "Look Noite",
        hero_piece: "Conjunto de alfaiataria em tom terra",
        supporting: ["Camiseta de seda", "Salto bloco nude"],
        accessory: "Ear cuff dourado",
        caption: "Sofisticação com personalidade.",
      },
    ],
    makeup_day: {
      base: "Base leve com acabamento natural",
      cheeks: "Blush pêssego em creme",
      eyes: "Máscara preta + sobrancelhas penteadas",
      lips: "Lip oil rosado",
    },
    makeup_night: {
      base: "Base média com iluminador nos pontos altos",
      cheeks: "Contorno suave + blush terracota",
      eyes: "Delineado gatinho fino + sombra bronze",
      lips: "Batom nude rosado matte",
    },
    fragrances: [
      { name: "Santal 33 (Le Labo)", notes: "Sândalo, íris, couro", tier: "premium" },
      { name: "Flowerbomb Nectar (Viktor&Rolf)", notes: "Floral intenso", tier: "mid" },
      { name: "Natura Essencial (Natura)", notes: "Amadeirado fresco", tier: "accessible" },
    ],
    footer_note: "Este é um resultado parcial. Tente novamente com outras referências.",
  },
};

// Legacy type mappings for backwards compatibility (PRO flow)
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

// PRO-only: Brand categories (kept separate from B2C)
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

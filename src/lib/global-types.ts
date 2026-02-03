// Global Studio (English) Types

export interface GlobalPersona {
  archetype: string;
  mental_city: string;
  ambition: string;
  would_say: string;
  would_never_say: string;
}

export interface GlobalVisualCodes {
  palette: string[];
  contrast: "low" | "medium" | "high";
  textures: string[];
  composition: string[];
  light: string;
}

export interface GlobalVerbalCodes {
  tone: string;
  rhythm: string;
  allowed_words: string[];
  forbidden_words: string[];
}

export interface GlobalBrandCodes {
  visual: GlobalVisualCodes;
  verbal: GlobalVerbalCodes;
}

export interface GlobalConceptualLook {
  title: string;
  hero_piece: string;
  supporting: string[];
  accessory: string;
  caption: string;
}

export interface GlobalMakeupRecommendation {
  base: string;
  cheeks: string;
  eyes: string;
  lips: string;
}

export interface GlobalFragranceSuggestion {
  name: string;
  notes: string;
  price_tier: "affordable" | "mid" | "premium";
  why_it_matches: string;
}

export type GlobalPriceLane = "Affordable" | "Mid-range" | "Premium";

export interface GlobalShortlistItem {
  category: "Hero" | "Supporting" | "Beauty" | "Scent" | "Wildcard";
  item_name: string;
  price_lane: GlobalPriceLane;
  rationale: string;
}

export interface GlobalLookRecipe {
  formula: string;
}

export interface GlobalCommerce {
  shortlist: GlobalShortlistItem[];
  look_recipes: GlobalLookRecipe[];
  search_terms: string[];
}

export interface GlobalStudioResult {
  persona: GlobalPersona;
  positioning: string;
  brand_codes: GlobalBrandCodes;
  why_it_works: string[];
  looks?: GlobalConceptualLook[];
  makeup?: GlobalMakeupRecommendation;
  fragrances?: GlobalFragranceSuggestion[];
  commerce: GlobalCommerce;
  closing_note: string;
}

export const DEFAULT_GLOBAL_RESULT: GlobalStudioResult = {
  persona: {
    archetype: "The Curator",
    mental_city: "Copenhagen",
    ambition: "To represent refined simplicity",
    would_say: "Less, but better.",
    would_never_say: "More is more.",
  },
  positioning: "Quiet confidence for the modern creative.",
  brand_codes: {
    visual: {
      palette: ["#F5F5F5", "#2C2C2C", "#D4C4B0", "#8B7355", "#E8E4DF"],
      contrast: "medium",
      textures: ["linen", "organic cotton", "soft leather"],
      composition: ["centered subjects", "negative space", "natural light"],
      light: "soft, diffused, warm undertones",
    },
    verbal: {
      tone: "confident, restrained, editorial",
      rhythm: "short sentences, intentional pauses",
      allowed_words: ["refined", "intentional", "curated", "essential", "elevated"],
      forbidden_words: ["trendy", "must-have", "exclusive", "luxury", "influencer"],
    },
  },
  why_it_works: [
    "Neutral palette signals sophistication without effort",
    "Organic textures suggest comfort with elegance",
    "Medium contrast reveals balance between statement and subtlety",
  ],
  commerce: {
    shortlist: [
      { category: "Hero", item_name: "Structured neutral blazer", price_lane: "Mid-range", rationale: "Anchors the wardrobe with versatile elegance" },
      { category: "Supporting", item_name: "Wide-leg linen trousers", price_lane: "Affordable", rationale: "Fluidity that balances structured pieces" },
      { category: "Beauty", item_name: "Illuminating serum with hyaluronic acid", price_lane: "Mid-range", rationale: "Effortless luminous skin" },
      { category: "Scent", item_name: "Woody aromatic candle", price_lane: "Premium", rationale: "Atmosphere that translates the identity" },
      { category: "Wildcard", item_name: "Leather-bound notebook", price_lane: "Affordable", rationale: "Intention in every detail" },
    ],
    look_recipes: [
      { formula: "Oversized blazer + slip dress midi + leather loafers" },
      { formula: "Textured knit + wide-leg jeans + strappy sandals" },
      { formula: "Linen shirt + tailored trousers + minimal sneakers" },
    ],
    search_terms: ["quiet luxury", "minimal chic", "oversized linen", "earthy palette", "natural texture", "relaxed tailoring"],
  },
  closing_note: "Direction, not decoration. This is the starting point.",
};

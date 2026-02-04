// Capsule Wardrobe Types

export interface CapsuleMissingItem {
  item: string;
  priority: number;
  why: string;
}

export interface CapsuleTopThreeItem {
  priority: "P1" | "P2" | "P3";
  item: string;
  impact: string;
}

export interface CapsuleResult {
  covered: string[];
  missing: CapsuleMissingItem[];
  top_three: CapsuleTopThreeItem[];
  edit_rule: string;
}

export interface CapsuleApiResponse {
  success: boolean;
  capsule: CapsuleResult;
  aesthetic_id: string;
  debug_id: string;
}

// Aesthetic definitions
export interface CapsuleAesthetic {
  id: string;
  name: string;
  description: string;
}

export const CAPSULE_AESTHETICS: CapsuleAesthetic[] = [
  {
    id: "clean_glow",
    name: "Glow limpo",
    description: "Pele luminosa, minimalismo fresco, presença leve.",
  },
  {
    id: "minimal_chic",
    name: "Minimal chic",
    description: "Cortes precisos, neutros sofisticados, menos, melhor.",
  },
  {
    id: "romantic_modern",
    name: "Romântico moderno",
    description: "Suavidade com estrutura, feminilidade atual, gesto delicado.",
  },
  {
    id: "after_dark_minimal",
    name: "Minimal noturno",
    description: "Alto contraste, linhas limpas, noite polida.",
  },
  {
    id: "soft_grunge",
    name: "Grunge suave",
    description: "Texturas vividas, preto lavado, charme sem esforço.",
  },
  {
    id: "street_sporty",
    name: "Street sporty",
    description: "Energia urbana, peças utilitárias, conforto com intenção.",
  },
  {
    id: "color_pop",
    name: "Cor em destaque",
    description: "Paleta ousada, impacto controlado, statement inteligente.",
  },
  {
    id: "boho_updated",
    name: "Boho polido",
    description: "Fluidez, naturalidade, boho com acabamento.",
  },
  {
    id: "classic_luxe",
    name: "Clássico luxo",
    description: "Ícones atemporais, materiais nobres, elegância óbvia.",
  },
  {
    id: "coastal_cool",
    name: "Coastal cool",
    description: "Natural, claro, textura orgânica, refinamento relaxado.",
  },
  {
    id: "soft_glam",
    name: "Glam suave",
    description: "Polido, brilho sutil, beleza pronta para a câmera.",
  },
  {
    id: "artsy_eclectic",
    name: "Artsy eclético",
    description: "Combinações inesperadas, repertório criativo, assinatura própria.",
  },
];

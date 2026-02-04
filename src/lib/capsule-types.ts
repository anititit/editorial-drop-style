// Capsule Wardrobe Types for B2C Flow

export interface CapsulePreferences {
  existing: string[];          // Q1: what they already have
  palette: string;             // Q2: current palette
  silhouette: string;          // Q3: common silhouette
  exclusions: string[];        // Q4: what to avoid (optional)
  context: string;             // Q5: main usage context (optional)
  investment: string;          // Q6: investment level (optional)
}

export interface CapsuleResult {
  aligned: string[];           // 3 bullets - what's already aligned
  missing_prioritized: {       // 5-7 items with priority
    priority: number;
    item: string;
  }[];
  smart_investments: {
    hero: string;              // Most impactful missing piece
    supporting: string[];      // 2 supporting items
  };
}

// Quiz options configuration
export const CAPSULE_QUIZ = {
  existing: {
    label: "O que já existe na sua cápsula hoje?",
    multi: true,
    required: true,
    options: [
      { id: "alfaiataria", label: "alfaiataria (blazer/calça)" },
      { id: "denim", label: "denim" },
      { id: "vestidos", label: "vestidos/slip" },
      { id: "malharia", label: "malharia/tricô" },
      { id: "basicos", label: "básicos (camisetas/regatas)" },
      { id: "sapatos", label: "sapatos (bota/loafer/salto/sneaker)" },
      { id: "bolsas", label: "bolsas" },
      { id: "joias", label: "joias/acessórios" },
      { id: "beleza", label: "beleza (batom/olhos/pele)" },
      { id: "fragrancia", label: "fragrância" },
    ],
  },
  palette: {
    label: "Sua paleta hoje é mais…",
    multi: false,
    required: true,
    options: [
      { id: "neutros_claros", label: "neutros claros" },
      { id: "neutros_escuros", label: "neutros escuros" },
      { id: "terrosos", label: "terrosos" },
      { id: "frios", label: "tons frios (cinza/azul)" },
      { id: "quentes", label: "tons quentes (bege/dourado)" },
      { id: "misturada", label: "misturada" },
    ],
  },
  silhouette: {
    label: "Sua silhueta mais comum é…",
    multi: false,
    required: true,
    options: [
      { id: "reta", label: "reta/alfaiataria" },
      { id: "oversized", label: "oversized" },
      { id: "marcada", label: "marcada (cintura/ombro)" },
      { id: "slip", label: "slip/fluida" },
      { id: "street", label: "street/utility" },
    ],
  },
  exclusions: {
    label: "O que não entra nesse edit?",
    multi: true,
    required: false,
    options: [
      { id: "estampado", label: "muito estampado" },
      { id: "colorido", label: "muito colorido" },
      { id: "romantico", label: "muito romântico" },
      { id: "sensual", label: "muito sensual" },
      { id: "basico", label: "muito básico" },
      { id: "esportivo", label: "muito esportivo" },
    ],
  },
  context: {
    label: "Onde você mais usa?",
    multi: false,
    required: false,
    options: [
      { id: "trabalho", label: "trabalho" },
      { id: "fds", label: "fim de semana" },
      { id: "noite", label: "noite" },
      { id: "social", label: "social" },
      { id: "misto", label: "misto" },
    ],
  },
  investment: {
    label: "Nível de investimento agora",
    multi: false,
    required: false,
    options: [
      { id: "acessivel", label: "acessível" },
      { id: "medio", label: "médio" },
      { id: "premium", label: "premium" },
      { id: "misto", label: "misto" },
    ],
  },
} as const;

export const DEFAULT_CAPSULE_PREFERENCES: CapsulePreferences = {
  existing: [],
  palette: "",
  silhouette: "",
  exclusions: [],
  context: "",
  investment: "",
};

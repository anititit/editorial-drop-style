// Capsule Input Normalizer
// Converts brand names and slang to generic, editorial descriptions

export interface NormalizedItems {
  normalized: string[];
  notes?: string[];
}

// Brand-to-generic mappings (case-insensitive matching)
const BRAND_MAPPINGS: Record<string, string> = {
  // Sneakers
  "vans": "tênis branco casual, sola reta",
  "air force": "tênis branco robusto, casual",
  "airforce": "tênis branco robusto, casual",
  "af1": "tênis branco robusto, casual",
  "converse": "tênis de lona, cano baixo",
  "all star": "tênis de lona, cano baixo",
  "allstar": "tênis de lona, cano baixo",
  "adidas samba": "tênis retrô de perfil baixo",
  "samba": "tênis retrô de perfil baixo",
  "nike": "tênis esportivo casual",
  "adidas": "tênis esportivo casual",
  "new balance": "tênis esportivo casual",
  "nb": "tênis esportivo casual",
  "puma": "tênis esportivo casual",
  "reebok": "tênis esportivo casual",
  "asics": "tênis esportivo casual",
  "jordan": "tênis esportivo alto",
  
  // Fast fashion (remove brand, keep type)
  "zara": "",
  "shein": "",
  "h&m": "",
  "hm": "",
  "forever 21": "",
  "forever21": "",
  "renner": "",
  "c&a": "",
  "cea": "",
  "riachuelo": "",
  "marisa": "",
  "lojas marisa": "",
  
  // Beauty brands
  "sephora": "",
  "mac": "",
  "m.a.c": "",
  "dior": "",
  "chanel": "",
  "ysl": "",
  "nars": "",
  "urban decay": "",
  "fenty": "",
  "rare beauty": "",
  "charlotte tilbury": "",
  "bobbi brown": "",
  "clinique": "",
  "lancome": "",
  "lancôme": "",
  "o boticário": "",
  "boticário": "",
  "natura": "",
  "eudora": "",
  "avon": "",
  "mary kay": "",
  "maybelline": "",
  "revlon": "",
  "loreal": "",
  "l'oreal": "",
  
  // Luxury brands (remove, keep type)
  "gucci": "",
  "prada": "",
  "louis vuitton": "",
  "lv": "",
  "balenciaga": "",
  "bottega": "",
  "bottega veneta": "",
  "burberry": "",
  "versace": "",
  "valentino": "",
  "celine": "",
  "céline": "",
  "saint laurent": "",
  "hermès": "",
  "hermes": "",
  "fendi": "",
  "miu miu": "",
  "loewe": "",
  "coach": "",
  "michael kors": "",
  "kate spade": "",
  "tory burch": "",
  
  // Brazilian brands
  "arezzo": "",
  "schutz": "",
  "santa lolla": "",
  "anacapri": "",
  "farm": "",
  "animale": "",
  "le lis": "",
  "le lis blanc": "",
  "maria filó": "",
  "maria filo": "",
  "shoulder": "",
  "mixed": "",
  "bo.bô": "",
  "bobo": "",
  "bo bo": "",
  "osklen": "",
  "ateen": "",
};

// Slang/shorthand normalization
const SLANG_MAPPINGS: Record<string, string> = {
  "shorts jeans": "short de denim",
  "short jeans": "short de denim",
  "calça alfaiataria": "calça reta de alfaiataria",
  "calca alfaiataria": "calça reta de alfaiataria",
  "camisa social": "camisa de botão, corte limpo",
  "blusinha": "top leve, alça fina",
  "blusinha básica": "top leve, alça fina",
  "bota cano curto": "bota de cano curto, couro liso",
  "bolsa pequena": "bolsa pequena estruturada",
  "bolsinha": "bolsa pequena estruturada",
  "cropped": "top cropped",
  "croppedzinho": "top cropped",
  "legging": "legging de lycra",
  "moletom": "moletom de algodão, corte relaxado",
  "jaqueta jeans": "jaqueta de denim",
  "calça legging": "legging de lycra",
  "sapatênis": "tênis casual de perfil baixo",
  "sapato social": "oxford de couro",
  "rasteirinha": "sandália rasteira, tiras finas",
  "chinelo": "slide casual",
  "tamanco": "mule de salto bloco",
  "meia calça": "meia-calça fina",
  "brinco argola": "argola dourada",
  "brinco de argola": "argola dourada",
  "colar corrente": "corrente de elos",
  "relogio": "relógio de pulso, pulseira metálica",
  "relógio": "relógio de pulso, pulseira metálica",
  "oculos": "óculos de sol",
  "óculos": "óculos de sol",
  "bone": "boné de aba curva",
  "boné": "boné de aba curva",
  "bucket": "bucket hat",
  "bucket hat": "chapéu bucket",
};

// Color normalization
const COLOR_MAPPINGS: Record<string, string> = {
  "branco": "off-white",
  "off white": "off-white",
  "offwhite": "off-white",
  "creme": "off-white",
  "bege": "bege",
  "nude": "bege",
  "caramelo": "caramelo",
  "marrom": "marrom",
  "café": "marrom",
  "preto": "preto",
  "cinza": "cinza",
  "azul marinho": "azul-marinho",
  "marinho": "azul-marinho",
  "navy": "azul-marinho",
  "jeans claro": "denim claro",
  "jeans escuro": "denim escuro",
  "jeans médio": "denim médio",
  "verde militar": "verde-oliva",
  "verde oliva": "verde-oliva",
  "bordô": "burgundy",
  "bordo": "burgundy",
  "vinho": "burgundy",
  "rosa": "rosa",
  "rosa claro": "rosa-pálido",
  "rosa bebê": "rosa-pálido",
  "vermelho": "vermelho",
  "laranja": "terracota",
  "terracota": "terracota",
  "amarelo": "mostarda",
  "mostarda": "mostarda",
  "dourado": "dourado",
  "prata": "prata",
  "metalizado": "metalizado",
};

// Remove emojis from text
function removeEmojis(text: string): string {
  return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F000}-\u{1F02F}]/gu, '').trim();
}

// Split input into individual items
function splitItems(text: string): string[] {
  return text
    .split(/[,;|\n]+/)
    .map(item => removeEmojis(item.trim()))
    .filter(item => item.length > 0);
}

// Check if a word/phrase is a known brand
function findBrandMatch(text: string): { brand: string; replacement: string } | null {
  const lowerText = text.toLowerCase();
  
  // Sort by length (longest first) to match multi-word brands first
  const sortedBrands = Object.keys(BRAND_MAPPINGS).sort((a, b) => b.length - a.length);
  
  for (const brand of sortedBrands) {
    if (lowerText.includes(brand)) {
      return { brand, replacement: BRAND_MAPPINGS[brand] };
    }
  }
  return null;
}

// Remove brand from item and keep the rest
function removeBrandKeepType(item: string, brand: string): string {
  const regex = new RegExp(brand, 'gi');
  return item.replace(regex, '').trim().replace(/\s+/g, ' ');
}

// Apply slang normalization
function normalizeSlang(item: string): string {
  const lowerItem = item.toLowerCase();
  
  // Sort by length (longest first) for multi-word matches
  const sortedSlang = Object.keys(SLANG_MAPPINGS).sort((a, b) => b.length - a.length);
  
  for (const slang of sortedSlang) {
    if (lowerItem.includes(slang)) {
      // Replace slang with normalized version
      const regex = new RegExp(slang, 'gi');
      return item.replace(regex, SLANG_MAPPINGS[slang]);
    }
  }
  return item;
}

// Normalize colors in text
function normalizeColors(item: string): string {
  let result = item;
  const lowerItem = item.toLowerCase();
  
  // Sort by length (longest first)
  const sortedColors = Object.keys(COLOR_MAPPINGS).sort((a, b) => b.length - a.length);
  
  for (const color of sortedColors) {
    if (lowerItem.includes(color)) {
      const regex = new RegExp(color, 'gi');
      result = result.replace(regex, COLOR_MAPPINGS[color]);
      break; // Only replace one color per item
    }
  }
  return result;
}

// Capitalize first letter for pt-BR output
function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Clean up extra spaces and punctuation
function cleanupText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/,\s*,/g, ',')
    .replace(/^\s*,\s*/, '')
    .replace(/\s*,\s*$/, '')
    .replace(/\s*,\s*/g, ', ')
    .trim();
}

// Main normalization function
export function normalizeOwnedItems(text: string): NormalizedItems {
  if (!text || text.trim().length === 0) {
    return { normalized: [], notes: ["Input vazio"] };
  }

  const items = splitItems(text);
  const normalized: string[] = [];
  const notes: string[] = [];

  for (const item of items) {
    if (item.length < 2) continue;
    
    let processedItem = item;
    
    // 1. Check for brand matches
    const brandMatch = findBrandMatch(processedItem);
    if (brandMatch) {
      if (brandMatch.replacement) {
        // Brand has specific replacement (like Vans -> tênis branco casual)
        // Check if there are additional qualifiers to keep
        const remainingText = removeBrandKeepType(processedItem, brandMatch.brand);
        if (remainingText.length > 2) {
          // Merge replacement with remaining qualifiers
          processedItem = `${brandMatch.replacement}, ${remainingText}`;
        } else {
          processedItem = brandMatch.replacement;
        }
      } else {
        // Brand should just be removed (like Zara, Shein)
        processedItem = removeBrandKeepType(processedItem, brandMatch.brand);
        if (processedItem.length < 2) {
          notes.push(`Item ignorado: apenas marca sem tipo`);
          continue;
        }
      }
    }
    
    // 2. Apply slang normalization
    processedItem = normalizeSlang(processedItem);
    
    // 3. Normalize colors
    processedItem = normalizeColors(processedItem);
    
    // 4. Cleanup
    processedItem = cleanupText(processedItem);
    
    // 5. Capitalize for editorial output
    if (processedItem.length > 2) {
      normalized.push(capitalizeFirst(processedItem));
    }
  }

  // Deduplicate while preserving order
  const uniqueNormalized = [...new Set(normalized)];

  return {
    normalized: uniqueNormalized,
    notes: notes.length > 0 ? notes : undefined,
  };
}

// Check if input has enough recognizable items
export function hasMinimumItems(normalized: string[], minItems: number = 2): boolean {
  return normalized.length >= minItems;
}

// Get prompt for insufficient items
export function getInsufficientItemsMessage(): string {
  return "Você pode citar 3 a 6 peças, mesmo básicas, para eu fechar a cápsula com precisão.";
}

// Re-normalize output from AI to ensure no brands slipped through
export function sanitizeOutputItems(items: string[]): string[] {
  return items.map(item => {
    let sanitized = item;
    
    // Check and remove any brand that might have slipped through
    const brandMatch = findBrandMatch(sanitized);
    if (brandMatch) {
      if (brandMatch.replacement) {
        sanitized = brandMatch.replacement;
      } else {
        sanitized = removeBrandKeepType(sanitized, brandMatch.brand);
      }
    }
    
    return cleanupText(capitalizeFirst(sanitized));
  }).filter(item => item.length > 2);
}

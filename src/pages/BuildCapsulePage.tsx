import { motion } from "framer-motion";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import BrazilNav from "@/components/BrazilNav";
import GlobalNav from "@/components/GlobalNav";
import { Footer } from "@/components/Footer";
import { useState, useMemo } from "react";
import { getResultById } from "@/lib/storage";
import { AestheticProfile, PersonalEditorial, AESTHETIC_NAMES } from "@/lib/types";

interface CapsuleItem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
}

interface CapsuleCategory {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  items: CapsuleItem[];
}

// Generate personalized capsule items based on profile
function generatePersonalizedCapsule(
  profile: AestheticProfile | null,
  editorial: PersonalEditorial | null,
  isEnglish: boolean
): CapsuleCategory[] {
  const textures = profile?.textures || ["linho", "algodão", "couro"];
  const silhouettes = profile?.silhouettes || ["oversized", "midi", "estruturado"];
  const aestheticPrimary = profile?.aesthetic_primary || "Minimalista Chique";
  const contrast = profile?.contrast || "medium";
  
  // Get hero pieces from looks
  const heroPieces = editorial?.looks?.map(look => look.hero_piece) || [];
  const accessories = editorial?.looks?.map(look => look.accessory) || [];
  
  // Commerce items if available
  const shortlistItems = editorial?.commerce?.shortlist || [];
  
  return [
    {
      id: "essentials",
      name: "Essenciais",
      nameEn: "Essentials",
      description: `Peças atemporais em ${textures.slice(0, 2).join(" e ")}`,
      descriptionEn: `Timeless pieces in ${textures.slice(0, 2).join(" and ")}`,
      icon: "◯",
      items: [
        {
          id: "essential-1",
          name: shortlistItems.find(i => i.category === "Hero")?.item_name || `Blazer em ${textures[0] || "linho"}`,
          nameEn: shortlistItems.find(i => i.category === "Hero")?.item_name || `Blazer in ${textures[0] || "linen"}`,
          description: "Peça-âncora do guarda-roupa",
          descriptionEn: "Wardrobe anchor piece"
        },
        {
          id: "essential-2",
          name: heroPieces[0] || `Top em ${textures[1] || "algodão orgânico"}`,
          nameEn: heroPieces[0] || `Top in ${textures[1] || "organic cotton"}`,
          description: "Base versátil para composições",
          descriptionEn: "Versatile base for compositions"
        },
        {
          id: "essential-3",
          name: `Calça ${silhouettes[0] || "wide leg"} neutra`,
          nameEn: `Neutral ${silhouettes[0] || "wide leg"} pants`,
          description: "Silhueta que define seu estilo",
          descriptionEn: "Silhouette that defines your style"
        },
        {
          id: "essential-4",
          name: shortlistItems.find(i => i.category === "Supporting")?.item_name || "Camisa clássica em tom neutro",
          nameEn: shortlistItems.find(i => i.category === "Supporting")?.item_name || "Classic shirt in neutral tone",
          description: "Elegância atemporal",
          descriptionEn: "Timeless elegance"
        },
        {
          id: "essential-5",
          name: `Tricot texturizado em ${textures[2] || "cashmere"}`,
          nameEn: `Textured knit in ${textures[2] || "cashmere"}`,
          description: "Conforto sofisticado",
          descriptionEn: "Sophisticated comfort"
        }
      ]
    },
    {
      id: "statement",
      name: "Peças Statement",
      nameEn: "Statement Pieces",
      description: `Itens que expressam ${aestheticPrimary}`,
      descriptionEn: `Items that express ${AESTHETIC_NAMES[aestheticPrimary] || aestheticPrimary}`,
      icon: "◆",
      items: [
        {
          id: "statement-1",
          name: heroPieces[2] || `Vestido ${silhouettes[1] || "midi"} em cor statement`,
          nameEn: heroPieces[2] || `${silhouettes[1] || "Midi"} dress in statement color`,
          description: "Presença imediata",
          descriptionEn: "Immediate presence"
        },
        {
          id: "statement-2",
          name: `Conjunto de alfaiataria ${contrast === "high" ? "contrastante" : "tonal"}`,
          nameEn: `${contrast === "high" ? "Contrasting" : "Tonal"} tailored set`,
          description: "Sofisticação com personalidade",
          descriptionEn: "Sophistication with personality"
        },
        {
          id: "statement-3",
          name: heroPieces[1] || "Peça de transição com detalhe especial",
          nameEn: heroPieces[1] || "Transition piece with special detail",
          description: "Do dia à noite sem esforço",
          descriptionEn: "Day to night effortlessly"
        }
      ]
    },
    {
      id: "accessories",
      name: "Acessórios",
      nameEn: "Accessories",
      description: "Detalhes que elevam cada look",
      descriptionEn: "Details that elevate every look",
      icon: "✧",
      items: [
        {
          id: "acc-1",
          name: accessories[0] || shortlistItems.find(i => i.category === "Wildcard")?.item_name || "Bolsa estruturada em couro",
          nameEn: accessories[0] || shortlistItems.find(i => i.category === "Wildcard")?.item_name || "Structured leather bag",
          description: "Investimento atemporal",
          descriptionEn: "Timeless investment"
        },
        {
          id: "acc-2",
          name: accessories[2] || "Joias minimalistas em ouro",
          nameEn: accessories[2] || "Minimalist gold jewelry",
          description: "Toques de luz",
          descriptionEn: "Touches of light"
        },
        {
          id: "acc-3",
          name: "Cinto de couro em tom neutro",
          nameEn: "Leather belt in neutral tone",
          description: "Define a silhueta",
          descriptionEn: "Defines the silhouette"
        },
        {
          id: "acc-4",
          name: accessories[1] || "Lenço de seda estampado",
          nameEn: accessories[1] || "Printed silk scarf",
          description: "Versatilidade criativa",
          descriptionEn: "Creative versatility"
        }
      ]
    },
    {
      id: "shoes",
      name: "Calçados",
      nameEn: "Footwear",
      description: "Base sólida para toda composição",
      descriptionEn: "Solid foundation for every composition",
      icon: "▽",
      items: [
        {
          id: "shoe-1",
          name: "Tênis minimalista branco ou neutro",
          nameEn: "Minimalist white or neutral sneaker",
          description: "Elegância casual",
          descriptionEn: "Casual elegance"
        },
        {
          id: "shoe-2",
          name: `Sandália ${contrast === "low" ? "discreta" : "statement"}`,
          nameEn: `${contrast === "low" ? "Understated" : "Statement"} sandal`,
          description: "Leveza sofisticada",
          descriptionEn: "Sophisticated lightness"
        },
        {
          id: "shoe-3",
          name: "Bota de cano médio em couro",
          nameEn: "Mid-calf leather boot",
          description: "Versatilidade em estações",
          descriptionEn: "Seasonal versatility"
        }
      ]
    }
  ];
}

const BuildCapsulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isGlobal = location.pathname.startsWith("/global");
  const resultId = searchParams.get("from");
  
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Load user's profile data
  const savedResult = resultId ? getResultById(resultId) : null;
  const profile = savedResult?.result?.profile || null;
  const editorial = savedResult?.result?.editorial || null;
  
  // Get aesthetic name for display
  const aestheticName = profile?.aesthetic_primary 
    ? (AESTHETIC_NAMES[profile.aesthetic_primary] || profile.aesthetic_primary)
    : null;
  
  // Generate personalized capsule
  const capsuleCategories = useMemo(() => 
    generatePersonalizedCapsule(profile, editorial, isGlobal),
    [profile, editorial, isGlobal]
  );
  
  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const totalItems = capsuleCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = Math.round((checkedCount / totalItems) * 100);

  const Nav = isGlobal ? GlobalNav : BrazilNav;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav />

      <main className="flex-1 container-editorial pt-24 pb-16">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {isGlobal ? "Back to results" : "Voltar ao resultado"}
        </motion.button>

        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-16"
        >
          <span className="editorial-caption">
            {isGlobal ? "Your Editorial Wardrobe" : "Seu Guarda-Roupa Editorial"}
          </span>
          
          <h1 className="editorial-headline text-4xl md:text-5xl lg:text-6xl">
            {isGlobal ? "Build Your Capsule" : "Construa Seu Capsule"}
          </h1>
          
          {/* Personalized subtitle based on profile */}
          {aestheticName && (
            <p className="text-sm text-muted-foreground">
              {isGlobal 
                ? `Curated for your ${aestheticName} aesthetic`
                : `Curado para sua estética ${aestheticName}`
              }
            </p>
          )}
          
          <p className="editorial-subhead text-lg text-muted-foreground max-w-lg mx-auto">
            {isGlobal 
              ? "Transform your aesthetic profile into a curated, intentional wardrobe. Less noise, more direction."
              : "Transforme seu perfil estético em um guarda-roupa curado e intencional. Menos ruído, mais direção."
            }
          </p>

          {/* Palette display if available */}
          {profile?.palette_hex && profile.palette_hex.length > 0 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground mr-2">
                {isGlobal ? "Your palette:" : "Sua paleta:"}
              </span>
              {profile.palette_hex.slice(0, 5).map((color, i) => (
                <div 
                  key={i}
                  className="w-6 h-6 rounded-full shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}

          <div className="editorial-divider" />
        </motion.header>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {isGlobal ? "Your progress" : "Seu progresso"}
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-foreground rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {checkedCount} / {totalItems} {isGlobal ? "pieces selected" : "peças selecionadas"}
          </p>
        </motion.div>

        {/* Categories */}
        <div className="space-y-12 max-w-2xl mx-auto">
          {capsuleCategories.map((category, catIndex) => (
            <motion.section
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + catIndex * 0.1 }}
              className="space-y-4"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3">
                <span className="text-lg">{category.icon}</span>
                <div className="flex-1">
                  <h2 className="editorial-headline text-xl">
                    {isGlobal ? category.nameEn : category.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isGlobal ? category.descriptionEn : category.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {category.items.length} {isGlobal ? "items" : "itens"}
                </span>
              </div>

              {/* Checklist */}
              <div className="space-y-2 pl-8">
                {category.items.map((item) => {
                  const isChecked = checkedItems[item.id];
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        isChecked 
                          ? "border-foreground/30 bg-muted/50" 
                          : "border-border/50 hover:border-border"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isChecked 
                          ? "border-foreground bg-foreground" 
                          : "border-muted-foreground/30"
                      }`}>
                        {isChecked && <Check className="w-3 h-3 text-background" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isChecked ? "line-through text-muted-foreground" : ""
                        }`}>
                          {isGlobal ? item.nameEn : item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isGlobal ? item.descriptionEn : item.description}
                        </p>
                      </div>
                      {isChecked && (
                        <Sparkles className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Search Terms Section */}
        {editorial?.commerce?.search_terms && editorial.commerce.search_terms.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <div className="editorial-divider mb-6" />
            <h3 className="editorial-caption text-center mb-4">
              {isGlobal ? "Search Terms" : "Termos para Buscar"}
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {editorial.commerce.search_terms.map((term, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-muted/50 rounded-full text-xs text-muted-foreground"
                >
                  {term}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center space-y-6"
        >
          <div className="editorial-divider" />
          
          <div className="space-y-3">
            <h3 className="editorial-headline text-xl">
              {isGlobal ? "Ready to curate?" : "Pronta para curar?"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {isGlobal 
                ? "Use this checklist as your shopping compass. Each piece brings you closer to a wardrobe that works."
                : "Use esta lista como seu compasso de compras. Cada peça te aproxima de um guarda-roupa que funciona."
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <EditorialButton 
              variant="primary"
              onClick={() => navigate(isGlobal ? "/global/edit" : "/input?mode=upload")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGlobal ? "Create New Reading" : "Nova Leitura"}
            </EditorialButton>
          </div>

          {/* Editorial Note */}
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground/50 uppercase pt-8">
            {isGlobal 
              ? "Less is more. Build with intention."
              : "Menos é mais. Construa com intenção."
            }
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default BuildCapsulePage;

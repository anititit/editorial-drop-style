import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Check, ShoppingBag, Sparkles } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import BrazilNav from "@/components/BrazilNav";
import GlobalNav from "@/components/GlobalNav";
import { Footer } from "@/components/Footer";
import { useState } from "react";

interface CapsuleCategory {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  items: number;
  icon: string;
}

const CAPSULE_CATEGORIES: CapsuleCategory[] = [
  {
    id: "essentials",
    name: "Essenciais",
    nameEn: "Essentials",
    description: "Peças atemporais que formam a base do seu guarda-roupa",
    descriptionEn: "Timeless pieces that form your wardrobe foundation",
    items: 5,
    icon: "◯"
  },
  {
    id: "statement",
    name: "Peças Statement",
    nameEn: "Statement Pieces",
    description: "Itens de destaque que expressam sua identidade",
    descriptionEn: "Standout items that express your identity",
    items: 3,
    icon: "◆"
  },
  {
    id: "accessories",
    name: "Acessórios",
    nameEn: "Accessories",
    description: "Detalhes que completam e elevam cada look",
    descriptionEn: "Details that complete and elevate every look",
    items: 4,
    icon: "✧"
  },
  {
    id: "shoes",
    name: "Calçados",
    nameEn: "Footwear",
    description: "Base sólida para toda composição",
    descriptionEn: "Solid foundation for every composition",
    items: 3,
    icon: "▽"
  },
];

const BuildCapsulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isGlobal = location.pathname.startsWith("/global");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  const toggleItem = (categoryId: string, index: number) => {
    const key = `${categoryId}-${index}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalItems = CAPSULE_CATEGORIES.reduce((acc, cat) => acc + cat.items, 0);
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
          
          <p className="editorial-subhead text-lg text-muted-foreground max-w-lg mx-auto">
            {isGlobal 
              ? "Transform your aesthetic profile into a curated, intentional wardrobe. Less noise, more direction."
              : "Transforme seu perfil estético em um guarda-roupa curado e intencional. Menos ruído, mais direção."
            }
          </p>

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
          {CAPSULE_CATEGORIES.map((category, catIndex) => (
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
                  {category.items} {isGlobal ? "items" : "itens"}
                </span>
              </div>

              {/* Checklist */}
              <div className="space-y-2 pl-8">
                {Array.from({ length: category.items }).map((_, index) => {
                  const key = `${category.id}-${index}`;
                  const isChecked = checkedItems[key];
                  
                  return (
                    <button
                      key={key}
                      onClick={() => toggleItem(category.id, index)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isChecked 
                          ? "border-foreground/30 bg-muted/50" 
                          : "border-border/50 hover:border-border"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isChecked 
                          ? "border-foreground bg-foreground" 
                          : "border-muted-foreground/30"
                      }`}>
                        {isChecked && <Check className="w-3 h-3 text-background" />}
                      </div>
                      <span className={`text-sm flex-1 text-left ${
                        isChecked ? "line-through text-muted-foreground" : ""
                      }`}>
                        {isGlobal 
                          ? `${category.nameEn} item ${index + 1}`
                          : `${category.name} item ${index + 1}`
                        }
                      </span>
                      {isChecked && (
                        <Sparkles className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
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

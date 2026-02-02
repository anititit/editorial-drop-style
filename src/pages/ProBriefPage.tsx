import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Image as ImageIcon, Building2, Layers } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { ProImageUploader } from "@/components/ProImageUploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type GuidanceType = "visual" | "brands" | "both";

const GUIDANCE_OPTIONS = [
  {
    value: "visual" as const,
    label: "Referências visuais",
    description: "Moodboard, editoriais, imagens de produto",
    icon: ImageIcon,
  },
  {
    value: "brands" as const,
    label: "Marcas que admiro",
    description: "Nomes de marcas que inspiram sua direção",
    icon: Building2,
  },
  {
    value: "both" as const,
    label: "Ambos",
    description: "Referências visuais + marcas de referência",
    icon: Layers,
  },
];

const ProBriefPage = () => {
  const navigate = useNavigate();
  
  const [guidanceType, setGuidanceType] = useState<GuidanceType | null>(null);
  const [visualRefs, setVisualRefs] = useState<string[]>([]);
  const [brandRefs, setBrandRefs] = useState<string[]>(["", "", ""]);
  
  const needsVisual = guidanceType === "visual" || guidanceType === "both";
  const needsBrands = guidanceType === "brands" || guidanceType === "both";
  
  const updateBrandRef = (index: number, value: string) => {
    const updated = [...brandRefs];
    updated[index] = value;
    setBrandRefs(updated);
  };
  
  const filledBrandRefs = brandRefs.filter((b) => b.trim().length > 0);
  
  const isValid = () => {
    if (!guidanceType) return false;
    
    if (needsVisual && visualRefs.length !== 3) return false;
    if (needsBrands && filledBrandRefs.length < 2) return false;
    
    return true;
  };
  
  const handleSubmit = () => {
    if (!isValid()) return;
    
    // Store data in sessionStorage for the Pro generation
    const proData = {
      guidanceType,
      visualRefs: needsVisual ? visualRefs : [],
      brandRefs: needsBrands ? filledBrandRefs : [],
    };
    
    sessionStorage.setItem("pro_brief", JSON.stringify(proData));
    
    // Also store images for backwards compatibility
    if (needsVisual) {
      sessionStorage.setItem("editorial_images", JSON.stringify(visualRefs));
    }
    
    navigate("/pro");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="container-results py-4 flex items-center justify-between">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="editorial-caption">DROP Pro</span>
          </div>
          <div className="w-5" />
        </div>
      </header>

      {/* Content */}
      <main className="container-results py-10 space-y-10">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <span className="editorial-caption">Brand Editorial Kit</span>
          <h1 className="editorial-headline text-2xl md:text-3xl">
            Como você quer guiar a direção criativa?
          </h1>
          <p className="editorial-subhead text-muted-foreground max-w-md mx-auto">
            Escolha o tipo de referência que melhor traduz a essência da sua marca.
          </p>
        </motion.header>

        <div className="editorial-divider" />

        {/* Guidance Type Selection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <RadioGroup
            value={guidanceType || ""}
            onValueChange={(v) => setGuidanceType(v as GuidanceType)}
            className="grid gap-3"
          >
            {GUIDANCE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = guidanceType === option.value;
              
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-sm border-2 cursor-pointer transition-all",
                    isSelected
                      ? "border-foreground bg-foreground/5"
                      : "border-border/60 hover:border-foreground/40"
                  )}
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </motion.section>

        {/* Visual References Input */}
        {needsVisual && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="editorial-divider" />
            <div className="space-y-2">
              <h2 className="editorial-subhead font-medium">Referências visuais</h2>
              <p className="text-sm text-muted-foreground">
                Envie exatamente 3 imagens que representem a estética desejada.
              </p>
            </div>
            <ProImageUploader
              urls={visualRefs}
              onUrlsChange={setVisualRefs}
              maxImages={3}
            />
          </motion.section>
        )}

        {/* Brand References Input */}
        {needsBrands && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="editorial-divider" />
            <div className="space-y-2">
              <h2 className="editorial-subhead font-medium">Marcas que admiro</h2>
              <p className="text-sm text-muted-foreground">
                Cite 2 a 3 marcas cuja linguagem visual e tom inspiram você.
              </p>
            </div>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Marca {index + 1}{index < 2 ? " *" : " (opcional)"}
                  </Label>
                  <Input
                    placeholder={
                      index === 0
                        ? "Ex: Glossier"
                        : index === 1
                        ? "Ex: The Row"
                        : "Ex: Aesop"
                    }
                    value={brandRefs[index]}
                    onChange={(e) => updateBrandRef(index, e.target.value)}
                    className="bg-background"
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                {filledBrandRefs.length}/3 marcas • Mínimo 2
              </p>
            </div>
          </motion.section>
        )}
      </main>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/30 py-4">
        <div className="container-results">
          <EditorialButton
            variant="primary"
            className="w-full"
            onClick={handleSubmit}
            disabled={!isValid()}
          >
            Gerar Editorial Kit
            <ArrowRight className="w-4 h-4 ml-2" />
          </EditorialButton>
          {!isValid() && guidanceType && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              {needsVisual && visualRefs.length !== 3 && "Envie exatamente 3 referências visuais."}
              {needsVisual && visualRefs.length !== 3 && needsBrands && filledBrandRefs.length < 2 && " "}
              {needsBrands && filledBrandRefs.length < 2 && "Cite pelo menos 2 marcas."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProBriefPage;

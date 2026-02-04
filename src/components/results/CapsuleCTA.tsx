import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";

interface CapsuleCTAProps {
  locale?: "en" | "pt-BR";
  resultId?: string;
}

export function CapsuleCTA({ locale = "pt-BR", resultId }: CapsuleCTAProps) {
  const isEnglish = locale === "en";
  const basePath = isEnglish ? "/global/build-capsule" : "/build-capsule";
  const targetPath = resultId ? `${basePath}?from=${resultId}` : basePath;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65 }}
      className="print-hide space-y-6"
    >
      <div className="editorial-divider" />
      
      <div className="text-center space-y-4">
        <span className="editorial-caption">
          {isEnglish ? "Next Step" : "Próximo Passo"}
        </span>
        
        <h2 className="editorial-headline text-xl md:text-2xl">
          {isEnglish 
            ? "Build Your Capsule Wardrobe" 
            : "Construa Seu Capsule Wardrobe"
          }
        </h2>
        
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {isEnglish 
            ? "Transform your aesthetic profile into a curated checklist. Less noise, more direction."
            : "Transforme seu perfil estético em uma lista curada. Menos ruído, mais direção."
          }
        </p>

        <div className="pt-4">
          <Link to={targetPath}>
            <EditorialButton variant="secondary" className="group">
              <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              {isEnglish 
                ? "Build Your Capsule" 
                : "Construa Seu Capsule"
              }
            </EditorialButton>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

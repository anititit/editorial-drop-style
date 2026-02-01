import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";

interface SafetyModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export function SafetyModal({ isOpen, onAccept, onClose }: SafetyModalProps) {
  const allowedItems = [
    "Editorial, campanhas, produtos",
    "Texturas, cenários, recortes",
  ];

  const notAllowedItems = [
    "Sem selfies",
    "Sem nudez ou conteúdo sexual",
    "Sem menores",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            <div className="bg-card border border-border rounded-sm shadow-2xl p-6 space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="editorial-headline text-xl">
                  Apenas referências de moda
                </h2>
                <p className="editorial-body text-sm text-muted-foreground">
                  Este app funciona com imagens de moodboard — sem fotos pessoais.
                </p>
              </div>

              {/* Allowed items */}
              <div className="space-y-2">
                {allowedItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              {/* Not allowed items */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                {notAllowedItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <X className="w-3 h-3 text-destructive" />
                    </div>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <EditorialButton
                variant="primary"
                className="w-full"
                onClick={onAccept}
              >
                Entendi
              </EditorialButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

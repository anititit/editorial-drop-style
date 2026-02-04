import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { PreferenceChip } from "@/components/PreferenceChip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RefinementId, RefinementResponses } from "@/lib/types";

// Refinement options
const REFINEMENT_OPTIONS: { id: RefinementId; label: string }[] = [
  { id: "start", label: "não sei por onde começar" },
  { id: "chaos", label: "tenho coisas demais e nada combina" },
  { id: "elevated", label: "quero parecer mais cara/arrumada" },
  { id: "clarity", label: "quero uma estética mais clara" },
  { id: "looks", label: "preciso de looks prontos" },
];

interface RefineEditSectionProps {
  refinements: RefinementResponses;
  selectedOption: RefinementId | null;
  onSelect: (option: RefinementId | null) => void;
}

export function RefineEditSection({ refinements, selectedOption, onSelect }: RefineEditSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionId: RefinementId) => {
    onSelect(optionId === selectedOption ? null : optionId);
  };

  const currentResult = selectedOption ? refinements[selectedOption] : null;

  return (
    <div className="print-hide">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left group">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Refinar meu edit
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-muted-foreground"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-4 space-y-6"
              >
                {/* Single question */}
                <div className="space-y-3">
                  <p className="text-sm text-foreground">
                    O que mais trava você hoje?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {REFINEMENT_OPTIONS.map((option) => (
                      <PreferenceChip
                        key={option.id}
                        label={option.label}
                        selected={selectedOption === option.id}
                        onClick={() => handleSelect(option.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Result after selection */}
                <AnimatePresence mode="wait">
                  {currentResult && (
                    <motion.div
                      key={selectedOption}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6 pt-4 border-t border-border/30"
                    >
                      {/* Priorities */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-foreground tracking-wide uppercase">
                          Prioridades (em ordem)
                        </h3>
                        <ol className="space-y-2">
                          {currentResult.priorities.map((priority, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="text-sm text-muted-foreground font-medium">
                                {idx + 1}.
                              </span>
                              <span className="editorial-body text-sm text-foreground">
                                {priority}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Edit Rule */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground tracking-wide uppercase">
                          Regra do edit
                        </h3>
                        <p className="editorial-body text-sm text-muted-foreground italic">
                          {currentResult.edit_rule}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Export for PDF - only shows if user selected an option
export function RefineEditPDFSection({ 
  priorities, 
  editRule 
}: { 
  priorities: string[]; 
  editRule: string;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground tracking-wide uppercase">
          Prioridades (em ordem)
        </h3>
        <ol className="space-y-2">
          {priorities.map((priority, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-sm text-muted-foreground font-medium">
                {idx + 1}.
              </span>
              <span className="editorial-body text-sm text-foreground">
                {priority}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground tracking-wide uppercase">
          Regra do edit
        </h3>
        <p className="editorial-body text-sm text-muted-foreground italic">
          {editRule}
        </p>
      </div>
    </div>
  );
}

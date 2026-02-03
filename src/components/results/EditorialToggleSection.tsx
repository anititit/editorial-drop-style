import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EditorialToggleSectionProps {
  title: string;
  introLine: string;
  secondaryLine?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function EditorialToggleSection({
  title,
  introLine,
  secondaryLine,
  children,
  defaultOpen = false,
}: EditorialToggleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full text-left group">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <h2 className="editorial-headline text-xl md:text-2xl group-hover:text-foreground/80 transition-colors">
                {title}
              </h2>
              <p className="editorial-subhead text-sm text-muted-foreground">
                {introLine}
              </p>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted-foreground"
            >
              <ChevronDown className="w-5 h-5" />
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
              {secondaryLine && (
                <p className="editorial-body text-sm text-muted-foreground italic">
                  {secondaryLine}
                </p>
              )}
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
}

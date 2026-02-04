import { motion } from "framer-motion";

interface StartHereContent {
  anchor_piece: string;
  look_formula: string;
  finishing_touch: string;
}

interface StartHereSectionProps {
  content: StartHereContent;
}

export function StartHereSection({ content }: StartHereSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="editorial-headline text-xl md:text-2xl">
          Comece por aqui
        </h2>
        <p className="editorial-subhead text-sm text-muted-foreground">
          Três escolhas para destravar sua direção, sem complicar.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wider pt-1 w-28 flex-shrink-0">
            1 peça âncora
          </span>
          <p className="editorial-body text-foreground">
            {content.anchor_piece}
          </p>
        </div>

        <div className="flex items-start gap-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wider pt-1 w-28 flex-shrink-0">
            1 fórmula de look
          </span>
          <p className="editorial-body text-foreground">
            {content.look_formula}
          </p>
        </div>

        <div className="flex items-start gap-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wider pt-1 w-28 flex-shrink-0">
            1 acabamento
          </span>
          <p className="editorial-body text-foreground">
            {content.finishing_touch}
          </p>
        </div>
      </div>
    </motion.section>
  );
}

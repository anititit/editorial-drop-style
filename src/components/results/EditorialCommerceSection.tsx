import { motion } from "framer-motion";

export type PriceLane = "Acessível" | "Intermediário" | "Premium";

export interface ShortlistItem {
  category: "Hero" | "Supporting" | "Beauty" | "Scent" | "Wildcard";
  item_name: string;
  price_lane: PriceLane;
  rationale: string;
}

export interface LookRecipe {
  formula: string;
}

export interface CommerceData {
  shortlist: ShortlistItem[];
  look_recipes: LookRecipe[];
  search_terms: string[];
}

interface EditorialCommerceSectionProps {
  commerce: CommerceData;
  delay?: number;
}

const categoryLabels: Record<ShortlistItem["category"], string> = {
  Hero: "Hero",
  Supporting: "Apoio",
  Beauty: "Beleza",
  Scent: "Olfativo",
  Wildcard: "Curinga",
};

const priceLaneLabels: Record<PriceLane, string> = {
  "Acessível": "Acessível",
  "Intermediário": "Intermediário",
  "Premium": "Premium",
};

export function EditorialCommerceSection({ commerce, delay = 0 }: EditorialCommerceSectionProps) {
  const { shortlist, look_recipes, search_terms } = commerce;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="editorial-headline text-xl md:text-2xl">
          O Edit — por onde começar
        </h2>
        <p className="text-sm text-muted-foreground">
          Peças conceituais que traduzem sua estética.
        </p>
      </div>

      {/* The Shortlist */}
      <div className="space-y-4">
        <h3 className="editorial-caption text-xs uppercase tracking-[0.15em]">
          The Shortlist
        </h3>
        <div className="space-y-3">
          {shortlist.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.1 + i * 0.05 }}
              className="flex items-start gap-4 py-3 border-b border-border/30 last:border-0"
            >
              <span className="text-xs text-muted-foreground w-16 flex-shrink-0 uppercase tracking-wider pt-0.5">
                {categoryLabels[item.category]}
              </span>
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">{item.item_name}</p>
                <p className="text-xs text-muted-foreground italic">
                  {item.rationale}
                </p>
              </div>
              <span className="text-xs text-muted-foreground/70 flex-shrink-0">
                {priceLaneLabels[item.price_lane]}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Look Recipes */}
      <div className="space-y-4">
        <h3 className="editorial-caption text-xs uppercase tracking-[0.15em]">
          Look Recipes
        </h3>
        <div className="space-y-2">
          {look_recipes.map((recipe, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.3 + i * 0.05 }}
              className="text-sm editorial-body text-muted-foreground pl-4 border-l-2 border-primary/30"
            >
              {recipe.formula}
            </motion.p>
          ))}
        </div>
      </div>

      {/* Termos para buscar */}
      <div className="space-y-4">
        <h3 className="editorial-caption text-xs uppercase tracking-[0.15em]">
          Termos para buscar
        </h3>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
          className="flex flex-wrap gap-2"
        >
          {search_terms.map((term, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-muted/50 rounded-full text-xs text-muted-foreground"
            >
              {term}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

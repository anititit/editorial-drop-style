import { motion } from "framer-motion";
import { Outfit } from "@/lib/types";

interface OutfitCardProps {
  outfit: Outfit;
  index: number;
}

export function OutfitCard({ outfit, index }: OutfitCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="space-y-4"
    >
      {/* Look title */}
      <div className="flex items-center gap-3">
        <span className="editorial-caption">{outfit.title}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Hero piece */}
      <div className="space-y-2">
        <h3 className="editorial-headline text-xl">{outfit.hero}</h3>
      </div>

      {/* Supporting items */}
      <ul className="space-y-1">
        {outfit.supporting.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground editorial-body">
            + {item}
          </li>
        ))}
      </ul>

      {/* Accessory */}
      <p className="text-sm">
        <span className="text-muted-foreground">Acessório:</span>{" "}
        <span className="font-medium">{outfit.accessory}</span>
      </p>

      {/* Caption */}
      <p className="editorial-subhead text-sm text-muted-foreground pt-2 border-t border-border/30">
        "{outfit.caption}"
      </p>
    </motion.article>
  );
}

interface OutfitsSectionProps {
  outfits: Outfit[];
}

export function OutfitsSection({ outfits }: OutfitsSectionProps) {
  return (
    <section className="space-y-8">
      <div className="text-center">
        <span className="editorial-caption">Looks Editoriais</span>
        <h2 className="editorial-headline text-2xl mt-2">3 Composições</h2>
      </div>

      <div className="space-y-10">
        {outfits.map((outfit, i) => (
          <OutfitCard key={outfit.title + i} outfit={outfit} index={i} />
        ))}
      </div>
    </section>
  );
}

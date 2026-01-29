import { motion } from "framer-motion";
import { Fragrance } from "@/lib/types";

interface FragranceSectionProps {
  fragrance: Fragrance;
}

export function FragranceSection({ fragrance }: FragranceSectionProps) {
  const tiers = [
    { label: "Acessível", value: fragrance.affordable },
    { label: "Intermediário", value: fragrance.mid },
    { label: "Premium", value: fragrance.premium },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center">
        <span className="editorial-caption">Olfativo</span>
        <h2 className="editorial-headline text-2xl mt-2">Fragrância</h2>
      </div>

      {/* Direction */}
      <p className="editorial-subhead text-center text-lg">
        "{fragrance.direction}"
      </p>

      {/* Budget tiers */}
      <div className="space-y-3 pt-4">
        {tiers.map((tier) => (
          <div
            key={tier.label}
            className="flex items-start gap-4 py-3 border-b border-border/30 last:border-0"
          >
            <span className="text-xs text-muted-foreground w-28 flex-shrink-0 uppercase tracking-wider pt-0.5">
              {tier.label}
            </span>
            <span className="text-sm editorial-body">{tier.value}</span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

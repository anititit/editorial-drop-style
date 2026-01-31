import { motion } from "framer-motion";
import { AESTHETIC_NAMES } from "@/lib/types";

interface PaletteChipProps {
  color: string;
}

function PaletteChip({ color }: PaletteChipProps) {
  return (
    <div
      className="palette-chip"
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}

interface ProfileSectionProps {
  aestheticPrimary: string;
  aestheticSecondary: string;
  paletteHex: string[];
  vibeKeywords: string[];
  whyThis: string[];
  confidence?: number;
}

export function ProfileSection({
  aestheticPrimary,
  aestheticSecondary,
  paletteHex,
  vibeKeywords,
  whyThis,
  confidence,
}: ProfileSectionProps) {
  const primaryName = AESTHETIC_NAMES[aestheticPrimary] || aestheticPrimary;
  const secondaryName = AESTHETIC_NAMES[aestheticSecondary] || aestheticSecondary;
  const isConceptualReading = confidence !== undefined && confidence < 0.7;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Aesthetic Profile */}
      <div className="text-center space-y-4">
        <span className="editorial-caption">Seu Perfil Estético</span>
        {isConceptualReading && (
          <p className="text-xs text-muted-foreground/70 italic">
            Leitura mais conceitual — baseada em paleta, contraste e textura.
          </p>
        )}
        <div className="space-y-2">
          <h2 className="editorial-headline text-3xl md:text-4xl">{primaryName}</h2>
          <p className="editorial-subhead text-lg text-muted-foreground">
            com toques de {secondaryName}
          </p>
        </div>
      </div>

      {/* Palette */}
      <div className="flex items-center justify-center gap-3">
        {paletteHex.map((color, i) => (
          <motion.div
            key={color + i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <PaletteChip color={color} />
          </motion.div>
        ))}
      </div>

      {/* Vibe Keywords */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {vibeKeywords.map((keyword, i) => (
          <span
            key={keyword + i}
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            {keyword}
            {i < vibeKeywords.length - 1 && (
              <span className="ml-2 text-border">·</span>
            )}
          </span>
        ))}
      </div>

      {/* Why This */}
      {whyThis.length > 0 && (
        <div className="pt-4 border-t border-border/50">
          <p className="editorial-caption mb-3 text-center">Por que esse estilo?</p>
          <ul className="space-y-2">
            {whyThis.map((reason, i) => (
              <li
                key={i}
                className="text-sm text-muted-foreground text-center editorial-body"
              >
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.section>
  );
}

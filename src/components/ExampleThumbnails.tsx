import { motion } from "framer-motion";
import exampleEditorial from "@/assets/example-editorial.jpg";
import exampleProduct from "@/assets/example-product.jpg";
import exampleTexture from "@/assets/example-texture.jpg";

interface ExampleThumbnailsProps {
  locale?: "en" | "pt-BR";
}

const i18n = {
  en: {
    tip: "The more 'magazine-quality' the reference, the better the curation.",
    editorial: "Editorial",
    product: "Product",
    texture: "Texture",
  },
  "pt-BR": {
    tip: "Quanto mais \"referência de revista\", melhor a curadoria.",
    editorial: "Editorial",
    product: "Produto",
    texture: "Textura",
  },
};

export function ExampleThumbnails({ locale = "pt-BR" }: ExampleThumbnailsProps) {
  const t = i18n[locale];
  
  const examples = [
    { src: exampleEditorial, label: t.editorial },
    { src: exampleProduct, label: t.product },
    { src: exampleTexture, label: t.texture },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-3"
    >
      <p className="text-xs text-muted-foreground text-center">
        {t.tip}
      </p>
      
      <div className="flex items-center justify-center gap-3">
        {examples.map((example, i) => (
          <div key={i} className="text-center space-y-1">
            <div className="w-16 h-16 rounded-sm overflow-hidden border border-border/50 opacity-70">
              <img
                src={example.src}
                alt={example.label}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {example.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

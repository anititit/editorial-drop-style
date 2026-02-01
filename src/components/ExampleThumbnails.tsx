import { motion } from "framer-motion";
import exampleEditorial from "@/assets/example-editorial.jpg";
import exampleProduct from "@/assets/example-product.jpg";
import exampleTexture from "@/assets/example-texture.jpg";

const examples = [
  { src: exampleEditorial, label: "Editorial" },
  { src: exampleProduct, label: "Produto" },
  { src: exampleTexture, label: "Textura" },
];

export function ExampleThumbnails() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-3"
    >
      <p className="text-xs text-muted-foreground text-center">
        Quanto mais "referência de revista", melhor a curadoria.
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

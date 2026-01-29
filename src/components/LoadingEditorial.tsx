import { motion } from "framer-motion";

export function LoadingEditorial() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-8"
      >
        {/* Animated dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-foreground rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="editorial-headline text-2xl">
            Criando seu editorial
          </h2>
          <p className="editorial-body text-muted-foreground max-w-xs mx-auto">
            Analisando suas referências e gerando um guia de estilo único...
          </p>
        </div>

        {/* Progress steps */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Identificando paleta de cores...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

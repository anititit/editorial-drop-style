import { motion } from "framer-motion";
import BrazilNav from "@/components/BrazilNav";

const ManifestoPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BrazilNav />

      {/* Manifesto Content */}
      <main className="flex-1 flex items-center justify-center px-8 pt-24 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-lg text-center space-y-12"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="editorial-headline text-2xl md:text-3xl leading-relaxed"
          >
            DROP Edit é luxo com precisão.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="editorial-body text-muted-foreground text-lg leading-relaxed"
          >
            Um ateliê invisível, em grande escala,
            <br />
            sem perder o corte sob medida.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="editorial-body text-muted-foreground text-lg leading-relaxed"
          >
            Organizamos repertório em direção,
            <br />
            linguagem visual, presença, coerência.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="pt-8"
          >
            <p className="editorial-headline text-xl md:text-2xl leading-relaxed">
              Luxo é escolher com intenção.
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="editorial-subhead text-muted-foreground text-base italic"
          >
            Não é tendência, é direção.
          </motion.p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="text-xs text-muted-foreground/50 tracking-widest"
        >
          DROP Edit™
        </motion.span>
      </footer>
    </div>
  );
};

export default ManifestoPage;

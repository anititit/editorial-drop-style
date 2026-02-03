import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { HistorySection } from "@/components/HistorySection";
import { ImageIcon, Link as LinkIcon, Sparkles, BookOpen } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-editorial min-h-screen flex flex-col justify-center py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          {/* Brand */}
          <div className="space-y-2">
            <span className="editorial-caption">Editorial Drop</span>
            <h1 className="editorial-headline text-4xl md:text-5xl lg:text-6xl">
              Seu estilo, editado.
            </h1>
          </div>

          {/* Divider */}
          <div className="editorial-divider" />

          {/* Description */}
          <p className="editorial-body text-muted-foreground max-w-sm mx-auto">
            Envie 3 referências visuais e receba uma leitura estética no espírito das grandes revistas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/input?mode=upload">
              <EditorialButton variant="primary" className="w-full sm:w-auto">
                <ImageIcon className="w-4 h-4 mr-2" />
                Enviar 3 imagens
              </EditorialButton>
            </Link>
            <Link to="/input?mode=url">
              <EditorialButton variant="secondary" className="w-full sm:w-auto">
                <LinkIcon className="w-4 h-4 mr-2" />
                Usar URLs
              </EditorialButton>
            </Link>
          </div>

          {/* Helper text */}
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Use referências de moodboard, looks, beleza ou editoriais.
            <br />
            <span className="italic">Para estilo pessoal.</span>
          </p>

          {/* Manifesto Link */}
          <div className="pt-2 flex flex-col items-center gap-2">
            <Link 
              to="/manifesto" 
              className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              Leia o manifesto →
            </Link>
            <Link 
              to="/global" 
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Global Edition →
            </Link>
          </div>

          {/* Pro CTA */}
          <div className="pt-8 mt-8 border-t border-border/40">
            <Link to="/pro/brief">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <EditorialButton variant="secondary" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  DROP Pro (beta)
                </EditorialButton>
              </motion.div>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">
              Versão profissional do DROP.
            </p>
          </div>

          {/* Editorial */}
          <div className="pt-6">
            <Link to="/editorial">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <BookOpen className="w-4 h-4" />
                  Editorial
                </span>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* History Section */}
        <div className="mt-16">
          <HistorySection />
        </div>
      </div>
    </div>
  );
};

export default HomePage;

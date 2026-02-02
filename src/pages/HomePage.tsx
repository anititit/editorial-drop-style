import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { HistorySection } from "@/components/HistorySection";
import { ImageIcon, Link as LinkIcon, Sparkles } from "lucide-react";

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
              Sua marca, editada.
            </h1>
          </div>

          {/* Divider */}
          <div className="editorial-divider" />

          {/* Description */}
          <p className="editorial-body text-muted-foreground max-w-sm mx-auto">
            Envie 3 referências visuais e receba um guia editorial de marca
            — no estilo das grandes revistas.
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
            Use referências de moodboard, produto ou editoriais.
            <br />
            <span className="italic">Para marcas e projetos.</span>
          </p>

          {/* Pro CTA */}
          <div className="pt-8 mt-8 border-t border-border/40">
            <Link to="/input?mode=upload&pro=true">
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
              Persona completa + Brand Codes + Shotlist + Copy Kit
            </p>
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

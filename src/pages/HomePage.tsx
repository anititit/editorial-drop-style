import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { HistorySection } from "@/components/HistorySection";
import { Footer } from "@/components/Footer";
import { ImageIcon, Link as LinkIcon, Sparkles, BookOpen } from "lucide-react";
import BrazilNav from "@/components/BrazilNav";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <BrazilNav />

      <div className="container-editorial min-h-screen flex flex-col justify-center pt-16 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          {/* Brand */}
          <div className="space-y-2">
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

          {/* Capsule CTA */}
          <div className="pt-2">
            <Link to="/capsula">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Sparkles className="w-4 h-4" />
                  Já sabe sua direção? Comece pela cápsula →
                </span>
              </motion.div>
            </Link>
          </div>

          {/* Helper text */}
          <p className="text-xs text-muted-foreground max-w-xs mx-auto pt-4">
            Use referências de moodboard, looks, beleza ou editoriais.
            <br />
            <span className="italic">Para estilo pessoal.</span>
          </p>

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

      <Footer />
    </div>
  );
};

export default HomePage;

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const GlobalHomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Language Switch - Top */}
      <div className="absolute top-6 right-6">
        <Link 
          to="/" 
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          Versão Brasil →
        </Link>
      </div>

      <div className="container-editorial min-h-screen flex flex-col justify-center py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-12 max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="space-y-6">
            <span className="editorial-caption tracking-[0.3em]">DROP Edit</span>
            <h1 className="editorial-headline text-5xl md:text-6xl lg:text-7xl tracking-tight">
              GLOBAL
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide">
              Your style, edited.
            </p>
          </div>

          {/* Divider */}
          <div className="editorial-divider" />

          {/* CTA */}
          <div className="pt-8">
            <Link 
              to="/global/input"
              className="text-sm text-foreground hover:text-muted-foreground transition-colors tracking-wide"
            >
              Enter Global Edition →
            </Link>
          </div>

          {/* Secondary Links */}
          <div className="pt-12 border-t border-border/40 space-y-4">
            <Link 
              to="/global/studio"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Studio — for founders and teams
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GlobalHomePage;

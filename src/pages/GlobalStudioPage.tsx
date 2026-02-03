import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const GlobalStudioPage = () => {
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
          <div className="space-y-4">
            <span className="editorial-caption tracking-[0.3em]">Global Edition</span>
            <h1 className="editorial-headline text-5xl md:text-6xl lg:text-7xl tracking-tight">
              STUDIO
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide">
              Brand direction, edited.
            </p>
          </div>

          {/* Divider */}
          <div className="editorial-divider" />

          {/* Intro Copy */}
          <div className="space-y-1">
            <p className="editorial-body text-muted-foreground">
              For founders and small teams in fashion, beauty, and culture.
            </p>
            <p className="editorial-body text-muted-foreground">
              No calls, no decks, just direction.
            </p>
            <p className="editorial-body text-muted-foreground">
              Edited, coherent, ready to use.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-8">
            <Link 
              to="/global/studio/input" 
              className="text-sm text-foreground hover:text-muted-foreground transition-colors tracking-wide"
            >
              Create a Studio Edit →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GlobalStudioPage;

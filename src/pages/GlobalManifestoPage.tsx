import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const GlobalManifestoPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Global Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/20">
        <div className="container-editorial py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link 
              to="/global/edit" 
              className="text-xs tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            >
              DROP Edit
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/global/manifesto" 
                className="text-xs text-foreground transition-colors"
              >
                Manifesto
              </Link>
              <Link 
                to="/global/studio" 
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Studio
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground/50 uppercase">
              Global Edition
            </span>
            <Link 
              to="/" 
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Brasil →
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container-editorial min-h-screen flex flex-col justify-center py-24 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl mx-auto text-center space-y-16"
        >
          {/* Title */}
          <h1 className="editorial-headline text-4xl md:text-5xl tracking-tight">
            Manifesto
          </h1>

          {/* Body */}
          <div className="space-y-8">
            <p className="editorial-body text-lg leading-relaxed">
              DROP Edit is luxury with precision.
            </p>
            <p className="editorial-body text-lg leading-relaxed text-muted-foreground">
              An invisible atelier, at scale, without losing a made-to-measure cut.
            </p>
            <p className="editorial-body text-lg leading-relaxed text-muted-foreground">
              We turn reference into direction, visual language, presence, coherence.
            </p>
            <p className="editorial-body text-lg leading-relaxed">
              Luxury is choosing with intention.
            </p>
            <p className="editorial-body text-lg leading-relaxed font-medium">
              It's not trend, it's direction.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-16">
            <span className="text-xs tracking-[0.3em] text-muted-foreground/40">
              DROP Edit™
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GlobalManifestoPage;

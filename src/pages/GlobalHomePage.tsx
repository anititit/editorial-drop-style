import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen } from "lucide-react";

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
          <div className="space-y-4">
            <span className="editorial-caption tracking-[0.3em]">Global Edition</span>
            <h1 className="editorial-headline text-5xl md:text-6xl lg:text-7xl tracking-tight">
              DROP Edit
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide">
              Your style, edited.
            </p>
          </div>

          {/* Divider */}
          <div className="editorial-divider" />

          {/* Intro */}
          <p className="editorial-body text-muted-foreground max-w-md mx-auto">
            Visual intelligence for fashion, beauty, and culture.
            <br />
            No noise. Just direction.
          </p>

          {/* Navigation Links */}
          <div className="space-y-8 pt-8">
            {/* Studio - Primary */}
            <div className="space-y-3">
              <Link 
                to="/global/studio"
                className="inline-flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-base tracking-wide">Studio</span>
              </Link>
              <p className="text-xs text-muted-foreground">
                Brand direction for founders and small teams.
              </p>
            </div>

            {/* Divider */}
            <div className="w-12 h-px bg-border mx-auto" />

            {/* Editorial */}
            <div className="space-y-3">
              <Link 
                to="/editorial"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm tracking-wide">Editorial</span>
              </Link>
              <p className="text-xs text-muted-foreground">
                Visual essays on style and aesthetics.
              </p>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default GlobalHomePage;

import { Link, useLocation } from "react-router-dom";

interface BrazilNavProps {
  showEditionLabel?: boolean;
}

const BrazilNav = ({ showEditionLabel = true }: BrazilNavProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/input" || location.pathname.startsWith("/resultado");
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/20">
      <div className="container-editorial py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className="text-xs tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          >
            DROP Edit
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/manifesto" 
              className={`text-xs transition-colors ${
                isActive("/manifesto") 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Manifesto
            </Link>
            <Link 
              to="/method" 
              className={`text-xs transition-colors ${
                isActive("/method") 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Metodologia
            </Link>
            <span className="text-muted-foreground/30">·</span>
            <Link 
              to="/privacy-policy" 
              className={`text-xs transition-colors ${
                isActive("/privacy-policy") 
                  ? "text-foreground" 
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              Privacidade
            </Link>
            <Link 
              to="/terms-of-service" 
              className={`text-xs transition-colors ${
                isActive("/terms-of-service") 
                  ? "text-foreground" 
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              Termos
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {showEditionLabel && (
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground/50 uppercase">
              Brasil
            </span>
          )}
          <span className="text-[10px] tracking-[0.15em] text-muted-foreground/40 uppercase">
            Global em breve
          </span>
        </div>
      </div>
    </header>
  );
};

export default BrazilNav;

import { Link, useLocation } from "react-router-dom";

interface GlobalNavProps {
  showEditionLabel?: boolean;
}

const GlobalNav = ({ showEditionLabel = true }: GlobalNavProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/global/edit") {
      return location.pathname === "/global" || location.pathname === "/global/edit" || location.pathname.startsWith("/global/result");
    }
    return location.pathname.startsWith(path);
  };

  return (
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
              className={`text-xs transition-colors ${
                isActive("/global/manifesto") 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Manifesto
            </Link>
            <Link 
              to="/global/studio" 
              className={`text-xs transition-colors ${
                isActive("/global/studio") 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Studio
            </Link>
            <span className="text-muted-foreground/30">·</span>
            <Link 
              to="/global/privacy-policy" 
              className={`text-xs transition-colors ${
                isActive("/global/privacy-policy") 
                  ? "text-foreground" 
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              Privacy
            </Link>
            <Link 
              to="/global/terms-of-service" 
              className={`text-xs transition-colors ${
                isActive("/global/terms-of-service") 
                  ? "text-foreground" 
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              Terms
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {showEditionLabel && (
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground/50 uppercase">
              Global Edition
            </span>
          )}
          <Link 
            to="/" 
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Brasil →
          </Link>
        </div>
      </div>
    </header>
  );
};

export default GlobalNav;

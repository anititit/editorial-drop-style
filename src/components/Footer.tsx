import { Link, useLocation } from "react-router-dom";

const i18n = {
  en: {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "Contact",
    rights: "All rights reserved.",
    privacyPath: "/global/privacy-policy",
    termsPath: "/global/terms-of-service",
  },
  "pt-BR": {
    privacy: "Política de Privacidade",
    terms: "Termos de Uso",
    contact: "Contato",
    rights: "Todos os direitos reservados.",
    privacyPath: "/privacy-policy",
    termsPath: "/terms-of-service",
  },
};

interface FooterProps {
  locale?: "en" | "pt-BR";
}

export function Footer({ locale }: FooterProps) {
  const location = useLocation();
  const isGlobalRoute = location.pathname.startsWith("/global");
  const resolvedLocale = locale ?? (isGlobalRoute ? "en" : "pt-BR");
  const t = i18n[resolvedLocale];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background border-t border-border/30 py-6 px-4 mt-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-serif tracking-wide">DROP</span>
            <span className="text-muted-foreground/60">Edit</span>
            <span className="mx-2">·</span>
            <span>© {currentYear} {t.rights}</span>
          </div>
          
          <nav className="flex items-center gap-4 md:gap-6">
            <Link 
              to={t.privacyPath}
              className="hover:text-foreground transition-colors"
            >
              {t.privacy}
            </Link>
            <Link 
              to={t.termsPath}
              className="hover:text-foreground transition-colors"
            >
              {t.terms}
            </Link>
            <a 
              href="mailto:contato@dropedit.com.br"
              className="hover:text-foreground transition-colors"
            >
              contato@dropedit.com.br
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

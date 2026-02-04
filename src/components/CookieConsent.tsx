import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EditorialButton } from "./ui/EditorialButton";

const CONSENT_KEY = "cookie_consent";

const i18n = {
  en: {
    message: "We use cookies to analyze site traffic and improve your experience.",
    accept: "Accept",
    decline: "Decline",
    learnMore: "Learn more",
  },
  "pt-BR": {
    message: "Usamos cookies para analisar o tráfego do site e melhorar sua experiência.",
    accept: "Aceitar",
    decline: "Recusar",
    learnMore: "Saiba mais",
  },
};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function loadGoogleAnalytics() {
  // Only load if not already loaded
  if (document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
    return;
  }

  const script = document.createElement("script");
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-2P903GV9CC";
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", "G-2P903GV9CC");
}

interface CookieConsentProps {
  locale?: "en" | "pt-BR";
}

export function CookieConsent({ locale = "pt-BR" }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const t = i18n[locale];

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    
    if (consent === "accepted") {
      loadGoogleAnalytics();
    } else if (consent === null) {
      // No decision yet, show banner
      setShowBanner(true);
    }
    // If "declined", do nothing
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setShowBanner(false);
    loadGoogleAnalytics();
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-sm shadow-2xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <p className="editorial-body text-sm text-muted-foreground flex-1">
                {t.message}
              </p>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={handleDecline}
                  className="editorial-body text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                >
                  {t.decline}
                </button>
                <EditorialButton
                  variant="primary"
                  size="sm"
                  onClick={handleAccept}
                >
                  {t.accept}
                </EditorialButton>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

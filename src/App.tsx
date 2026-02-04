import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import InputPage from "./pages/InputPage";
import ResultPage from "./pages/ResultPage";
import ProPage from "./pages/ProPage";
import ProBriefPage from "./pages/ProBriefPage";
import EditorialPage from "./pages/EditorialPage";
import ManifestoPage from "./pages/ManifestoPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import GlobalInputPage from "./pages/GlobalInputPage";
import GlobalResultPage from "./pages/GlobalResultPage";
import GlobalManifestoPage from "./pages/GlobalManifestoPage";
import GlobalStudioPage from "./pages/GlobalStudioPage";
import GlobalStudioInputPage from "./pages/GlobalStudioInputPage";
import GlobalStudioResultPage from "./pages/GlobalStudioResultPage";
import NotFound from "./pages/NotFound";
import { CookieConsent } from "./components/CookieConsent";

function CookieConsentWrapper() {
  const location = useLocation();
  const isGlobalRoute = location.pathname.startsWith("/global");
  return <CookieConsent locale={isGlobalRoute ? "en" : "pt-BR"} />;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/resultado/:id" element={<ResultPage />} />
          <Route path="/pro" element={<ProPage />} />
          <Route path="/pro/brief" element={<ProBriefPage />} />
          <Route path="/editorial" element={<EditorialPage />} />
          <Route path="/manifesto" element={<ManifestoPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/global" element={<GlobalInputPage />} />
          <Route path="/global/edit" element={<GlobalInputPage />} />
          <Route path="/global/result/:id" element={<GlobalResultPage />} />
          <Route path="/global/manifesto" element={<GlobalManifestoPage />} />
          <Route path="/global/studio" element={<GlobalStudioPage />} />
          <Route path="/global/studio/input" element={<GlobalStudioInputPage />} />
          <Route path="/global/studio/result" element={<GlobalStudioResultPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsentWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

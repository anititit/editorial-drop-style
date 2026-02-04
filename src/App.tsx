import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import InputPage from "./pages/InputPage";
import ResultPage from "./pages/ResultPage";
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
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import MethodPage from "./pages/MethodPage";
import BuildCapsulePage from "./pages/BuildCapsulePage";
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
          <Route path="/global/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/global/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/global/method" element={<MethodPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/method" element={<MethodPage />} />
          <Route path="/build-capsule" element={<BuildCapsulePage />} />
          <Route path="/global/build-capsule" element={<BuildCapsulePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsentWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

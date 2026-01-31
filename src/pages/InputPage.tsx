import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ImageIcon, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { ImageUploader } from "@/components/ImageUploader";
import { UrlInput } from "@/components/UrlInput";
import { PreferenceChip } from "@/components/PreferenceChip";
import { LoadingEditorial } from "@/components/LoadingEditorial";
import { supabase } from "@/integrations/supabase/client";
import { saveResult } from "@/lib/storage";
import { EditorialResult, DEFAULT_RESULT, UserPreferences } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const OCCASIONS = [
  { id: "trabalho", label: "Trabalho" },
  { id: "casual", label: "Casual" },
  { id: "date", label: "Date" },
  { id: "noite", label: "Noite" },
  { id: "viagem", label: "Viagem" },
];

const PRICE_RANGES = [
  { id: "acessivel", label: "Acessível" },
  { id: "medio", label: "Médio" },
  { id: "premium", label: "Premium" },
  { id: "misturar", label: "Misturar" },
];

const REGIONS = [
  { id: "brasil", label: "Brasil" },
  { id: "global", label: "Global" },
];

const FRAGRANCE_INTENSITY = [
  { id: "suave", label: "Suave" },
  { id: "medio", label: "Médio" },
  { id: "marcante", label: "Marcante" },
];

const InputPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const initialMode = searchParams.get("mode") === "url" ? "url" : "upload";
  const [mode, setMode] = useState<"upload" | "url">(initialMode);

  // Image states
  const [images, setImages] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([]);

  // Preferences
  const [occasion, setOccasion] = useState("casual");
  const [priceRange, setPriceRange] = useState("misturar");
  const [region, setRegion] = useState("brasil");
  const [fragranceIntensity, setFragranceIntensity] = useState("medio");

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const hasValidInput = mode === "upload" 
    ? images.length === 3 
    : urls.filter((u) => {
        try { new URL(u); return true; } catch { return false; }
      }).length === 3;

  const handleGenerate = async () => {
    if (!hasValidInput) return;

    setIsLoading(true);
    setHasError(false);

    try {
      const imageData = mode === "upload" ? images : urls;
      
      const { data, error } = await supabase.functions.invoke("generate-editorial", {
        body: {
          images: imageData,
          isUrls: mode === "url",
          preferences: {
            occasion,
            priceRange,
            region,
            fragranceIntensity,
          },
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Erro ao gerar editorial");
      }

      // Parse result with fallbacks
      let result: EditorialResult;
      try {
        result = data as EditorialResult;
        // Validate essential fields
        if (!result.profile || !result.editorial) {
          throw new Error("Invalid response structure");
        }
      } catch {
        console.error("Invalid response, using fallback:", data);
        result = DEFAULT_RESULT;
      }

      // Save to history
      const preferences: UserPreferences = {
        occasion,
        priceRange,
        region,
        fragranceIntensity,
      };
      const id = saveResult(result, preferences);

      // Navigate to results
      navigate(`/resultado/${id}`);
    } catch (err) {
      console.error("Error generating editorial:", err);
      setHasError(true);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(false);
  };

  if (isLoading || hasError) {
    return <LoadingEditorial hasError={hasError} onRetry={handleRetry} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-editorial py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="editorial-caption">Criar Editorial</span>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-muted rounded-sm mb-8">
          <button
            onClick={() => setMode("upload")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm transition-colors rounded-sm ${
              mode === "upload"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={() => setMode("url")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm transition-colors rounded-sm ${
              mode === "url"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            URLs
          </button>
        </div>

        {/* Input Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === "upload" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === "upload" ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            className="mb-10"
          >
            {mode === "upload" ? (
              <ImageUploader images={images} onImagesChange={setImages} maxImages={3} />
            ) : (
              <UrlInput urls={urls} onUrlsChange={setUrls} maxUrls={3} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Occasion */}
          <div>
            <span className="editorial-caption block mb-3">Ocasião</span>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => (
                <PreferenceChip
                  key={o.id}
                  label={o.label}
                  selected={occasion === o.id}
                  onClick={() => setOccasion(o.id)}
                />
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <span className="editorial-caption block mb-3">Faixa de Preço</span>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((p) => (
                <PreferenceChip
                  key={p.id}
                  label={p.label}
                  selected={priceRange === p.id}
                  onClick={() => setPriceRange(p.id)}
                />
              ))}
            </div>
          </div>

          {/* Region */}
          <div>
            <span className="editorial-caption block mb-3">Região</span>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <PreferenceChip
                  key={r.id}
                  label={r.label}
                  selected={region === r.id}
                  onClick={() => setRegion(r.id)}
                />
              ))}
            </div>
          </div>

          {/* Fragrance Intensity */}
          <div>
            <span className="editorial-caption block mb-3">Intensidade do Perfume</span>
            <div className="flex flex-wrap gap-2">
              {FRAGRANCE_INTENSITY.map((f) => (
                <PreferenceChip
                  key={f.id}
                  label={f.label}
                  selected={fragranceIntensity === f.id}
                  onClick={() => setFragranceIntensity(f.id)}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 pt-6 border-t border-border/30"
        >
          <EditorialButton
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!hasValidInput}
            onClick={handleGenerate}
          >
            Gerar Editorial
          </EditorialButton>
          {!hasValidInput && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Selecione exatamente 3 {mode === "upload" ? "imagens" : "URLs válidas"}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default InputPage;

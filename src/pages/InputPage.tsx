import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ImageIcon, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { ImageUploader } from "@/components/ImageUploader";
import { UrlInput } from "@/components/UrlInput";
import { PreferenceChip } from "@/components/PreferenceChip";
import { LoadingEditorial } from "@/components/LoadingEditorial";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveResult } from "@/lib/storage";
import { EditorialResult, DEFAULT_RESULT, UserPreferences, BRAND_CATEGORIES, BRAND_OBJECTIVES } from "@/lib/types";

const InputPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialMode = searchParams.get("mode") === "url" ? "url" : "upload";
  const isProMode = searchParams.get("pro") === "true";
  const [mode, setMode] = useState<"upload" | "url">(initialMode);

  // Brand inputs
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("lifestyle");
  const [objective, setObjective] = useState("consistencia");

  // Image states
  const [images, setImages] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([]);

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorType, setErrorType] = useState<string | undefined>();

  const hasValidInput = mode === "upload" 
    ? images.length === 3 
    : urls.filter((u) => {
        try { new URL(u); return true; } catch { return false; }
      }).length === 3;

  const hasValidBrand = brandName.trim().length >= 2;

  // Retryable error codes
  const RETRYABLE_ERRORS = [
    "no_json_in_response",
    "malformed_json", 
    "incomplete_editorial",
    "gateway_error",
    "no_model_content",
    "server_error",
  ];

  // Non-retryable errors
  const NON_RETRYABLE_ERRORS = [
    "selfie_not_allowed",
    "content_not_allowed",
    "rate_limited",
    "unauthorized",
  ];

  const callGenerateEditorial = async () => {
    const imageData = mode === "upload" ? images : urls;
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-editorial`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        images: imageData,
        isUrls: mode === "url",
        brandInfo: {
          name: brandName.trim(),
          category,
          objective,
        },
      }),
    });

    const data = await response.json();

    if (response.status === 429) {
      const retryAfter = data.retry_after || 60;
      throw { 
        type: "rate_limited", 
        message: `Muitas requisições. Tente novamente em ${retryAfter} segundos.` 
      };
    }

    if (response.status === 401) {
      throw { type: "unauthorized", message: data.message || "Acesso não autorizado." };
    }

    if (data?.error) {
      console.error("API error:", data.error, data.message);
      throw { type: data.error, message: data.message };
    }

    if (!data?.profile || !data?.editorial) {
      throw { type: "incomplete_editorial", message: "Estrutura inválida" };
    }

    return data as EditorialResult;
  };

  const handleGenerate = async () => {
    if (!hasValidInput || !hasValidBrand) return;

    setIsLoading(true);
    setHasError(false);
    setErrorType(undefined);

    const MAX_RETRIES = 1;
    let lastError: any = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Generation attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
        
        const result = await callGenerateEditorial();

        // Store images in sessionStorage for Pro flow
        const imageData = mode === "upload" ? images : urls;
        sessionStorage.setItem("editorial_images", JSON.stringify(imageData));

        // Save to history
        const preferences: UserPreferences = {
          brandName: brandName.trim(),
          category,
          objective,
        };
        const id = saveResult(result, preferences);

        // Navigate to results (or Pro if in pro mode)
        if (isProMode) {
          navigate(`/pro?from=${id}`);
        } else {
          navigate(`/resultado/${id}`);
        }
        return;
      } catch (err: any) {
        lastError = err;
        console.error(`Attempt ${attempt + 1} failed:`, err);

        if (NON_RETRYABLE_ERRORS.includes(err?.type)) {
          break;
        }

        const isRetryable = 
          err?.type === "network" || 
          RETRYABLE_ERRORS.includes(err?.type);

        if (!isRetryable || attempt === MAX_RETRIES) {
          break;
        }

        console.log("Retrying in 1 second...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.error("All attempts failed:", lastError);
    setErrorType(lastError?.type);
    setHasError(true);
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorType(undefined);
    setIsLoading(false);
  };

  if (isLoading || hasError) {
    return <LoadingEditorial hasError={hasError} errorType={errorType} onRetry={handleRetry} />;
  }

  const canSubmit = hasValidInput && hasValidBrand;

  return (
    <div className="min-h-screen bg-background">
      <div className="container-editorial py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="editorial-caption">
            {isProMode ? "DROP Pro" : "Criar Editorial"}
          </span>
        </div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Label htmlFor="brandName" className="editorial-caption block mb-3">
            Marca / Projeto
          </Label>
          <Input
            id="brandName"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Nome da marca ou projeto"
            className="bg-muted/30 border-border/50 text-lg"
          />
        </motion.div>

        {/* Category */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <span className="editorial-caption block mb-3">Categoria</span>
          <div className="flex flex-wrap gap-2">
            {BRAND_CATEGORIES.map((c) => (
              <PreferenceChip
                key={c.id}
                label={c.label}
                selected={category === c.id}
                onClick={() => setCategory(c.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Objective */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <span className="editorial-caption block mb-3">Objetivo</span>
          <div className="flex flex-wrap gap-2">
            {BRAND_OBJECTIVES.map((o) => (
              <PreferenceChip
                key={o.id}
                label={o.label}
                selected={objective === o.id}
                onClick={() => setObjective(o.id)}
              />
            ))}
          </div>
        </motion.div>

        <div className="editorial-divider mb-8" />

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
            className="mb-8"
          >
            {mode === "upload" ? (
              <ImageUploader images={images} onImagesChange={setImages} maxImages={3} />
            ) : (
              <UrlInput urls={urls} onUrlsChange={setUrls} maxUrls={3} />
            )}
          </motion.div>
        </AnimatePresence>

        <p className="text-xs text-muted-foreground mb-8">
          Use referências visuais da marca: moodboard, produto, editorial, UI.
        </p>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-6 border-t border-border/30"
        >
          <EditorialButton
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!canSubmit}
            onClick={handleGenerate}
          >
            {isProMode ? "Gerar Editorial Pro" : "Gerar Editorial"}
          </EditorialButton>
          {!canSubmit && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              {!hasValidBrand 
                ? "Digite o nome da marca" 
                : `Selecione exatamente 3 ${mode === "upload" ? "imagens" : "URLs válidas"}`
              }
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default InputPage;

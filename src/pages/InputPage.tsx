import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Link as LinkIcon } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { ImageUploader } from "@/components/ImageUploader";
import { UrlInput } from "@/components/UrlInput";
import { LoadingEditorial } from "@/components/LoadingEditorial";
import { CapsuleQuiz } from "@/components/CapsuleQuiz";
import { saveResult } from "@/lib/storage";
import { EditorialResult } from "@/lib/types";
import { CapsulePreferences, DEFAULT_CAPSULE_PREFERENCES } from "@/lib/capsule-types";
import BrazilNav from "@/components/BrazilNav";

const InputPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialMode = searchParams.get("mode") === "url" ? "url" : "upload";
  const [mode, setMode] = useState<"upload" | "url">(initialMode);

  // Image states
  const [images, setImages] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([]);

  // Capsule opt-in state
  const [includeCapsule, setIncludeCapsule] = useState(false);
  const [capsulePreferences, setCapsulePreferences] = useState<CapsulePreferences>(DEFAULT_CAPSULE_PREFERENCES);

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorType, setErrorType] = useState<string | undefined>();

  const hasValidInput = mode === "upload" 
    ? images.length === 3 
    : urls.filter((u) => {
        try { new URL(u); return true; } catch { return false; }
      }).length === 3;

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

  // Validate capsule preferences if opted in
  const hasCapsuleRequiredFields = !includeCapsule || (
    capsulePreferences.existing.length > 0 &&
    capsulePreferences.palette !== "" &&
    capsulePreferences.silhouette !== ""
  );

  const callGenerateEditorial = async () => {
    const imageData = mode === "upload" ? images : urls;
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    // Prepare capsule data only if opted in
    const capsuleData = includeCapsule ? {
      includeCapsule: true,
      capsulePreferences,
    } : { includeCapsule: false };
    
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
        ...capsuleData,
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
    if (!hasValidInput || !hasCapsuleRequiredFields) return;

    setIsLoading(true);
    setHasError(false);
    setErrorType(undefined);

    const MAX_RETRIES = 1;
    let lastError: any = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Generation attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
        
        const result = await callGenerateEditorial();

        // Store images in sessionStorage for reference
        const imageData = mode === "upload" ? images : urls;
        sessionStorage.setItem("editorial_images", JSON.stringify(imageData));

        // Save to history
        const id = saveResult(result);

        // Navigate to results
        navigate(`/resultado/${id}`);
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

  return (
    <div className="min-h-screen bg-background">
      <BrazilNav />

      <div className="container-editorial pt-24 py-8">

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="editorial-headline text-2xl md:text-3xl mb-3">
            Suas referências, sua identidade
          </h1>
          <p className="editorial-body text-muted-foreground">
            Envie 3 imagens que representam seu estilo ideal.
          </p>
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

        <p className="text-xs text-muted-foreground mb-6">
          Use moodboards, looks, beleza ou editoriais. Para estilo pessoal.
        </p>

        {/* Capsule Opt-in */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => setIncludeCapsule(!includeCapsule)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-dotted"
          >
            {includeCapsule ? "Remover cápsula" : "Quero incluir minha cápsula (opcional)"}
          </button>
          {!includeCapsule && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              Leva ~20 segundos.
            </p>
          )}
          
          {/* Capsule Quiz */}
          {includeCapsule && (
            <CapsuleQuiz
              preferences={capsulePreferences}
              onChange={setCapsulePreferences}
            />
          )}
        </div>

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
            disabled={!hasValidInput || !hasCapsuleRequiredFields}
            onClick={handleGenerate}
          >
            Gerar Editorial
          </EditorialButton>
          {!hasValidInput && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Selecione exatamente 3 {mode === "upload" ? "imagens" : "URLs válidas"}
            </p>
          )}
          {hasValidInput && includeCapsule && !hasCapsuleRequiredFields && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Complete as perguntas obrigatórias da cápsula
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default InputPage;

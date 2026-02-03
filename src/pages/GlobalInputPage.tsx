import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Link as LinkIcon } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { ImageUploader } from "@/components/ImageUploader";
import { UrlInput } from "@/components/UrlInput";
import { saveResult } from "@/lib/storage";
import { EditorialResult } from "@/lib/types";
import GlobalNav from "@/components/GlobalNav";

const GlobalInputPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialMode = searchParams.get("mode") === "url" ? "url" : "upload";
  const [mode, setMode] = useState<"upload" | "url">(initialMode);

  const [images, setImages] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const hasValidInput = mode === "upload" 
    ? images.length === 3 
    : urls.filter((u) => {
        try { new URL(u); return true; } catch { return false; }
      }).length === 3;

  const callGenerateEditorial = async () => {
    const imageData = mode === "upload" ? images : urls;
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-global-editorial`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        images: imageData,
        isUrls: mode === "url",
      }),
    });

    const data = await response.json();

    if (response.status === 429) {
      throw { message: "Too many requests. Please try again later." };
    }

    if (response.status === 401) {
      throw { message: data.message || "Unauthorized access." };
    }

    if (data?.error) {
      throw { message: data.message };
    }

    if (!data?.profile || !data?.editorial) {
      throw { message: "Invalid response structure." };
    }

    return data as EditorialResult;
  };

  const handleGenerate = async () => {
    if (!hasValidInput) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");

    try {
      const result = await callGenerateEditorial();

      const imageData = mode === "upload" ? images : urls;
      sessionStorage.setItem("editorial_images", JSON.stringify(imageData));
      sessionStorage.setItem("global_mode", "true");

      const id = saveResult(result);
      navigate(`/global/result/${id}`);
    } catch (err: any) {
      console.error("Generation error:", err);
      setErrorMessage(err?.message || "Error generating. Please try again.");
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalNav />
        <div className="container-editorial pt-24 py-20 text-center space-y-6">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="editorial-caption">Generating your aesthetic reading...</p>
          </motion.div>
          <p className="text-sm text-muted-foreground">This takes about 15 seconds.</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalNav />
        <div className="container-editorial pt-24 py-20 text-center space-y-6">
          <p className="text-lg text-foreground">{errorMessage}</p>
          <EditorialButton variant="primary" onClick={handleRetry}>
            Try again
          </EditorialButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />

      <div className="container-editorial pt-24 py-8">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="editorial-headline text-3xl md:text-4xl lg:text-5xl mb-4">
            Your style, edited.
          </h1>
          <p className="editorial-body text-muted-foreground max-w-md mx-auto">
            Upload 3 images that represent your ideal aesthetic.
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

        <p className="text-xs text-muted-foreground mb-8">
          Use moodboards, looks, beauty editorials, or fashion references.
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
            disabled={!hasValidInput}
            onClick={handleGenerate}
          >
            Generate Editorial
          </EditorialButton>
          {!hasValidInput && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Select exactly 3 {mode === "upload" ? "images" : "valid URLs"}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GlobalInputPage;

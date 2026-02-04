import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { ImageUploader } from "@/components/ImageUploader";
import { UrlInput } from "@/components/UrlInput";
import { LoadingEditorial } from "@/components/LoadingEditorial";
import { saveResult } from "@/lib/storage";
import { EditorialResult } from "@/lib/types";
import BrazilNav from "@/components/BrazilNav";

// Aesthetic definitions with editorial micro-descriptions
const AESTHETICS = [
  {
    id: "clean_glow",
    name: "Glow limpo",
    description: "Pele luminosa, minimalismo fresco, presença leve.",
  },
  {
    id: "minimal_chic",
    name: "Minimal chic",
    description: "Cortes precisos, neutros sofisticados, menos, melhor.",
  },
  {
    id: "romantic_modern",
    name: "Romântico moderno",
    description: "Suavidade com estrutura, feminilidade atual, gesto delicado.",
  },
  {
    id: "after_dark_minimal",
    name: "Minimal noturno",
    description: "Alto contraste, linhas limpas, noite polida.",
  },
  {
    id: "soft_grunge",
    name: "Grunge suave",
    description: "Texturas vividas, preto lavado, charme sem esforço.",
  },
  {
    id: "street_sporty",
    name: "Street sporty",
    description: "Energia urbana, peças utilitárias, conforto com intenção.",
  },
  {
    id: "color_pop",
    name: "Cor em destaque",
    description: "Paleta ousada, impacto controlado, statement inteligente.",
  },
  {
    id: "boho_updated",
    name: "Boho polido",
    description: "Fluidez, naturalidade, boho com acabamento.",
  },
  {
    id: "classic_luxe",
    name: "Clássico luxo",
    description: "Ícones atemporais, materiais nobres, elegância óbvia.",
  },
  {
    id: "coastal_cool",
    name: "Coastal cool",
    description: "Natural, claro, textura orgânica, refinamento relaxado.",
  },
  {
    id: "soft_glam",
    name: "Glam suave",
    description: "Polido, brilho sutil, beleza pronta para a câmera.",
  },
  {
    id: "artsy_eclectic",
    name: "Artsy eclético",
    description: "Combinações inesperadas, repertório criativo, assinatura própria.",
  },
];

type Step = 1 | 2;
type InputMode = "upload" | "url";

const CapsulePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [selectedAesthetic, setSelectedAesthetic] = useState<string | null>(null);
  
  // Step 2 states
  const [inputMode, setInputMode] = useState<InputMode>("upload");
  const [images, setImages] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorType, setErrorType] = useState<string | undefined>();

  const hasValidInput = inputMode === "upload" 
    ? images.length === 3 
    : urls.filter((u) => {
        try { new URL(u); return true; } catch { return false; }
      }).length === 3;

  const handleAestheticSelect = (id: string) => {
    setSelectedAesthetic(id === selectedAesthetic ? null : id);
  };

  const handleContinueToStep2 = () => {
    if (selectedAesthetic) {
      setStep(2);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
  };

  const callGenerateEditorial = async () => {
    const imageData = inputMode === "upload" ? images : urls;
    
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
        isUrls: inputMode === "url",
        preferredAesthetic: selectedAesthetic,
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
    if (!hasValidInput || !selectedAesthetic) return;

    setIsLoading(true);
    setHasError(false);
    setErrorType(undefined);

    try {
      const result = await callGenerateEditorial();

      // Store images in sessionStorage
      const imageData = inputMode === "upload" ? images : urls;
      sessionStorage.setItem("editorial_images", JSON.stringify(imageData));
      sessionStorage.setItem("capsule_aesthetic", selectedAesthetic);

      // Save to history
      const id = saveResult(result);

      // Navigate to results
      navigate(`/resultado/${id}`);
    } catch (err: any) {
      console.error("Generation failed:", err);
      setErrorType(err?.type);
      setHasError(true);
    }
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
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Choose Aesthetic */}
              <div className="mb-8 text-center">
                <span className="editorial-caption mb-2 block">Passo 1</span>
                <h1 className="editorial-headline text-2xl md:text-3xl mb-3">
                  Escolha sua direção
                </h1>
                <p className="editorial-body text-muted-foreground">
                  Escolha sua direção, nós organizamos o resto.
                </p>
              </div>

              <div className="editorial-divider mb-8" />

              {/* Aesthetic Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {AESTHETICS.map((aesthetic) => (
                  <motion.button
                    key={aesthetic.id}
                    onClick={() => handleAestheticSelect(aesthetic.id)}
                    className={`p-5 text-left rounded-lg border transition-all ${
                      selectedAesthetic === aesthetic.id
                        ? "border-foreground bg-foreground/5"
                        : "border-border/50 hover:border-foreground/30 hover:bg-muted/30"
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <h3 className="font-medium text-foreground mb-1">
                      {aesthetic.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {aesthetic.description}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Continue Button */}
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
                  disabled={!selectedAesthetic}
                  onClick={handleContinueToStep2}
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </EditorialButton>
                {!selectedAesthetic && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Selecione uma direção estética
                  </p>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 2: Upload References */}
              <div className="mb-6">
                <button
                  onClick={handleBackToStep1}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
                
                <span className="editorial-caption mb-2 block">Passo 2</span>
                <h1 className="editorial-headline text-2xl md:text-3xl mb-3">
                  Suas referências
                </h1>
                <p className="editorial-body text-muted-foreground">
                  Envie 3 imagens que representam seu estilo ideal.
                </p>
              </div>

              {/* Selected Aesthetic Badge */}
              {selectedAesthetic && (
                <div className="mb-6 p-3 bg-muted/30 rounded-lg inline-flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Direção:
                  </span>
                  <span className="text-sm font-medium">
                    {AESTHETICS.find(a => a.id === selectedAesthetic)?.name}
                  </span>
                </div>
              )}

              <div className="editorial-divider mb-8" />

              {/* Mode Toggle */}
              <div className="flex items-center gap-2 p-1 bg-muted rounded-sm mb-8">
                <button
                  onClick={() => setInputMode("upload")}
                  className={`flex-1 py-2 text-sm transition-colors rounded-sm ${
                    inputMode === "upload"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setInputMode("url")}
                  className={`flex-1 py-2 text-sm transition-colors rounded-sm ${
                    inputMode === "url"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  URLs
                </button>
              </div>

              {/* Input Area */}
              <div className="mb-8">
                {inputMode === "upload" ? (
                  <ImageUploader images={images} onImagesChange={setImages} maxImages={3} />
                ) : (
                  <UrlInput urls={urls} onUrlsChange={setUrls} maxUrls={3} />
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-8">
                Use moodboards, looks, beleza ou editoriais. Para estilo pessoal.
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
                  Gerar Editorial
                </EditorialButton>
                {!hasValidInput && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Selecione exatamente 3 {inputMode === "upload" ? "imagens" : "URLs válidas"}
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CapsulePage;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Check } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { LoadingCapsule } from "@/components/LoadingCapsule";
import { CAPSULE_AESTHETICS } from "@/lib/capsule-types";
import { normalizeOwnedItems, hasMinimumItems, getInsufficientItemsMessage } from "@/lib/capsule-normalizer";
import BrazilNav from "@/components/BrazilNav";

type Step = 1 | 2;

const MAX_AESTHETICS = 3;

const CapsulePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);
  
  // Step 2 states
  const [existingPieces, setExistingPieces] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorType, setErrorType] = useState<string | undefined>();

  const handleAestheticSelect = (id: string) => {
    setSelectedAesthetics(prev => {
      if (prev.includes(id)) {
        // Remove if already selected
        return prev.filter(a => a !== id);
      } else if (prev.length < MAX_AESTHETICS) {
        // Add if under limit
        return [...prev, id];
      }
      // At limit, don't add
      return prev;
    });
  };

  const handleContinueToStep2 = () => {
    if (selectedAesthetics.length > 0) {
      setStep(2);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setValidationError("");
  };

  const callGenerateCapsule = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-capsule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        aesthetic_ids: selectedAesthetics,
        owned_items_text: existingPieces.trim(),
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

    if (data?.error) {
      console.error("API error:", data.error, data.message);
      throw { type: data.error, message: data.message };
    }

    if (!data?.success || !data?.capsule) {
      throw { type: "incomplete_capsule", message: "Estrutura inválida" };
    }

    return data;
  };

  const handleGenerate = async () => {
    // Normalize input first
    const { normalized } = normalizeOwnedItems(existingPieces);
    
    // Validate minimum items after normalization
    if (!hasMinimumItems(normalized, 2)) {
      setValidationError(getInsufficientItemsMessage());
      return;
    }

    // Also validate raw input length
    if (existingPieces.trim().length < 10) {
      setValidationError("Escreva algumas peças, mesmo poucas já resolvem a base.");
      return;
    }

    if (selectedAesthetics.length === 0) return;

    setValidationError("");
    setIsLoading(true);
    setHasError(false);
    setErrorType(undefined);

    try {
      const result = await callGenerateCapsule();

      // Store result in sessionStorage
      sessionStorage.setItem("capsule_result", JSON.stringify(result.capsule));
      sessionStorage.setItem("capsule_aesthetic_ids", JSON.stringify(selectedAesthetics));

      // Navigate to capsule results
      navigate("/capsula/resultado");
    } catch (err: any) {
      console.error("Capsule generation failed:", err);
      setErrorType(err?.type);
      setHasError(true);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorType(undefined);
    setIsLoading(false);
  };

  // Get selected aesthetic names for display
  const getSelectedNames = () => {
    return selectedAesthetics
      .map(id => CAPSULE_AESTHETICS.find(a => a.id === id)?.name)
      .filter(Boolean)
      .join(" + ");
  };

  if (isLoading || hasError) {
    return <LoadingCapsule hasError={hasError} errorType={errorType} onRetry={handleRetry} />;
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
              {/* Step 1: Choose Aesthetics (up to 3) */}
              <div className="mb-8 text-center">
                <span className="editorial-caption mb-2 block">Passo 1</span>
                <h1 className="editorial-headline text-2xl md:text-3xl mb-3">
                  Escolha suas direções
                </h1>
                <p className="editorial-body text-muted-foreground">
                  Escolha até 3 estéticas — nós criamos a fusão perfeita.
                </p>
              </div>

              <div className="editorial-divider mb-8" />

              {/* Selection counter */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-sm text-muted-foreground">
                  {selectedAesthetics.length} de {MAX_AESTHETICS} selecionadas
                </span>
                {selectedAesthetics.length > 0 && (
                  <span className="text-sm text-foreground font-medium">
                    — {getSelectedNames()}
                  </span>
                )}
              </div>

              {/* Aesthetic Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {CAPSULE_AESTHETICS.map((aesthetic) => {
                  const isSelected = selectedAesthetics.includes(aesthetic.id);
                  const selectionIndex = selectedAesthetics.indexOf(aesthetic.id);
                  const isDisabled = !isSelected && selectedAesthetics.length >= MAX_AESTHETICS;
                  
                  return (
                    <motion.button
                      key={aesthetic.id}
                      onClick={() => handleAestheticSelect(aesthetic.id)}
                      disabled={isDisabled}
                      className={`relative p-5 text-left rounded-lg border transition-all ${
                        isSelected
                          ? "border-foreground bg-foreground/5"
                          : isDisabled
                          ? "border-border/30 opacity-50 cursor-not-allowed"
                          : "border-border/50 hover:border-foreground/30 hover:bg-muted/30"
                      }`}
                      whileHover={!isDisabled ? { scale: 1.01 } : undefined}
                      whileTap={!isDisabled ? { scale: 0.99 } : undefined}
                    >
                      {/* Selection badge */}
                      {isSelected && (
                        <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">
                          {selectionIndex + 1}
                        </span>
                      )}
                      <h3 className="font-medium text-foreground mb-1 pr-8">
                        {aesthetic.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {aesthetic.description}
                      </p>
                    </motion.button>
                  );
                })}
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
                  disabled={selectedAesthetics.length === 0}
                  onClick={handleContinueToStep2}
                >
                  {selectedAesthetics.length > 1 ? "Criar fusão" : "Continuar"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </EditorialButton>
                {selectedAesthetics.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Selecione pelo menos uma direção estética
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
              {/* Step 2: Describe pieces */}
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
                  Suas peças
                </h1>
                <p className="editorial-body text-muted-foreground">
                  Descreva as peças que você já tem no guarda-roupa.
                </p>
                
                {/* Show selected aesthetics */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedAesthetics.map(id => {
                    const aesthetic = CAPSULE_AESTHETICS.find(a => a.id === id);
                    return aesthetic ? (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-foreground/5 border border-foreground/10 rounded-full text-xs"
                      >
                        <Check className="w-3 h-3" />
                        {aesthetic.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="editorial-divider mb-8" />

              {/* Existing Pieces Field */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Escreva as peças que você já tem
                </label>
                <textarea
                  value={existingPieces}
                  onChange={(e) => {
                    setExistingPieces(e.target.value);
                    if (validationError) setValidationError("");
                  }}
                  placeholder="Ex: calça reta de alfaiataria, camisa de seda, blazer bem estruturado, trench coat, camiseta branca encorpada, jeans escuro reto, loafer de couro, bota de cano curto, bolsa pequena estruturada"
                  className={`w-full min-h-[120px] p-4 text-sm bg-background border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/60 ${
                    validationError ? "border-destructive" : "border-border/50"
                  }`}
                />
                {validationError ? (
                  <p className="text-xs text-destructive mt-2">
                    {validationError}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">
                    Mesmo poucas peças já resolvem a base, o resto a gente edita.
                  </p>
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
                  onClick={handleGenerate}
                >
                  Montar minha cápsula
                </EditorialButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CapsulePage;

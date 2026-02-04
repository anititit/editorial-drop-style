import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { LoadingCapsule } from "@/components/LoadingCapsule";
import { CAPSULE_AESTHETICS } from "@/lib/capsule-types";
import BrazilNav from "@/components/BrazilNav";

type Step = 1 | 2;

const CapsulePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [selectedAesthetic, setSelectedAesthetic] = useState<string | null>(null);
  
  // Step 2 states
  const [existingPieces, setExistingPieces] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorType, setErrorType] = useState<string | undefined>();

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
        aesthetic_id: selectedAesthetic,
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
    // Validate minimum 10 characters
    if (existingPieces.trim().length < 10) {
      setValidationError("Escreva algumas peças, mesmo poucas já resolvem a base.");
      return;
    }

    if (!selectedAesthetic) return;

    setValidationError("");
    setIsLoading(true);
    setHasError(false);
    setErrorType(undefined);

    try {
      const result = await callGenerateCapsule();

      // Store result in sessionStorage
      sessionStorage.setItem("capsule_result", JSON.stringify(result.capsule));
      sessionStorage.setItem("capsule_aesthetic_id", selectedAesthetic);

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
                {CAPSULE_AESTHETICS.map((aesthetic) => (
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

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { saveResult } from "@/lib/storage";
import { DEFAULT_RESULT } from "@/lib/types";

interface LoadingStep {
  text: string;
  startTime: number;
  endTime: number;
}

const LOADING_STEPS: LoadingStep[] = [
  { text: "Lendo as referências…", startTime: 0, endTime: 6000 },
  { text: "Editando paleta e silhuetas…", startTime: 6000, endTime: 14000 },
  { text: "Montando o editorial…", startTime: 14000, endTime: 25000 },
];

const EXTENDED_THRESHOLD = 25000;

// Error messages for specific error types
const ERROR_MESSAGES: Record<string, { title: string; text: string }> = {
  selfie_not_allowed: {
    title: "Use só referências, por favor.",
    text: "Este projeto não aceita selfies. Envie imagens de editorial, produtos, texturas ou cenários.",
  },
  content_not_allowed: {
    title: "Não consigo usar essas imagens.",
    text: "Envie apenas referências de moda/beleza (sem nudez e sem menores).",
  },
  rate_limited: {
    title: "Um instante — estamos em fechamento.",
    text: "Recebemos muitas tentativas em sequência. Tente novamente em 1 minuto para finalizar seu editorial.",
  },
  unauthorized: {
    title: "Acesso não autorizado.",
    text: "Não foi possível validar sua sessão. Tente recarregar a página.",
  },
};

const DEFAULT_ERROR = {
  title: "Não deu pra montar seu editorial.",
  text: "Tente outras referências ou use 'Ver exemplo'.",
};

interface LoadingEditorialProps {
  hasError?: boolean;
  errorType?: string;
  onRetry?: () => void;
}

export function LoadingEditorial({ hasError = false, errorType, onRetry }: LoadingEditorialProps) {
  const navigate = useNavigate();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExtended, setIsExtended] = useState(false);

  useEffect(() => {
    if (hasError) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);

      // Update current step
      const stepIndex = LOADING_STEPS.findIndex(
        (step) => elapsed >= step.startTime && elapsed < step.endTime
      );
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex);
      }

      // Check if extended loading
      if (elapsed >= EXTENDED_THRESHOLD) {
        setIsExtended(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hasError]);

  const handleViewExample = () => {
    // Save default result as example
    const id = saveResult(DEFAULT_RESULT, {
      occasion: "casual",
      priceRange: "misturar",
      region: "brasil",
      fragranceIntensity: "medio",
    });
    navigate(`/resultado/${id}`);
  };

  // Get error message based on type
  const errorMessage = errorType && ERROR_MESSAGES[errorType] 
    ? ERROR_MESSAGES[errorType] 
    : DEFAULT_ERROR;

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-sm"
        >
          <div className="space-y-3">
            <h2 className="editorial-headline text-2xl">
              {errorMessage.title}
            </h2>
            <p className="editorial-body text-muted-foreground">
              {errorMessage.text}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <EditorialButton variant="primary" onClick={onRetry} className="w-full">
              Tentar novamente
            </EditorialButton>
            <EditorialButton variant="secondary" onClick={handleViewExample} className="w-full">
              Ver exemplo
            </EditorialButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading state
  const currentStepText = isExtended
    ? "Finalizando seu editorial…"
    : LOADING_STEPS[currentStep]?.text || LOADING_STEPS[0].text;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-8"
      >
        {/* Animated dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-foreground rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        <div className="space-y-4">
          {/* Current step text */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentStepText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="editorial-headline text-2xl"
            >
              {currentStepText}
            </motion.h2>
          </AnimatePresence>

          {/* Extended loading secondary text */}
          <AnimatePresence>
            {isExtended && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="editorial-body text-muted-foreground text-sm max-w-xs mx-auto"
              >
                Suas referências podem ser mais conceituais — estamos fechando a curadoria.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Progress indicator */}
        {!isExtended && (
          <div className="flex items-center justify-center gap-2">
            {LOADING_STEPS.map((_, i) => (
              <motion.div
                key={i}
                className={`h-1 w-8 rounded-full transition-colors duration-300 ${
                  i <= currentStep ? "bg-foreground" : "bg-muted"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

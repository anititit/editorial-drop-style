import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EditorialButton } from "@/components/ui/EditorialButton";

interface LoadingStep {
  text: string;
  startTime: number;
  endTime: number;
}

const LOADING_STEPS: LoadingStep[] = [
  { text: "Lendo suas peças…", startTime: 0, endTime: 5000 },
  { text: "Analisando o que você já cobre…", startTime: 5000, endTime: 12000 },
  { text: "Montando a cápsula…", startTime: 12000, endTime: 20000 },
];

const EXTENDED_THRESHOLD = 20000;

// Error messages for capsule-specific errors
const ERROR_MESSAGES: Record<string, { title: string; text: string }> = {
  rate_limited: {
    title: "Um instante — estamos em fechamento.",
    text: "Recebemos muitas tentativas em sequência. Tente novamente em 1 minuto.",
  },
  invalid_input: {
    title: "Precisamos de mais informação.",
    text: "Escreva algumas peças do seu guarda-roupa para montarmos a cápsula.",
  },
  insufficient_items: {
    title: "Preciso de mais peças.",
    text: "Você pode citar 3 a 6 peças, mesmo básicas, para eu fechar a cápsula com precisão.",
  },
};

const DEFAULT_ERROR = {
  title: "Não conseguimos montar sua cápsula.",
  text: "Tente descrever suas peças de forma diferente.",
};

interface LoadingCapsuleProps {
  hasError?: boolean;
  errorType?: string;
  onRetry?: () => void;
}

export function LoadingCapsule({ hasError = false, errorType, onRetry }: LoadingCapsuleProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExtended, setIsExtended] = useState(false);

  useEffect(() => {
    if (hasError) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);

      const stepIndex = LOADING_STEPS.findIndex(
        (step) => elapsed >= step.startTime && elapsed < step.endTime
      );
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex);
      }

      if (elapsed >= EXTENDED_THRESHOLD) {
        setIsExtended(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hasError]);

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
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading state
  const currentStepText = isExtended
    ? "Finalizando sua cápsula…"
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

          <AnimatePresence>
            {isExtended && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="editorial-body text-muted-foreground text-sm max-w-xs mx-auto"
              >
                Organizando prioridades para você.
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

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingStep {
  text: string;
  startTime: number;
  endTime: number;
}

const LOADING_STEPS: LoadingStep[] = [
  { text: "Lendo as referências…", startTime: 0, endTime: 8000 },
  { text: "Fechando a edição…", startTime: 8000, endTime: 18000 },
  { text: "Polindo os códigos de marca…", startTime: 18000, endTime: 30000 },
];

const EXTENDED_THRESHOLD = 30000;

interface ProLoadingEditorialProps {
  hasError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export function ProLoadingEditorial({
  hasError = false,
  errorMessage,
  onRetry,
}: ProLoadingEditorialProps) {
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

  // Error state
  if (hasError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-sm"
        >
          <div className="space-y-3">
            <h2 className="editorial-headline text-xl">
              Não foi possível gerar o editorial.
            </h2>
            <p className="editorial-body text-muted-foreground text-sm">
              {errorMessage || "Tente novamente com outras referências."}
            </p>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm underline text-muted-foreground hover:text-foreground transition-colors"
            >
              Tentar novamente
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  const currentStepText = isExtended
    ? "Finalizando…"
    : LOADING_STEPS[currentStep]?.text || LOADING_STEPS[0].text;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
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
              className="editorial-headline text-xl"
            >
              {currentStepText}
            </motion.h2>
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

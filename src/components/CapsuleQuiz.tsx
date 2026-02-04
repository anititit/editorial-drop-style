import { motion, AnimatePresence } from "framer-motion";
import { PreferenceChip } from "@/components/PreferenceChip";
import { CAPSULE_QUIZ, CapsulePreferences } from "@/lib/capsule-types";

interface CapsuleQuizProps {
  preferences: CapsulePreferences;
  onChange: (preferences: CapsulePreferences) => void;
}

export function CapsuleQuiz({ preferences, onChange }: CapsuleQuizProps) {
  const handleMultiSelect = (key: keyof CapsulePreferences, value: string) => {
    const current = preferences[key] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...preferences, [key]: updated });
  };

  const handleSingleSelect = (key: keyof CapsulePreferences, value: string) => {
    const current = preferences[key];
    // Toggle off if same value selected
    onChange({ ...preferences, [key]: current === value ? "" : value });
  };

  const renderQuestion = (
    key: keyof typeof CAPSULE_QUIZ,
    config: (typeof CAPSULE_QUIZ)[keyof typeof CAPSULE_QUIZ],
    index: number
  ) => {
    const isMulti = config.multi;
    const isOptional = !config.required;
    const currentValue = preferences[key as keyof CapsulePreferences];

    return (
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        className="space-y-3"
      >
        <label className="block text-sm text-foreground">
          {config.label}
          {isOptional && (
            <span className="text-muted-foreground ml-1">(opcional)</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {config.options.map((option) => {
            const isSelected = isMulti
              ? (currentValue as string[]).includes(option.id)
              : currentValue === option.id;

            return (
              <PreferenceChip
                key={option.id}
                label={option.label}
                selected={isSelected}
                onClick={() =>
                  isMulti
                    ? handleMultiSelect(key as keyof CapsulePreferences, option.id)
                    : handleSingleSelect(key as keyof CapsulePreferences, option.id)
                }
              />
            );
          })}
        </div>
      </motion.div>
    );
  };

  const questions = Object.entries(CAPSULE_QUIZ) as [
    keyof typeof CAPSULE_QUIZ,
    (typeof CAPSULE_QUIZ)[keyof typeof CAPSULE_QUIZ]
  ][];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 py-6 border-t border-border/30"
      >
        <p className="text-xs text-muted-foreground italic">
          Responda o que se aplica. Leva ~20 segundos.
        </p>
        {questions.map(([key, config], index) =>
          renderQuestion(key, config, index)
        )}
      </motion.div>
    </AnimatePresence>
  );
}

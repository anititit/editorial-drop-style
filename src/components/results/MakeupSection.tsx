import { motion } from "framer-motion";
import { MakeupStep } from "@/lib/types";
import { Sun, Moon } from "lucide-react";

interface MakeupCardProps {
  title: string;
  icon: React.ReactNode;
  makeup: MakeupStep;
}

function MakeupCard({ title, icon, makeup }: MakeupCardProps) {
  const steps = [
    { label: "Base", value: makeup.base },
    { label: "Bochechas", value: makeup.cheeks },
    { label: "Olhos", value: makeup.eyes },
    { label: "Lábios", value: makeup.lips },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="editorial-caption">{title}</span>
      </div>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.label} className="flex items-start gap-3">
            <span className="text-xs text-muted-foreground w-20 flex-shrink-0 uppercase tracking-wider pt-0.5">
              {step.label}
            </span>
            <span className="text-sm editorial-body">{step.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MakeupSectionProps {
  day: MakeupStep;
  night: MakeupStep;
}

export function MakeupSection({ day, night }: MakeupSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-8"
    >
      <div className="text-center">
        <span className="editorial-caption">Beleza</span>
        <h2 className="editorial-headline text-2xl mt-2">Maquiagem</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <MakeupCard
          title="Dia"
          icon={<Sun className="w-4 h-4 text-muted-foreground" />}
          makeup={day}
        />
        <MakeupCard
          title="Noite"
          icon={<Moon className="w-4 h-4 text-muted-foreground" />}
          makeup={night}
        />
      </div>
    </motion.section>
  );
}

import { CapsuleResult } from "@/lib/capsule-types";
import { EditorialToggleSection } from "./EditorialToggleSection";

interface CapsuleResultSectionProps {
  capsule: CapsuleResult;
}

export function CapsuleResultSection({ capsule }: CapsuleResultSectionProps) {
  return (
    <EditorialToggleSection
      title="Minha cápsula"
      introLine="O que você já tem, e o que falta para fechar a direção."
      defaultOpen={false}
    >
      <div className="space-y-8">
        {/* What's already aligned */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground tracking-wide uppercase">
            O que já está alinhado
          </h3>
          <ul className="space-y-2">
            {capsule.aligned.map((item, idx) => (
              <li key={idx} className="editorial-body text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-foreground/40 mt-0.5">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What's missing */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground tracking-wide uppercase">
            O que falta para fechar a direção
          </h3>
          <ul className="space-y-2">
            {capsule.missing_prioritized.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                  Prioridade {item.priority}
                </span>
                <span className="editorial-body text-sm text-foreground">
                  {item.item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Smart investments */}
        <div className="space-y-3 pt-4 border-t border-border/20">
          <h3 className="text-sm font-medium text-foreground tracking-wide uppercase">
            Próximos 3 investimentos inteligentes
          </h3>
          <div className="space-y-4">
            {/* Hero */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Hero
              </span>
              <p className="editorial-body text-foreground">
                {capsule.smart_investments.hero}
              </p>
            </div>
            {/* Supporting */}
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Supporting
              </span>
              {capsule.smart_investments.supporting.map((item, idx) => (
                <p key={idx} className="editorial-body text-sm text-foreground/80">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </EditorialToggleSection>
  );
}

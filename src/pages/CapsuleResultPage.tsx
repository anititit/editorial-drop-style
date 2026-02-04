import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, AlertCircle, Sparkles } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { CapsuleResult, CAPSULE_AESTHETICS } from "@/lib/capsule-types";
import BrazilNav from "@/components/BrazilNav";

const CapsuleResultPage = () => {
  const navigate = useNavigate();
  const [capsule, setCapsule] = useState<CapsuleResult | null>(null);
  const [aestheticId, setAestheticId] = useState<string>("");

  useEffect(() => {
    const storedCapsule = sessionStorage.getItem("capsule_result");
    const storedAesthetic = sessionStorage.getItem("capsule_aesthetic_id");

    if (!storedCapsule) {
      navigate("/capsula");
      return;
    }

    try {
      setCapsule(JSON.parse(storedCapsule));
      setAestheticId(storedAesthetic || "");
    } catch {
      navigate("/capsula");
    }
  }, [navigate]);

  if (!capsule) {
    return null;
  }

  const aesthetic = CAPSULE_AESTHETICS.find((a) => a.id === aestheticId);

  return (
    <div className="min-h-screen bg-background">
      <BrazilNav />

      <div className="container-editorial pt-24 pb-16">
        {/* Back button */}
        <button
          onClick={() => navigate("/capsula")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Nova cápsula
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="editorial-headline text-3xl md:text-4xl mb-3">
            Sua cápsula, com direção.
          </h1>
          {aesthetic && (
            <p className="editorial-body text-muted-foreground">
              Direção: {aesthetic.name}
            </p>
          )}
        </motion.div>

        <div className="editorial-divider mb-10" />

        {/* Edit Rule - Featured */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-foreground/5 border border-foreground/10 rounded-lg p-6 mb-10 text-center"
        >
          <span className="editorial-caption text-xs mb-2 block">Regra do edit</span>
          <p className="editorial-headline text-lg md:text-xl">
            "{capsule.edit_rule}"
          </p>
        </motion.div>

        <div className="grid gap-10 md:gap-12">
          {/* Section: What you already cover */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-foreground" />
              <h2 className="editorial-headline text-xl">O que você já cobre</h2>
            </div>
            <div className="space-y-2">
              {capsule.covered.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <span className="text-foreground/60 text-sm mt-0.5">✓</span>
                  <p className="editorial-body text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Section: If you only fix 3 things */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-foreground" />
              <h2 className="editorial-headline text-xl">Se você só resolver 3 coisas</h2>
            </div>
            <div className="space-y-4">
              {capsule.top_three.map((item, index) => (
                <div
                  key={index}
                  className="border border-foreground/20 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background text-sm font-medium shrink-0">
                      {item.priority}
                    </span>
                    <div>
                      <p className="font-medium text-foreground mb-1">{item.item}</p>
                      <p className="text-sm text-muted-foreground">{item.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Section: What's missing */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-foreground" />
              <h2 className="editorial-headline text-xl">O que falta, por ordem de prioridade</h2>
            </div>
            <div className="space-y-3">
              {capsule.missing.slice(0, 10).map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border border-border/50 rounded-lg"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-foreground text-xs font-medium shrink-0">
                    {item.priority}
                  </span>
                  <div>
                    <p className="font-medium text-foreground mb-0.5">{item.item}</p>
                    <p className="text-sm text-muted-foreground">{item.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-border/30"
        >
          <EditorialButton
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => navigate("/capsula")}
          >
            Montar outra cápsula
          </EditorialButton>
        </motion.div>
      </div>
    </div>
  );
};

export default CapsuleResultPage;

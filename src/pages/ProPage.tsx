import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle2, Copy, Check } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProImageUploader } from "@/components/ProImageUploader";
import { cn } from "@/lib/utils";

// Structured options
const OBJECTIVES = [
  { id: "consistencia", label: "Consistência" },
  { id: "conversao", label: "Conversão" },
  { id: "lancamento", label: "Lançamento" },
  { id: "reposicionamento", label: "Reposicionamento" },
  { id: "evento", label: "Evento" },
] as const;

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "pinterest", label: "Pinterest" },
] as const;

const OCCASIONS = [
  { id: "dia_a_dia", label: "Dia a dia" },
  { id: "trabalho", label: "Trabalho" },
  { id: "date", label: "Date" },
  { id: "noite", label: "Noite" },
  { id: "evento", label: "Evento" },
] as const;

const TONES = [
  { id: "minimal_chic", label: "Minimalista Chique" },
  { id: "romantic_modern", label: "Romântico Moderno" },
  { id: "after_dark_minimal", label: "After Dark" },
  { id: "soft_grunge", label: "Soft Grunge" },
  { id: "classic_luxe", label: "Clássico Luxo" },
  { id: "color_pop", label: "Color Pop" },
] as const;

const BUDGETS = [
  { id: "acessivel", label: "Acessível" },
  { id: "intermediario", label: "Intermediário" },
  { id: "premium", label: "Premium" },
  { id: "mix", label: "Mix" },
] as const;

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  objective: string;
  platforms: string[];
  occasion: string;
  tone: string;
  budget: string;
  notes: string;
  referenceUrls: string[];
}

const generateOrderCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RECORTE-${code}`;
};

const ProPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    whatsapp: "",
    objective: "",
    platforms: [],
    occasion: "",
    tone: "",
    budget: "",
    notes: "",
    referenceUrls: [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleObjectiveChange = (id: string) => {
    setFormData((prev) => ({ ...prev, objective: id }));
  };

  const handlePlatformToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(id)
        ? prev.platforms.filter((p) => p !== id)
        : [...prev.platforms, id],
    }));
  };

  const handleOccasionChange = (id: string) => {
    setFormData((prev) => ({ ...prev, occasion: id }));
  };

  const handleToneChange = (id: string) => {
    setFormData((prev) => ({ ...prev, tone: id }));
  };

  const handleBudgetChange = (id: string) => {
    setFormData((prev) => ({ ...prev, budget: id }));
  };

  const handleReferencesChange = (urls: string[]) => {
    setFormData((prev) => ({ ...prev, referenceUrls: urls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.whatsapp.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, e-mail e WhatsApp.",
        variant: "destructive",
      });
      return;
    }

    if (formData.referenceUrls.length !== 3) {
      toast({
        title: "Referências necessárias",
        description: "Adicione exatamente 3 imagens de referência.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const code = generateOrderCode();

    try {
      const { error } = await supabase.from("pro_requests").insert({
        order_code: code,
        name: formData.name.trim(),
        email: formData.email.trim(),
        whatsapp: formData.whatsapp.trim(),
        objective: formData.objective || null,
        platform: formData.platforms.join(", ") || null,
        occasion: formData.occasion || null,
        tone: formData.tone || null,
        budget: formData.budget || null,
        reference_urls: formData.referenceUrls,
      });

      if (error) throw error;

      setOrderCode(code);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting pro request:", error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderCode = () => {
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-editorial py-8 md:py-12">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="text-center space-y-4 mb-10">
                <span className="editorial-caption">Editorial Drop Pro</span>
                <h1 className="editorial-headline text-3xl md:text-4xl">
                  Seu briefing editorial
                </h1>
                <p className="editorial-body text-muted-foreground max-w-md mx-auto">
                  Monte seu pedido em poucos cliques. Entrega em até 24h — muitas
                  vezes no mesmo dia.
                </p>
              </div>

              <div className="editorial-divider mb-10" />

              {/* Form */}
              <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-10">
                {/* Contact info */}
                <div className="space-y-4">
                  <h2 className="editorial-caption">Contato</h2>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome ou @</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Como prefere ser chamado"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input
                          id="whatsapp"
                          name="whatsapp"
                          placeholder="+55 11 99999-9999"
                          value={formData.whatsapp}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Objective - Radio */}
                <div className="space-y-4">
                  <h2 className="editorial-caption">Objetivo principal</h2>
                  <p className="text-sm text-muted-foreground -mt-2">
                    O que você busca com esse editorial?
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {OBJECTIVES.map((obj) => (
                      <button
                        key={obj.id}
                        type="button"
                        onClick={() => handleObjectiveChange(obj.id)}
                        className={cn(
                          "px-4 py-2.5 text-sm border rounded-sm transition-all",
                          formData.objective === obj.id
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground/50"
                        )}
                      >
                        {obj.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform - Checkboxes */}
                <div className="space-y-4">
                  <h2 className="editorial-caption">Plataformas</h2>
                  <p className="text-sm text-muted-foreground -mt-2">
                    Onde você pretende usar? (opcional)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((plat) => (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => handlePlatformToggle(plat.id)}
                        className={cn(
                          "px-4 py-2 text-sm border rounded-sm transition-all",
                          formData.platforms.includes(plat.id)
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground/50"
                        )}
                      >
                        {plat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occasion - Dropdown style as buttons */}
                <div className="space-y-4">
                  <h2 className="editorial-caption">Ocasião</h2>
                  <p className="text-sm text-muted-foreground -mt-2">
                    Para qual momento da sua rotina?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {OCCASIONS.map((occ) => (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => handleOccasionChange(occ.id)}
                        className={cn(
                          "px-4 py-2 text-sm border rounded-sm transition-all",
                          formData.occasion === occ.id
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground/50"
                        )}
                      >
                        {occ.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone - Selectable chips */}
                <div className="space-y-4">
                  <h2 className="editorial-caption">Estética</h2>
                  <p className="text-sm text-muted-foreground -mt-2">
                    Qual direção visual te representa?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => handleToneChange(tone.id)}
                        className={cn(
                          "px-4 py-2 text-sm border rounded-sm transition-all",
                          formData.tone === tone.id
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground/50"
                        )}
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget - Dropdown style */}
                <div className="space-y-4">
                  <h2 className="editorial-caption">Faixa de investimento</h2>
                  <p className="text-sm text-muted-foreground -mt-2">
                    Qual range de preço para as peças?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map((bud) => (
                      <button
                        key={bud.id}
                        type="button"
                        onClick={() => handleBudgetChange(bud.id)}
                        className={cn(
                          "px-4 py-2 text-sm border rounded-sm transition-all",
                          formData.budget === bud.id
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground/50"
                        )}
                      >
                        {bud.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes - Optional */}
                <div className="space-y-4">
                  <h2 className="editorial-caption">Notas extras</h2>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Detalhes rápidos que ajudem (ex: evitar muito preto, preferir alfaiataria…)"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Opcional</p>
                </div>

                {/* References */}
                <div className="space-y-4">
                  <h2 className="editorial-caption">Referências visuais</h2>
                  <p className="text-sm text-muted-foreground -mt-2">
                    3 imagens de moodboard ou inspiração — sem selfies.
                  </p>
                  <ProImageUploader
                    urls={formData.referenceUrls}
                    onUrlsChange={handleReferencesChange}
                    maxImages={3}
                  />
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <EditorialButton
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar briefing
                      </>
                    )}
                  </EditorialButton>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Entrega em até 24h • PDF A4 pronto para usar
                  </p>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16 space-y-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 className="w-16 h-16 mx-auto text-primary" />
              </motion.div>

              <div className="space-y-4">
                <span className="editorial-caption">Pedido recebido</span>
                <h1 className="editorial-headline text-3xl md:text-4xl">
                  Obrigado, {formData.name.split(" ")[0]}!
                </h1>
                <p className="editorial-body text-muted-foreground max-w-md mx-auto">
                  Entrega em até 24h — muitas vezes no mesmo dia. Você receberá
                  seu editorial por e-mail e WhatsApp.
                </p>
              </div>

              <div className="editorial-divider" />

              {/* Order code */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Código do pedido</p>
                <button
                  onClick={copyOrderCode}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-muted rounded-sm hover:bg-muted/80 transition-colors"
                >
                  <span className="font-mono text-xl font-semibold tracking-wider">
                    {orderCode}
                  </span>
                  {copied ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>

              <div className="pt-8">
                <Link to="/">
                  <EditorialButton variant="secondary">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao início
                  </EditorialButton>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProPage;

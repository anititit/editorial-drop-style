import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Send } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PreferenceChip } from "@/components/PreferenceChip";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { getResultById } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const OBJECTIVES = [
  { id: "consistencia", label: "Consistência do feed" },
  { id: "conversao", label: "Conversão" },
  { id: "lancamento", label: "Lançamento / drop" },
  { id: "reposicionamento", label: "Reposicionamento" },
];

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
];

const TONES = [
  { id: "minimal_chic", label: "Minimal chic" },
  { id: "romantic_modern", label: "Romantic modern" },
  { id: "after_dark", label: "After dark" },
  { id: "soft_grunge", label: "Soft grunge" },
  { id: "classic_luxe", label: "Classic luxe" },
  { id: "color_pop", label: "Color pop" },
];

const PRICE_POSITIONS = [
  { id: "acessivel", label: "Acessível" },
  { id: "intermediario", label: "Intermediário" },
  { id: "premium", label: "Premium" },
  { id: "mix", label: "Mix" },
];

const ProPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fromResultId = searchParams.get("from");

  // Form state
  const [brandName, setBrandName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [objective, setObjective] = useState("consistencia");
  const [platforms, setPlatforms] = useState<string[]>(["instagram"]);
  const [contentContext, setContentContext] = useState("");
  const [tone, setTone] = useState("minimal_chic");
  const [pricePosition, setPricePosition] = useState("intermediario");
  const [admiredBrands, setAdmiredBrands] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reference URLs from B2C session
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [hasB2CSession, setHasB2CSession] = useState(false);

  useEffect(() => {
    if (fromResultId) {
      const savedResult = getResultById(fromResultId);
      if (savedResult) {
        setHasB2CSession(true);
        // Note: In practice, we'd need to store the original image URLs
        // For now, we'll indicate session exists but URLs need re-entry
      }
    }
  }, [fromResultId]);

  const togglePlatform = (platformId: string) => {
    setPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const generateOrderCode = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(2, 10).replace(/-/g, "");
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PRO-${dateStr}-${random}`;
  };

  const isFormValid = brandName.trim() && whatsapp.trim() && platforms.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const orderCode = generateOrderCode();
      
      const { error } = await supabase.from("pro_requests").insert({
        order_code: orderCode,
        name: brandName.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim() || null,
        objective,
        platform: platforms.join(", "),
        occasion: contentContext.trim() || null,
        tone,
        budget: pricePosition,
        reference_urls: referenceUrls.length > 0 ? referenceUrls : [],
        status: "pending",
      });

      if (error) throw error;

      navigate(`/pro/confirmacao?code=${orderCode}`);
    } catch (err) {
      console.error("Pro request error:", err);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar o pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-editorial py-8 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="editorial-caption">DROP Pro (24h)</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium tracking-wide uppercase">Editorial Completo</span>
            </div>
            
            <h1 className="editorial-title text-2xl md:text-3xl">
              Fechamento editorial<br />para creators e marcas
            </h1>
            
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              Direção completa + shotlist + copy kit.<br />
              Entrega em até 24h. Sem call.
            </p>
          </div>

          <div className="editorial-divider" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand/Project */}
            <div className="space-y-2">
              <Label htmlFor="brandName" className="editorial-caption">
                Marca / Projeto
              </Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Nome da marca ou @"
                className="bg-muted/30 border-border/50"
              />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="editorial-caption">
                  WhatsApp *
                </Label>
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+55 11 99999-9999"
                  className="bg-muted/30 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="editorial-caption">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@marca.com"
                  className="bg-muted/30 border-border/50"
                />
              </div>
            </div>

            {/* Objective */}
            <div className="space-y-3">
              <span className="editorial-caption block">Objetivo</span>
              <div className="flex flex-wrap gap-2">
                {OBJECTIVES.map((o) => (
                  <PreferenceChip
                    key={o.id}
                    label={o.label}
                    selected={objective === o.id}
                    onClick={() => setObjective(o.id)}
                  />
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div className="space-y-3">
              <span className="editorial-caption block">Plataforma(s)</span>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <PreferenceChip
                    key={p.id}
                    label={p.label}
                    selected={platforms.includes(p.id)}
                    onClick={() => togglePlatform(p.id)}
                  />
                ))}
              </div>
            </div>

            {/* Content Context */}
            <div className="space-y-2">
              <Label htmlFor="contentContext" className="editorial-caption">
                Contexto do conteúdo
              </Label>
              <Textarea
                id="contentContext"
                value={contentContext}
                onChange={(e) => setContentContext(e.target.value)}
                placeholder="Ex: Coleção outono, campanha de lançamento, conteúdo do dia a dia..."
                className="bg-muted/30 border-border/50 min-h-[80px]"
              />
            </div>

            {/* Tone */}
            <div className="space-y-3">
              <span className="editorial-caption block">Tom / Estética</span>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <PreferenceChip
                    key={t.id}
                    label={t.label}
                    selected={tone === t.id}
                    onClick={() => setTone(t.id)}
                  />
                ))}
              </div>
            </div>

            {/* Price Position */}
            <div className="space-y-3">
              <span className="editorial-caption block">Posicionamento de preço</span>
              <div className="flex flex-wrap gap-2">
                {PRICE_POSITIONS.map((p) => (
                  <PreferenceChip
                    key={p.id}
                    label={p.label}
                    selected={pricePosition === p.id}
                    onClick={() => setPricePosition(p.id)}
                  />
                ))}
              </div>
            </div>

            {/* Admired Brands */}
            <div className="space-y-2">
              <Label htmlFor="admiredBrands" className="editorial-caption">
                Marcas admiradas (3–5)
              </Label>
              <Textarea
                id="admiredBrands"
                value={admiredBrands}
                onChange={(e) => setAdmiredBrands(e.target.value)}
                placeholder="Ex: Jacquemus, The Row, Ganni, Nanushka..."
                className="bg-muted/30 border-border/50 min-h-[60px]"
              />
            </div>

            {/* References note */}
            {hasB2CSession && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 inline mr-2 text-primary" />
                  As referências do seu editorial serão incluídas automaticamente.
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="editorial-caption">
                Notas extras (opcional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes rápidos que ajudem (ex: evitar muito preto, preferir alfaiataria…)"
                className="bg-muted/30 border-border/50 min-h-[80px]"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-border/30">
              <EditorialButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!isFormValid || isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Enviando..." : "Enviar Briefing"}
              </EditorialButton>
              
              <p className="text-xs text-muted-foreground text-center mt-3">
                Entrega em até 24h • Muitas vezes no mesmo dia
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProPage;

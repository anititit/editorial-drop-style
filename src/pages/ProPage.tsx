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

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  objective: string;
  platform: string;
  occasion: string;
  tone: string;
  budget: string;
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
    platform: "",
    occasion: "",
    tone: "",
    budget: "",
    referenceUrls: [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReferencesChange = (urls: string[]) => {
    setFormData((prev) => ({ ...prev, referenceUrls: urls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.whatsapp.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, email e WhatsApp.",
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
        objective: formData.objective.trim() || null,
        platform: formData.platform.trim() || null,
        occasion: formData.occasion.trim() || null,
        tone: formData.tone.trim() || null,
        budget: formData.budget.trim() || null,
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
                  Briefing personalizado
                </h1>
                <p className="editorial-body text-muted-foreground max-w-md mx-auto">
                  Preencha o formulário abaixo com suas preferências. Entrega em
                  até 24h (muitas vezes no mesmo dia).
                </p>
              </div>

              <div className="editorial-divider mb-10" />

              {/* Form */}
              <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8">
                {/* Contact info */}
                <div className="space-y-4">
                  <h2 className="editorial-caption">Contato</h2>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome / @</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Seu nome ou @instagram"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleChange}
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
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Brief details */}
                <div className="space-y-4">
                  <h2 className="editorial-caption">Sobre o projeto</h2>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="objective">Objetivo</Label>
                      <Textarea
                        id="objective"
                        name="objective"
                        placeholder="O que você busca com esse editorial? Ex: renovar guarda-roupa, evento especial..."
                        value={formData.objective}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="platform">Plataforma</Label>
                        <Input
                          id="platform"
                          name="platform"
                          placeholder="Instagram, TikTok..."
                          value={formData.platform}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="occasion">Ocasião</Label>
                        <Input
                          id="occasion"
                          name="occasion"
                          placeholder="Dia a dia, trabalho..."
                          value={formData.occasion}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tone">Tom / Estilo</Label>
                        <Input
                          id="tone"
                          name="tone"
                          placeholder="Minimalista, bold..."
                          value={formData.tone}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget">Orçamento</Label>
                        <Input
                          id="budget"
                          name="budget"
                          placeholder="Faixa de preço"
                          value={formData.budget}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* References */}
                <div className="space-y-4">
                  <h2 className="editorial-caption">Referências visuais</h2>
                  <p className="text-sm text-muted-foreground">
                    Adicione exatamente 3 imagens de moodboard ou inspiração.
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
                  Entrega em até 24h (muitas vezes no mesmo dia). Você receberá
                  seu editorial por e-mail e WhatsApp.
                </p>
              </div>

              <div className="editorial-divider" />

              {/* Order code */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Código do pedido
                </p>
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

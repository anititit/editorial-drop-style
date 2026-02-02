import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Clock, FileText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { EditorialButton } from "@/components/ui/EditorialButton";

// TODO: Replace with your actual Google Form URL after creating it
const GOOGLE_FORM_URL = "https://forms.gle/YOUR_FORM_ID_HERE";

const ProPage = () => {
  const handleOpenForm = () => {
    window.open(GOOGLE_FORM_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-editorial py-8 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="editorial-caption">Editorial Pro</span>
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
              <span className="text-xs font-medium tracking-wide uppercase">Serviço Premium</span>
            </div>
            
            <h1 className="editorial-title text-3xl md:text-4xl">
              DROP Editorial Pro
            </h1>
            
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
              Você envia 3 referências (moodboard) e eu entrego um PDF A4 com direção estética em até 24h. Sem call.
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="p-2 bg-background rounded-lg shadow-sm">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Entrega em 24h</h3>
                <p className="text-sm text-muted-foreground">
                  Muitas vezes no mesmo dia. Sem call, sem reunião.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="p-2 bg-background rounded-lg shadow-sm">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">PDF A4 Completo</h3>
                <p className="text-sm text-muted-foreground">
                  Direção estética, looks, maquiagem, fragrância — tudo no mesmo documento.
                </p>
              </div>
            </div>
          </div>

          {/* Process */}
          <div className="space-y-3">
            <span className="editorial-caption">Como funciona</span>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">1</span>
                <span>Preencha o formulário com suas 3 referências</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">2</span>
                <span>Receba o PDF no WhatsApp em até 24h</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">3</span>
                <span>Aplique a direção estética no seu conteúdo</span>
              </li>
            </ol>
          </div>

          {/* CTA */}
          <div className="pt-4 border-t border-border/30">
            <EditorialButton
              variant="primary"
              size="lg"
              className="w-full group"
              onClick={handleOpenForm}
            >
              <span>Solicitar Editorial Pro</span>
              <ExternalLink className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
            </EditorialButton>
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              Abre formulário externo • Resposta em até 24h
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProPage;

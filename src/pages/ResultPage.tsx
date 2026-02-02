import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, RotateCcw, Sparkles } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { getResultById } from "@/lib/storage";
import { DEFAULT_RESULT } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="editorial-headline text-xl md:text-2xl mb-4">{children}</h2>
  );
}

const ResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const savedResult = id ? getResultById(id) : null;
  const result = savedResult?.result || DEFAULT_RESULT;
  const preferences = savedResult?.preferences;
  const { profile, editorial } = result;

  const handleExportPDF = async () => {
    if (!contentRef.current || isExporting) return;

    setIsExporting(true);
    toast({
      title: "Gerando PDF...",
      description: "Aguarde um momento.",
    });

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const element = contentRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FAFAF8",
        logging: false,
      });

      const a4Width = 210;
      const a4Height = 297;
      const margin = 12;
      const contentWidth = a4Width - margin * 2;
      const contentHeight = a4Height - margin * 2;
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const totalPages = Math.ceil(imgHeight / contentHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const sourceY = (page * contentHeight * canvas.width) / contentWidth;
        const sourceHeight = Math.min(
          (contentHeight * canvas.width) / contentWidth,
          canvas.height - sourceY
        );

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;

        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY,
            canvas.width, sourceHeight,
            0, 0,
            canvas.width, sourceHeight
          );

          const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.95);
          const pageImgHeight = (sourceHeight * contentWidth) / canvas.width;

          pdf.addImage(
            pageImgData,
            "JPEG",
            margin,
            margin,
            imgWidth,
            pageImgHeight
          );
        }
      }

      const fileName = preferences?.brandName 
        ? `${preferences.brandName.toLowerCase().replace(/\s+/g, "-")}-editorial.pdf`
        : `editorial-${id || "resultado"}.pdf`;
      
      pdf.save(fileName);

      toast({
        title: "PDF exportado!",
        description: "O arquivo foi salvo.",
      });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30 print-hide">
        <div className="container-results py-4 flex items-center justify-between">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="editorial-caption">Brand Editorial</span>
          <EditorialButton variant="ghost" size="icon" onClick={handleExportPDF}>
            <Download className="w-4 h-4" />
          </EditorialButton>
        </div>
      </header>

      {/* Content */}
      <div ref={contentRef} className="container-results py-10 space-y-12">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          {preferences?.brandName && (
            <span className="editorial-caption">{preferences.brandName}</span>
          )}
          <h1 className="editorial-headline text-3xl md:text-4xl">
            {editorial.headline || "Seu Editorial"}
          </h1>
          <p className="editorial-subhead text-lg text-muted-foreground max-w-md mx-auto">
            {editorial.positioning}
          </p>
        </motion.header>

        <div className="editorial-divider" />

        {/* Brand Persona */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <SectionTitle>Brand Persona</SectionTitle>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Arquétipo</span>
              <p className="text-lg font-medium">{profile.persona.archetype}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Idade Cultural</span>
              <p className="text-lg font-medium">{profile.persona.cultural_age}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Cidade Mental</span>
              <p className="text-lg font-medium">{profile.persona.mental_city}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Essência</span>
              <p className="text-lg font-medium italic">"{profile.persona.essence}"</p>
            </div>
          </div>
        </motion.section>

        <div className="editorial-divider" />

        {/* Visual Codes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <SectionTitle>Códigos Visuais</SectionTitle>
          
          {/* Palette */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {profile.visual_codes.palette_hex.map((color, i) => (
              <motion.div
                key={color + i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="w-12 h-12 rounded-lg shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Contraste</span>
              <p className="capitalize">{profile.visual_codes.contrast}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Texturas</span>
              <p>{profile.visual_codes.textures.join(" · ")}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Composição</span>
              <ul className="text-sm space-y-1">
                {profile.visual_codes.composition.map((rule, i) => (
                  <li key={i}>• {rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        <div className="editorial-divider" />

        {/* Editorial Directions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <SectionTitle>Direções Editoriais</SectionTitle>
          
          <div className="grid gap-6 md:grid-cols-3">
            {editorial.directions.map((direction, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-5 bg-muted/30 rounded-lg space-y-4"
              >
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {direction.type === "signature" && "Assinatura"}
                    {direction.type === "aspirational" && "Aspiracional"}
                    {direction.type === "conversion" && "Conversão"}
                  </span>
                  <h3 className="font-medium text-lg mt-1">{direction.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{direction.description}</p>
                <ul className="text-sm space-y-1">
                  {direction.visual_cues.map((cue, j) => (
                    <li key={j}>• {cue}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <div className="editorial-divider" />

        {/* Content System */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <SectionTitle>Sistema de Conteúdo</SectionTitle>
          
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {editorial.content_system.pillars.map((pillar, i) => (
              <div key={i} className="p-4 bg-muted/30 rounded-lg text-center">
                <span className="text-xs text-muted-foreground">Pilar {i + 1}</span>
                <p className="font-medium mt-1">{pillar}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-muted/30 rounded-lg mb-4">
            <span className="editorial-caption block mb-2">Cadência</span>
            <p>{editorial.content_system.cadence}</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <span className="editorial-caption block mb-3">Quick Wins</span>
            <div className="flex flex-wrap gap-2">
              {editorial.content_system.quick_wins.map((win, i) => (
                <span key={i} className="px-3 py-1.5 bg-background rounded-full text-sm">
                  {win}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Footer Note */}
        {editorial.footer_note && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center pt-8 border-t border-border/30"
          >
            <p className="editorial-subhead text-sm text-muted-foreground">
              {editorial.footer_note}
            </p>
          </motion.footer>
        )}
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/30 py-4 print-hide">
        <div className="container-results space-y-3">
          <div className="flex items-center gap-4">
            <EditorialButton
              variant="secondary"
              className="flex-1"
              onClick={() => navigate("/input?mode=upload")}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Novo Editorial
            </EditorialButton>
            <EditorialButton 
              variant="primary" 
              className="flex-1" 
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Gerando..." : "Exportar PDF"}
            </EditorialButton>
          </div>
          
          {/* Pro Upgrade CTA */}
          <Link to={`/pro?from=${id}`} className="block">
            <EditorialButton variant="ghost" className="w-full text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Versão Pro (beta)
            </EditorialButton>
          </Link>
          <p className="text-xs text-muted-foreground text-center">
            Persona completa + Brand Codes + Shotlist + Copy Kit
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

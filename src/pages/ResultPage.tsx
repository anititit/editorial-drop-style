import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, RotateCcw, Sparkles } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { getResultById } from "@/lib/storage";
import { DEFAULT_RESULT, AESTHETIC_NAMES } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { EditorialCommerceSection } from "@/components/results/EditorialCommerceSection";
import { PDFExportLayout } from "@/components/pdf/PDFExportLayout";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="editorial-headline text-xl md:text-2xl mb-4">{children}</h2>
  );
}

const ResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showOptionalLayer, setShowOptionalLayer] = useState(false);

  const savedResult = id ? getResultById(id) : null;
  const result = savedResult?.result || DEFAULT_RESULT;
  const { profile, editorial } = result;

  // Get aesthetic display names
  const primaryName = AESTHETIC_NAMES[profile.aesthetic_primary] || profile.aesthetic_primary;
  const secondaryName = AESTHETIC_NAMES[profile.aesthetic_secondary] || profile.aesthetic_secondary;
  const isConceptualReading = profile.confidence < 0.7;

  const handleExportPDF = async () => {
    if (!pdfRef.current || isExporting) return;

    setIsExporting(true);
    toast({
      title: "Gerando PDF...",
      description: "Aguarde um momento.",
    });

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      // Wait for layout
      await new Promise((resolve) => setTimeout(resolve, 300));

      const pages = pdfRef.current.querySelectorAll(".pdf-page");
      const pdfWidth = 210;
      const pdfHeight = 297;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        if (i > 0) pdf.addPage();

        const pageCanvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#FAFAF8",
          logging: false,
          onclone: (clonedDoc) => {
            clonedDoc.querySelectorAll('[style*="opacity"]').forEach((el) => {
              (el as HTMLElement).style.opacity = "1";
              (el as HTMLElement).style.transform = "none";
            });
          },
        });

        if (pageCanvas.width === 0 || pageCanvas.height === 0) continue;

        const imgData = pageCanvas.toDataURL("image/png");
        const imgWidth = pdfWidth;
        const imgHeight = (pageCanvas.height * pdfWidth) / pageCanvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
      }

      pdf.save(`leitura-estetica-${id || "resultado"}.pdf`);

      toast({
        title: "PDF exportado!",
        description: "Documento salvo com sucesso.",
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
          <span className="editorial-caption">Leitura Estética</span>
          <EditorialButton variant="ghost" size="icon" onClick={handleExportPDF}>
            <Download className="w-4 h-4" />
          </EditorialButton>
        </div>
      </header>

      {/* Hidden PDF Layout */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        <PDFExportLayout ref={pdfRef} result={result} showOptionalLayer={showOptionalLayer} />
      </div>

      {/* Content */}
      <div className="container-results py-10 space-y-12">
        {/* Hero - Aesthetic Profile */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <span className="editorial-caption">Seu Perfil Estético</span>
          {isConceptualReading && (
            <p className="text-xs text-muted-foreground/70 italic">
              Leitura mais conceitual — baseada em paleta, contraste e textura.
            </p>
          )}
          <h1 className="editorial-headline text-3xl md:text-4xl">
            {primaryName}
          </h1>
          <p className="editorial-subhead text-lg text-muted-foreground">
            com toques de {secondaryName}
          </p>
        </motion.header>

        {/* Palette */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-3"
        >
          {profile.palette_hex.map((color, i) => (
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
        </motion.div>

        <div className="editorial-divider" />

        {/* Why This */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <SectionTitle>Por que esse estilo?</SectionTitle>
          <ul className="space-y-3">
            {profile.why_this.map((reason, i) => (
              <li
                key={i}
                className="text-sm text-muted-foreground editorial-body flex items-start gap-3"
              >
                <span className="text-foreground/50">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </motion.section>

        <div className="editorial-divider" />

        {/* Visual Identity */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <SectionTitle>Identidade Visual</SectionTitle>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Contraste</span>
              <p className="capitalize">{profile.contrast}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Texturas</span>
              <p>{profile.textures.join(" · ")}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Silhuetas</span>
              <p>{profile.silhouettes.join(" · ")}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Acabamento de Make</span>
              <p>{profile.makeup_finish}</p>
            </div>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <span className="editorial-caption block mb-2">Família Olfativa</span>
            <p className="text-lg font-medium">{profile.fragrance_family}</p>
          </div>
        </motion.section>

        <div className="editorial-divider" />

        {/* Editorial Headline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center space-y-3"
        >
          <h2 className="editorial-headline text-2xl md:text-3xl">
            {editorial.headline}
          </h2>
          <p className="editorial-subhead text-muted-foreground max-w-md mx-auto">
            {editorial.dek}
          </p>
        </motion.section>

        <div className="editorial-divider" />

        {/* Conceptual Looks */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          <SectionTitle>3 Looks Conceituais</SectionTitle>
          
          <div className="space-y-8">
            {editorial.looks.map((look, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="p-5 bg-muted/30 rounded-lg space-y-4"
              >
                <div className="flex items-center gap-3">
                  <span className="editorial-caption">{look.title}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                
                <h3 className="font-medium text-lg">{look.hero_piece}</h3>
                
                <ul className="space-y-1">
                  {look.supporting.map((item, j) => (
                    <li key={j} className="text-sm text-muted-foreground">
                      + {item}
                    </li>
                  ))}
                </ul>
                
                <p className="text-sm">
                  <span className="text-muted-foreground">Acessório:</span>{" "}
                  <span className="font-medium">{look.accessory}</span>
                </p>
                
                <p className="editorial-subhead text-sm text-muted-foreground pt-2 border-t border-border/30 italic">
                  "{look.caption}"
                </p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <div className="editorial-divider" />

        {/* Makeup */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <SectionTitle>Maquiagem</SectionTitle>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Day */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="editorial-caption">Dia</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Base", value: editorial.makeup_day.base },
                  { label: "Bochechas", value: editorial.makeup_day.cheeks },
                  { label: "Olhos", value: editorial.makeup_day.eyes },
                  { label: "Lábios", value: editorial.makeup_day.lips },
                ].map((step) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <span className="text-xs text-muted-foreground w-20 flex-shrink-0 uppercase tracking-wider pt-0.5">
                      {step.label}
                    </span>
                    <span className="text-sm editorial-body">{step.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Night */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="editorial-caption">Noite</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Base", value: editorial.makeup_night.base },
                  { label: "Bochechas", value: editorial.makeup_night.cheeks },
                  { label: "Olhos", value: editorial.makeup_night.eyes },
                  { label: "Lábios", value: editorial.makeup_night.lips },
                ].map((step) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <span className="text-xs text-muted-foreground w-20 flex-shrink-0 uppercase tracking-wider pt-0.5">
                      {step.label}
                    </span>
                    <span className="text-sm editorial-body">{step.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="editorial-divider" />

        {/* Fragrance */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <SectionTitle>Fragrâncias</SectionTitle>
          
          <div className="space-y-4">
            {editorial.fragrances.map((fragrance, i) => (
              <div
                key={i}
                className="flex items-start gap-4 py-3 border-b border-border/30 last:border-0"
              >
                <span className="text-xs text-muted-foreground w-24 flex-shrink-0 uppercase tracking-wider pt-0.5">
                  {fragrance.price_tier === "affordable" && "Acessível"}
                  {fragrance.price_tier === "mid" && "Intermediário"}
                  {fragrance.price_tier === "premium" && "Premium"}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{fragrance.name}</p>
                  <p className="text-sm text-muted-foreground">{fragrance.brand}</p>
                  <p className="text-xs text-muted-foreground mt-1">{fragrance.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Commerce Section - O Edit */}
        {editorial.commerce && (
          <>
            <div className="editorial-divider" />
            <EditorialCommerceSection commerce={editorial.commerce} delay={0.65} />
          </>
        )}

        {/* Footer Note */}
        {editorial.footer_note && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
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
              Nova Leitura
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
          <Link to="/pro/brief" className="block">
            <EditorialButton variant="ghost" className="w-full text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              DROP Pro
            </EditorialButton>
          </Link>
          <p className="text-xs text-muted-foreground text-center">
            Versão profissional para marcas e projetos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

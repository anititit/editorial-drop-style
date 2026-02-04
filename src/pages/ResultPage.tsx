import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, RotateCcw } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { getResultById } from "@/lib/storage";
import { DEFAULT_RESULT, AESTHETIC_NAMES } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { EditorialCommerceSection } from "@/components/results/EditorialCommerceSection";
import { EditorialToggleSection } from "@/components/results/EditorialToggleSection";
import { CapsuleResultSection } from "@/components/results/CapsuleResultSection";
import { SocialShareSection } from "@/components/results/SocialShareSection";
import { CapsuleCTA } from "@/components/results/CapsuleCTA";
import BrazilNav from "@/components/BrazilNav";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="editorial-headline text-xl md:text-2xl mb-4">{children}</h2>
  );
}

const MANIFESTO_TEXT = {
  line1: "DROP Edit é luxo com precisão.",
  line2: "Um ateliê invisível, em grande escala, sem perder o corte sob medida.",
  line3: "Organizamos repertório em direção, linguagem visual, presença, coerência.",
  line4: "Luxo é escolher com intenção.",
  line5: "Não é tendência, é direção.",
  footer: "DROP Edit™",
};

const ResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const savedResult = id ? getResultById(id) : null;
  const result = savedResult?.result || DEFAULT_RESULT;
  const { profile, editorial } = result;

  // Get aesthetic display names
  const primaryName = AESTHETIC_NAMES[profile.aesthetic_primary] || profile.aesthetic_primary;
  const secondaryName = AESTHETIC_NAMES[profile.aesthetic_secondary] || profile.aesthetic_secondary;
  const isConceptualReading = profile.confidence < 0.7;

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
        onclone: (clonedDoc) => {
          // Hide elements marked as print-hide in the PDF
          clonedDoc.querySelectorAll('.print-hide').forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });
          // Force opacity for animations
          clonedDoc.querySelectorAll('[style*="opacity"]').forEach((el) => {
            (el as HTMLElement).style.opacity = '1';
            (el as HTMLElement).style.transform = 'none';
          });
          // Expand all collapsed sections for PDF
          clonedDoc.querySelectorAll('[data-state="closed"]').forEach((el) => {
            (el as HTMLElement).setAttribute('data-state', 'open');
            (el as HTMLElement).style.display = 'block';
          });
        },
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

      // Add Manifesto as final page
      pdf.addPage();
      
      // Center the manifesto text
      const centerX = a4Width / 2;
      let currentY = 80;
      const lineSpacing = 20;
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(30, 30, 30);
      pdf.text(MANIFESTO_TEXT.line1, centerX, currentY, { align: "center" });
      
      currentY += lineSpacing * 2;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(MANIFESTO_TEXT.line2, centerX, currentY, { align: "center" });
      
      currentY += lineSpacing * 1.5;
      pdf.text(MANIFESTO_TEXT.line3, centerX, currentY, { align: "center" });
      
      currentY += lineSpacing * 2;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(30, 30, 30);
      pdf.text(MANIFESTO_TEXT.line4, centerX, currentY, { align: "center" });
      
      currentY += lineSpacing * 1.5;
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      pdf.text(MANIFESTO_TEXT.line5, centerX, currentY, { align: "center" });
      
      // Footer
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(MANIFESTO_TEXT.footer, centerX, a4Height - 20, { align: "center" });

      const fileName = `leitura-estetica-${id || "resultado"}.pdf`;
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
      <BrazilNav />

      {/* Actions Bar */}
      <div className="fixed top-16 right-6 z-40 print-hide">
        <EditorialButton variant="ghost" size="icon" onClick={handleExportPDF}>
          <Download className="w-4 h-4" />
        </EditorialButton>
      </div>

      {/* Content */}
      <div ref={contentRef} className="container-results pt-24 py-10 space-y-12">
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

        {/* Visual Identity - MANDATORY */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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

        {/* Por que funciona - MANDATORY */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          <SectionTitle>Por que funciona</SectionTitle>
          <p className="editorial-subhead text-sm text-muted-foreground mb-6">
            Não é sobre tendência, é sobre direção.
          </p>
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

        {/* Editorial Headline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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

        {/* Conceptual Looks - TOGGLE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <EditorialToggleSection
            title="Looks conceituais"
            introLine="Três leituras visuais da mesma direção."
            secondaryLine="Não são propostas fechadas, são caminhos possíveis."
            defaultOpen={false}
          >
            <div className="space-y-8">
              {editorial.looks.map((look, i) => (
                <article
                  key={i}
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
                </article>
              ))}
            </div>
          </EditorialToggleSection>
        </motion.section>

        <div className="editorial-divider" />

        {/* Makeup - TOGGLE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <EditorialToggleSection
            title="Maquiagem"
            introLine="Textura, acabamento e intenção."
            secondaryLine="A maquiagem acompanha o gesto, não compete com ele."
            defaultOpen={false}
          >
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
          </EditorialToggleSection>
        </motion.section>

        <div className="editorial-divider" />

        {/* Fragrance - TOGGLE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <EditorialToggleSection
            title="Fragrâncias"
            introLine="A assinatura invisível."
            secondaryLine="O perfume completa a presença, não a anuncia."
            defaultOpen={false}
          >
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
          </EditorialToggleSection>
        </motion.section>

        {/* Commerce Section - O Edit - MANDATORY */}
        {editorial.commerce && (
          <>
            <div className="editorial-divider" />
            <EditorialCommerceSection commerce={editorial.commerce} delay={0.5} />
          </>
        )}

        {/* Capsule Section - TOGGLE (only if capsule data exists) */}
        {editorial.capsule && (
          <>
            <div className="editorial-divider" />
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <CapsuleResultSection capsule={editorial.capsule} />
            </motion.section>
          </>
        )}

        {/* Capsule CTA - only show if no capsule data (user didn't opt in) */}
        {!editorial.capsule && (
          <CapsuleCTA locale="pt-BR" resultId={id} />
        )}

        {/* Social Share Section */}
        <SocialShareSection 
          profileName={primaryName}
          headline={editorial.headline}
          resultId={id}
        />

        {/* Footer Note - hidden in PDF if it's the partial result message */}
        {editorial.footer_note && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className={`text-center pt-8 border-t border-border/30 ${
              editorial.footer_note.includes("resultado parcial") ? "print-hide" : ""
            }`}
          >
            <p className="editorial-subhead text-sm text-muted-foreground">
              {editorial.footer_note}
            </p>
          </motion.footer>
        )}
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/30 py-4 print-hide">
        <div className="container-results">
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
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

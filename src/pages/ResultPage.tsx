import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, RotateCcw, Sparkles } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { ProfileSection } from "@/components/results/ProfileSection";
import { OutfitsSection } from "@/components/results/OutfitsSection";
import { MakeupSection } from "@/components/results/MakeupSection";
import { FragranceSection } from "@/components/results/FragranceSection";
import { getResultById } from "@/lib/storage";
import { DEFAULT_RESULT } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";

const ResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const savedResult = id ? getResultById(id) : null;
  const result = savedResult?.result || DEFAULT_RESULT;
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

      // Render at higher resolution for quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FAFAF8",
        logging: false,
      });

      // A4 dimensions in mm
      const a4Width = 210;
      const a4Height = 297;
      const margin = 12; // mm

      // Content area
      const contentWidth = a4Width - margin * 2;
      const contentHeight = a4Height - margin * 2;

      // Calculate image dimensions to fit A4 width
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeight / contentHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // Calculate the portion of the image for this page
        const sourceY = (page * contentHeight * canvas.width) / contentWidth;
        const sourceHeight = Math.min(
          (contentHeight * canvas.width) / contentWidth,
          canvas.height - sourceY
        );

        // Create a canvas for this page's portion
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

      pdf.save(`editorial-drop-${id || "resultado"}.pdf`);

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
      {/* Header - hidden on print */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30 print-hide">
        <div className="container-results py-4 flex items-center justify-between">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="editorial-caption">Seu Editorial</span>
          <EditorialButton variant="ghost" size="icon" onClick={handleExportPDF}>
            <Download className="w-4 h-4" />
          </EditorialButton>
        </div>
      </header>

      {/* Content - PDF capture area */}
      <div ref={contentRef} className="container-results py-10 space-y-16">
        {/* Headline & Dek */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="editorial-headline text-3xl md:text-4xl">
            {editorial.headline || "Seu Editorial"}
          </h1>
          {editorial.dek && (
            <p className="editorial-subhead text-lg text-muted-foreground max-w-md mx-auto">
              {editorial.dek}
            </p>
          )}
        </motion.header>

        <div className="editorial-divider" />

        {/* Profile Section */}
        <ProfileSection
          aestheticPrimary={profile.aesthetic_primary || "minimal_chic"}
          aestheticSecondary={profile.aesthetic_secondary || "clean_glow"}
          paletteHex={profile.palette_hex || ["#F5F5F5", "#2C2C2C", "#D4C4B0"]}
          vibeKeywords={profile.vibe_keywords || []}
          whyThis={profile.why_this || []}
          confidence={profile.confidence}
        />

        <div className="editorial-divider" />

        {/* Outfits Section */}
        <OutfitsSection outfits={editorial.outfits || DEFAULT_RESULT.editorial.outfits} />

        <div className="editorial-divider" />

        {/* Makeup Section */}
        <MakeupSection
          day={editorial.makeup?.day || DEFAULT_RESULT.editorial.makeup.day}
          night={editorial.makeup?.night || DEFAULT_RESULT.editorial.makeup.night}
        />

        <div className="editorial-divider" />

        {/* Fragrance Section */}
        <FragranceSection fragrance={editorial.fragrance || DEFAULT_RESULT.editorial.fragrance} />

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

      {/* Actions - hidden on print */}
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
              Gerar versão Pro
            </EditorialButton>
          </Link>
          <p className="text-xs text-muted-foreground text-center">
            Persona + Brand Codes + Shotlist + Copy Kit
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

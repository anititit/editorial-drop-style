import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { ProfileSection } from "@/components/results/ProfileSection";
import { OutfitsSection } from "@/components/results/OutfitsSection";
import { MakeupSection } from "@/components/results/MakeupSection";
import { FragranceSection } from "@/components/results/FragranceSection";
import { getResultById } from "@/lib/storage";
import { DEFAULT_RESULT } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const ResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const savedResult = id ? getResultById(id) : null;
  const result = savedResult?.result || DEFAULT_RESULT;
  const { profile, editorial } = result;

  const handleExportPDF = () => {
    toast({
      title: "Preparando impressão...",
      description: "Use 'Salvar como PDF' no diálogo de impressão.",
    });

    // Small delay to show toast before print dialog
    setTimeout(() => {
      window.print();
    }, 300);
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

      {/* Content - print-friendly */}
      <div className="container-results print-container py-10 space-y-16">
        {/* Headline & Dek */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 print-section print-avoid-break"
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

        {/* Profile Section - new page */}
        <div className="print-section print-avoid-break">
          <ProfileSection
            aestheticPrimary={profile.aesthetic_primary || "minimal_chic"}
            aestheticSecondary={profile.aesthetic_secondary || "clean_glow"}
            paletteHex={profile.palette_hex || ["#F5F5F5", "#2C2C2C", "#D4C4B0"]}
            vibeKeywords={profile.vibe_keywords || []}
            whyThis={profile.why_this || []}
            confidence={profile.confidence}
          />
        </div>

        <div className="editorial-divider" />

        {/* Outfits Section - new page for print */}
        <div className="print-page-break">
          <OutfitsSection outfits={editorial.outfits || DEFAULT_RESULT.editorial.outfits} />
        </div>

        <div className="editorial-divider" />

        {/* Makeup Section - new page for print */}
        <div className="print-page-break print-section">
          <MakeupSection
            day={editorial.makeup?.day || DEFAULT_RESULT.editorial.makeup.day}
            night={editorial.makeup?.night || DEFAULT_RESULT.editorial.makeup.night}
          />
        </div>

        <div className="editorial-divider" />

        {/* Fragrance Section */}
        <div className="print-section print-avoid-break">
          <FragranceSection fragrance={editorial.fragrance || DEFAULT_RESULT.editorial.fragrance} />
        </div>

        {/* Footer Note */}
        {editorial.footer_note && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center pt-8 border-t border-border/30 print-footer print-avoid-break"
          >
            <p className="editorial-subhead text-sm text-muted-foreground">
              {editorial.footer_note}
            </p>
          </motion.footer>
        )}
      </div>

      {/* Actions - hidden on print */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/30 py-4 print-hide">
        <div className="container-results flex items-center gap-4">
          <EditorialButton
            variant="secondary"
            className="flex-1"
            onClick={() => navigate("/input?mode=upload")}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Novo Editorial
          </EditorialButton>
          <EditorialButton variant="primary" className="flex-1" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </EditorialButton>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

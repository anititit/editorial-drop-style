import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { getResultById } from "@/lib/storage";
import { DEFAULT_RESULT } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { EditorialToggleSection } from "@/components/results/EditorialToggleSection";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="editorial-headline text-xl md:text-2xl mb-4">{children}</h2>
  );
}

// English Manifesto
const MANIFESTO_EN = {
  line1: "DROP Edit is luxury with precision.",
  line2: "An invisible atelier, at scale, without losing the bespoke cut.",
  line3: "We organize repertoire into direction, visual language, presence, coherence.",
  line4: "Luxury is choosing with intention.",
  line5: "It's not trend, it's direction.",
  footer: "DROP Edit™",
};

const GlobalResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const savedResult = id ? getResultById(id) : null;
  const result = savedResult?.result || DEFAULT_RESULT;
  const { profile, editorial } = result;

  const primaryName = profile.aesthetic_primary;
  const secondaryName = profile.aesthetic_secondary;
  const isConceptualReading = profile.confidence < 0.7;

  const handleExportPDF = async () => {
    if (!contentRef.current || isExporting) return;

    setIsExporting(true);
    toast({
      title: "Generating PDF...",
      description: "Please wait.",
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
          clonedDoc.querySelectorAll('.print-hide').forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });
          clonedDoc.querySelectorAll('[style*="opacity"]').forEach((el) => {
            (el as HTMLElement).style.opacity = '1';
            (el as HTMLElement).style.transform = 'none';
          });
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

      // Add "GLOBAL EDITION" header to first page
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text("GLOBAL EDITION", a4Width / 2, 8, { align: "center" });

      const totalPages = Math.ceil(imgHeight / contentHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
          // Add header to subsequent pages
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(120, 120, 120);
          pdf.text("GLOBAL EDITION", a4Width / 2, 8, { align: "center" });
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
      
      const centerX = a4Width / 2;
      let currentY = 80;
      const lineSpacing = 20;

      // GLOBAL EDITION header
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text("GLOBAL EDITION", centerX, 8, { align: "center" });
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(30, 30, 30);
      pdf.text(MANIFESTO_EN.line1, centerX, currentY, { align: "center" });
      
      currentY += lineSpacing * 2;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(MANIFESTO_EN.line2, centerX, currentY, { align: "center" });
      
      currentY += lineSpacing * 1.5;
      pdf.text(MANIFESTO_EN.line3, centerX, currentY, { align: "center" });
      
      currentY += lineSpacing * 2;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(30, 30, 30);
      pdf.text(MANIFESTO_EN.line4, centerX, currentY, { align: "center" });
      
      currentY += lineSpacing * 1.5;
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      pdf.text(MANIFESTO_EN.line5, centerX, currentY, { align: "center" });
      
      // Footer
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(MANIFESTO_EN.footer, centerX, a4Height - 20, { align: "center" });

      const fileName = `aesthetic-reading-global-${id || "result"}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF exported!",
        description: "File saved successfully.",
      });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({
        title: "Export error",
        description: "Could not generate PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Language Switch */}
      <div className="absolute top-6 right-6 print-hide">
        <Link to="/" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
          Versão Brasil →
        </Link>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30 print-hide">
        <div className="container-results py-4 flex items-center justify-between">
          <Link to="/global" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="editorial-caption tracking-[0.2em]">Global Edition</span>
          <EditorialButton variant="ghost" size="icon" onClick={handleExportPDF}>
            <Download className="w-4 h-4" />
          </EditorialButton>
        </div>
      </header>

      {/* Content */}
      <div ref={contentRef} className="container-results py-10 space-y-12">
        {/* GLOBAL EDITION Label */}
        <div className="text-center">
          <span className="text-xs text-muted-foreground/60 tracking-[0.3em] uppercase">Global Edition</span>
        </div>

        {/* Hero - Aesthetic Profile */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <span className="editorial-caption">Your Aesthetic Profile</span>
          {isConceptualReading && (
            <p className="text-xs text-muted-foreground/70 italic print-hide">
              Conceptual reading — based on palette, contrast, and texture.
            </p>
          )}
          <h1 className="editorial-headline text-3xl md:text-4xl">
            {primaryName}
          </h1>
          <p className="editorial-subhead text-lg text-muted-foreground">
            with touches of {secondaryName}
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
          <SectionTitle>Visual Identity</SectionTitle>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Contrast</span>
              <p className="capitalize">{profile.contrast}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Textures</span>
              <p>{profile.textures.join(" · ")}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Silhouettes</span>
              <p>{profile.silhouettes.join(" · ")}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <span className="editorial-caption block mb-2">Makeup Finish</span>
              <p>{profile.makeup_finish}</p>
            </div>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <span className="editorial-caption block mb-2">Fragrance Family</span>
            <p className="text-lg font-medium">{profile.fragrance_family}</p>
          </div>
        </motion.section>

        <div className="editorial-divider" />

        {/* Why it works - MANDATORY */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          <SectionTitle>Why it works</SectionTitle>
          <p className="editorial-subhead text-sm text-muted-foreground mb-6">
            It's not trend, it's direction.
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

        {/* The Edit — where to start - MANDATORY */}
        {editorial.commerce && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <SectionTitle>The Edit — where to start</SectionTitle>

            {/* Shortlist */}
            <div className="space-y-4">
              <span className="editorial-caption">The Shortlist</span>
              <div className="space-y-3">
                {editorial.commerce.shortlist.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-sm">
                    <span className="text-xs text-muted-foreground uppercase w-20 shrink-0">{item.category}</span>
                    <div className="flex-1">
                      <p className="text-foreground">{item.item_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.rationale}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.price_lane}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Look Recipes */}
            <div className="space-y-3">
              <span className="editorial-caption">Look Recipes</span>
              <div className="space-y-2">
                {editorial.commerce.look_recipes.map((recipe, i) => (
                  <p key={i} className="text-muted-foreground">• {recipe.formula}</p>
                ))}
              </div>
            </div>

            {/* Search Terms */}
            <div className="space-y-3">
              <span className="editorial-caption">Search terms</span>
              <div className="flex flex-wrap gap-2">
                {editorial.commerce.search_terms.map((term, i) => (
                  <span key={i} className="px-3 py-1 bg-muted/50 rounded-sm text-sm text-muted-foreground">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        <div className="editorial-divider" />

        {/* Conceptual Looks - TOGGLE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <EditorialToggleSection
            title="Conceptual Looks"
            introLine="Three visual readings of the same direction."
            secondaryLine="Not fixed outfits, possible routes."
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
                    <span className="text-muted-foreground">Accessory:</span>{" "}
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
            title="Makeup"
            introLine="Texture, finish, intention."
            secondaryLine="Makeup follows the gesture, it doesn't compete."
            defaultOpen={false}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Day */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="editorial-caption">Day</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Base", value: editorial.makeup_day.base },
                    { label: "Cheeks", value: editorial.makeup_day.cheeks },
                    { label: "Eyes", value: editorial.makeup_day.eyes },
                    { label: "Lips", value: editorial.makeup_day.lips },
                  ].map((step) => (
                    <div key={step.label} className="flex items-start gap-3">
                      <span className="text-xs text-muted-foreground w-16 flex-shrink-0 uppercase tracking-wider pt-0.5">
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
                  <span className="editorial-caption">Night</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Base", value: editorial.makeup_night.base },
                    { label: "Cheeks", value: editorial.makeup_night.cheeks },
                    { label: "Eyes", value: editorial.makeup_night.eyes },
                    { label: "Lips", value: editorial.makeup_night.lips },
                  ].map((step) => (
                    <div key={step.label} className="flex items-start gap-3">
                      <span className="text-xs text-muted-foreground w-16 flex-shrink-0 uppercase tracking-wider pt-0.5">
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
            title="Fragrance"
            introLine="The invisible layer of the image."
            secondaryLine="Scent also builds presence."
            defaultOpen={false}
          >
            <div className="space-y-4">
              {editorial.fragrances.map((fragrance, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 py-3 border-b border-border/30 last:border-0"
                >
                  <span className="text-xs text-muted-foreground w-20 flex-shrink-0 uppercase tracking-wider pt-0.5">
                    {fragrance.price_tier === "affordable" && "Affordable"}
                    {fragrance.price_tier === "mid" && "Mid-range"}
                    {fragrance.price_tier === "premium" && "Premium"}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{fragrance.name}</p>
                    <p className="text-xs text-muted-foreground">{fragrance.brand}</p>
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      {fragrance.notes}
                    </p>
                    <p className="text-sm mt-2">{fragrance.why_it_matches}</p>
                  </div>
                </div>
              ))}
            </div>
          </EditorialToggleSection>
        </motion.section>

        <div className="editorial-divider" />

        {/* Footer Note */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-4"
        >
          <p className="editorial-body text-muted-foreground italic max-w-md mx-auto">
            {editorial.footer_note}
          </p>
        </motion.section>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/30 py-4 print-hide">
        <div className="container-results flex items-center gap-4">
          <EditorialButton
            variant="secondary"
            className="flex-1"
            onClick={() => navigate("/global/input")}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Reading
          </EditorialButton>
          <EditorialButton
            variant="primary"
            className="flex-1"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Generating..." : "Export PDF"}
          </EditorialButton>
        </div>
      </div>
    </div>
  );
};

export default GlobalResultPage;

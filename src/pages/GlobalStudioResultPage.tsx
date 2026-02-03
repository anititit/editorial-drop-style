import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { GlobalStudioResult, DEFAULT_GLOBAL_RESULT } from "@/lib/global-types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EditorialToggleSection } from "@/components/results/EditorialToggleSection";

type PageState = "loading" | "results" | "error";

// English Manifesto text
const MANIFESTO_EN = [
  "DROP Edit is luxury with precision.",
  "An invisible atelier, at scale, without losing the bespoke cut.",
  "We organize repertoire into direction, visual language, presence, coherence.",
  "Luxury is choosing with intention.",
  "It's not trend, it's direction.",
];

const GlobalStudioResultPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<PageState>("loading");
  const [result, setResult] = useState<GlobalStudioResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const getBriefData = (): {
    category: string;
    images: string[];
    brandRefs: string[];
    note: string;
  } | null => {
    const stored = sessionStorage.getItem("global_studio_brief");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          category: parsed.category || "fashion",
          images: parsed.visualRefs || [],
          brandRefs: parsed.brandRefs || [],
          note: parsed.note || "",
        };
      } catch (e) {
        console.error("Failed to parse studio brief:", e);
      }
    }
    return null;
  };

  const generateEditorial = async () => {
    setState("loading");
    setErrorMessage("");

    const briefData = getBriefData();
    if (!briefData || (briefData.images.length === 0 && briefData.brandRefs.length === 0)) {
      navigate("/global/studio");
      return;
    }

    try {
      const isUrls = briefData.images.length > 0 && briefData.images[0]?.startsWith("http");

      const response = await supabase.functions.invoke("generate-global-studio", {
        body: {
          images: briefData.images,
          isUrls,
          brandRefs: briefData.brandRefs,
          category: briefData.category,
          note: briefData.note,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate");
      }

      const data = response.data;

      if (data.error) {
        setErrorMessage(data.message || "Could not generate the editorial.");
        setState("error");
        return;
      }

      setResult(data as GlobalStudioResult);
      setState("results");
      setHasGenerated(true);
    } catch (err) {
      console.error("Generation error:", err);
      setErrorMessage("Error generating. Please try again.");
      setState("error");
    }
  };

  useEffect(() => {
    if (!hasGenerated) {
      generateEditorial();
    }
  }, []);

  const handleRetry = () => {
    generateEditorial();
  };

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
      await new Promise((resolve) => setTimeout(resolve, 500));

      const sections = element.querySelectorAll("section, .studio-content > *:not(section)");

      const pdfWidth = 210;
      const pdfHeight = 297;
      const marginX = 15;
      const marginY = 20;
      const contentWidth = pdfWidth - marginX * 2;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let currentY = marginY;

      // Add "GLOBAL EDITION" header
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text("GLOBAL EDITION", pdfWidth / 2, 12, { align: "center" });

      // Capture header
      const headerElement = element.querySelector(".studio-header") as HTMLElement;
      if (headerElement) {
        const headerCanvas = await html2canvas(headerElement, {
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

        const headerImgWidth = contentWidth;
        const headerImgHeight = (headerCanvas.height * contentWidth) / headerCanvas.width;

        const headerImgData = headerCanvas.toDataURL("image/png");
        pdf.addImage(headerImgData, "PNG", marginX, currentY, headerImgWidth, headerImgHeight);
        currentY += headerImgHeight + 8;
      }

      // Capture sections
      for (const section of Array.from(sections)) {
        const sectionElement = section as HTMLElement;

        const sectionCanvas = await html2canvas(sectionElement, {
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
            clonedDoc.querySelectorAll(".print-hide").forEach((el) => {
              (el as HTMLElement).style.display = "none";
            });
          },
        });

        if (sectionCanvas.width === 0 || sectionCanvas.height === 0) continue;

        const sectionImgWidth = contentWidth;
        const sectionImgHeight = (sectionCanvas.height * contentWidth) / sectionCanvas.width;

        if (currentY + sectionImgHeight > pdfHeight - marginY) {
          pdf.addPage();
          currentY = marginY;
          // Add header to new page
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(120, 120, 120);
          pdf.text("GLOBAL EDITION", pdfWidth / 2, 12, { align: "center" });
        }

        const sectionImgData = sectionCanvas.toDataURL("image/png");
        pdf.addImage(sectionImgData, "PNG", marginX, currentY, sectionImgWidth, sectionImgHeight);
        currentY += sectionImgHeight + 6;
      }

      // Add Manifesto as final page
      pdf.addPage();
      const centerX = pdfWidth / 2;

      // Header
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text("GLOBAL EDITION", centerX, 12, { align: "center" });

      // Manifesto content
      pdf.setTextColor(30, 30, 30);
      let manifestoY = 80;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(MANIFESTO_EN[0], centerX, manifestoY, { align: "center" });
      manifestoY += 20;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);

      for (let i = 1; i < MANIFESTO_EN.length; i++) {
        pdf.text(MANIFESTO_EN[i], centerX, manifestoY, { align: "center" });
        manifestoY += 14;
      }

      // Footer
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text("DROP Edit™", centerX, pdfHeight - 20, { align: "center" });

      pdf.save("studio-edit-global.pdf");

      toast({
        title: "PDF exported!",
        description: "A4 document saved successfully.",
      });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({
        title: "Export error",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute top-6 right-6">
          <Link to="/" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            Versão Brasil →
          </Link>
        </div>
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
          <div className="container-results py-4 flex items-center justify-between">
            <Link to="/global/studio" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="editorial-caption tracking-[0.2em]">Studio</span>
            <div className="w-5" />
          </div>
        </header>
        <div className="container-results py-20 text-center space-y-6">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="editorial-caption">Generating your brand direction...</p>
          </motion.div>
          <p className="text-sm text-muted-foreground">This takes about 15 seconds.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute top-6 right-6">
          <Link to="/" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            Versão Brasil →
          </Link>
        </div>
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
          <div className="container-results py-4 flex items-center justify-between">
            <Link to="/global/studio" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="editorial-caption tracking-[0.2em]">Studio</span>
            <div className="w-5" />
          </div>
        </header>
        <div className="container-results py-20 text-center space-y-6">
          <p className="text-lg text-foreground">{errorMessage}</p>
          <EditorialButton variant="primary" onClick={handleRetry}>
            Try again
          </EditorialButton>
        </div>
      </div>
    );
  }

  const displayResult = result || DEFAULT_GLOBAL_RESULT;

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
          <Link to="/global/studio" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="editorial-caption tracking-[0.2em]">Studio Edit</span>
          <EditorialButton variant="ghost" size="icon" onClick={handleExportPDF}>
            <Download className="w-4 h-4" />
          </EditorialButton>
        </div>
      </header>

      {/* Content */}
      <div ref={contentRef} className="container-results py-10 studio-content">
        {/* Hero */}
        <header className="studio-header text-center space-y-4 mb-12">
          <span className="editorial-caption tracking-[0.3em]">Global Edition</span>
          <h1 className="editorial-headline text-3xl md:text-4xl">Studio Edit</h1>
          <p className="editorial-subhead text-muted-foreground max-w-md mx-auto">
            Your brand direction. Complete and ready to use.
          </p>
          <div className="editorial-divider mt-8" />
        </header>

        {/* Brand Persona */}
        <section className="space-y-6 mb-10">
          <h2 className="editorial-subhead text-lg">Brand Persona</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <span className="editorial-caption">Archetype</span>
              <p className="text-foreground">{displayResult.persona.archetype}</p>
            </div>
            <div className="space-y-1">
              <span className="editorial-caption">Mental City</span>
              <p className="text-foreground">{displayResult.persona.mental_city}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <span className="editorial-caption">Ambition</span>
              <p className="text-foreground">{displayResult.persona.ambition}</p>
            </div>
            <div className="space-y-1">
              <span className="editorial-caption">Would say</span>
              <p className="text-foreground italic">"{displayResult.persona.would_say}"</p>
            </div>
            <div className="space-y-1">
              <span className="editorial-caption">Would never say</span>
              <p className="text-muted-foreground italic">"{displayResult.persona.would_never_say}"</p>
            </div>
          </div>
        </section>

        <div className="editorial-divider mb-10" />

        {/* Visual Identity */}
        <section className="space-y-6 mb-10">
          <h2 className="editorial-subhead text-lg">Visual Identity</h2>

          {/* Positioning */}
          <div className="space-y-2">
            <span className="editorial-caption">Positioning</span>
            <p className="text-lg text-foreground">{displayResult.positioning}</p>
          </div>

          {/* Palette */}
          <div className="space-y-3">
            <span className="editorial-caption">Palette</span>
            <div className="flex gap-2">
              {displayResult.brand_codes.visual.palette.map((color, i) => (
                <div key={i} className="space-y-1 text-center">
                  <div
                    className="w-12 h-12 rounded-sm border border-border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-muted-foreground">{color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Textures & Composition */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <span className="editorial-caption">Textures</span>
              <p className="text-muted-foreground">{displayResult.brand_codes.visual.textures.join(", ")}</p>
            </div>
            <div className="space-y-2">
              <span className="editorial-caption">Composition</span>
              <p className="text-muted-foreground">{displayResult.brand_codes.visual.composition.join(", ")}</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <span className="editorial-caption">Light</span>
              <p className="text-muted-foreground">{displayResult.brand_codes.visual.light}</p>
            </div>
          </div>

          {/* Verbal Codes */}
          <div className="space-y-4 pt-4">
            <span className="editorial-caption">Verbal Codes</span>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Tone</span>
                <p className="text-foreground">{displayResult.brand_codes.verbal.tone}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Rhythm</span>
                <p className="text-foreground">{displayResult.brand_codes.verbal.rhythm}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Allowed</span>
                <p className="text-foreground">{displayResult.brand_codes.verbal.allowed_words.join(", ")}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Forbidden</span>
                <p className="text-muted-foreground">{displayResult.brand_codes.verbal.forbidden_words.join(", ")}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="editorial-divider mb-10" />

        {/* Why It Works (Mandatory) */}
        <section className="space-y-4 mb-10">
          <h2 className="editorial-subhead text-lg">Why it works</h2>
          <p className="text-sm text-muted-foreground italic mb-4">It's not about trend, it's about direction.</p>
          <ul className="space-y-3">
            {displayResult.why_it_works.map((reason, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground">{reason}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="editorial-divider mb-10" />

        {/* The Edit — Where to Start (Mandatory) */}
        <section className="space-y-6 mb-10">
          <h2 className="editorial-subhead text-lg">The Edit — where to start</h2>

          {/* Shortlist */}
          <div className="space-y-4">
            <span className="editorial-caption">The Shortlist</span>
            <div className="space-y-3">
              {displayResult.commerce.shortlist.map((item, i) => (
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
              {displayResult.commerce.look_recipes.map((recipe, i) => (
                <p key={i} className="text-muted-foreground">• {recipe.formula}</p>
              ))}
            </div>
          </div>

          {/* Search Terms */}
          <div className="space-y-3">
            <span className="editorial-caption">Search terms</span>
            <div className="flex flex-wrap gap-2">
              {displayResult.commerce.search_terms.map((term, i) => (
                <span key={i} className="px-3 py-1 bg-muted/50 rounded-sm text-sm text-muted-foreground">
                  {term}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Optional Toggles */}
        {displayResult.looks && displayResult.looks.length > 0 && (
          <EditorialToggleSection
            title="Conceptual Looks"
            introLine="Three visual readings of the same direction."
            secondaryLine="These aren't fixed proposals, they're possible paths."
          >
            <div className="space-y-6">
              {displayResult.looks.map((look, i) => (
                <div key={i} className="space-y-2 p-4 bg-muted/20 rounded-sm">
                  <h4 className="font-medium">{look.title}</h4>
                  <p className="text-sm"><span className="text-muted-foreground">Hero:</span> {look.hero_piece}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Supporting:</span> {look.supporting.join(", ")}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Accessory:</span> {look.accessory}</p>
                  <p className="text-sm text-muted-foreground italic mt-2">{look.caption}</p>
                </div>
              ))}
            </div>
          </EditorialToggleSection>
        )}

        {displayResult.makeup && (
          <EditorialToggleSection
            title="Makeup"
            introLine="Texture, finish, and intention."
            secondaryLine="Makeup follows the gesture, not the other way around."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <span className="editorial-caption">Base</span>
                <p className="text-foreground">{displayResult.makeup.base}</p>
              </div>
              <div className="space-y-1">
                <span className="editorial-caption">Cheeks</span>
                <p className="text-foreground">{displayResult.makeup.cheeks}</p>
              </div>
              <div className="space-y-1">
                <span className="editorial-caption">Eyes</span>
                <p className="text-foreground">{displayResult.makeup.eyes}</p>
              </div>
              <div className="space-y-1">
                <span className="editorial-caption">Lips</span>
                <p className="text-foreground">{displayResult.makeup.lips}</p>
              </div>
            </div>
          </EditorialToggleSection>
        )}

        {displayResult.fragrances && displayResult.fragrances.length > 0 && (
          <EditorialToggleSection
            title="Fragrance"
            introLine="Scent as signature."
            secondaryLine="What you leave behind matters as much as what you wear."
          >
            <div className="space-y-4">
              {displayResult.fragrances.map((frag, i) => (
                <div key={i} className="p-4 bg-muted/20 rounded-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{frag.name}</h4>
                    <span className="text-xs text-muted-foreground capitalize">{frag.price_tier}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{frag.notes}</p>
                  <p className="text-sm text-foreground mt-2">{frag.why_it_matches}</p>
                </div>
              ))}
            </div>
          </EditorialToggleSection>
        )}

        <div className="editorial-divider my-10" />

        {/* Closing Note */}
        <section className="text-center space-y-4">
          <p className="editorial-body text-muted-foreground max-w-md mx-auto italic">
            {displayResult.closing_note}
          </p>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/30 py-4 print-hide">
        <div className="container-results flex items-center gap-4">
          <EditorialButton
            variant="secondary"
            className="flex-1"
            onClick={() => navigate("/global/studio/input")}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Edit
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

export default GlobalStudioResultPage;

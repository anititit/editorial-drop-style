import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, RotateCcw, Sparkles } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { ProLoadingEditorial } from "@/components/ProLoadingEditorial";
import { ProResultsView } from "@/components/results/ProResultsView";
import { getResultById } from "@/lib/storage";
import { ProEditorialResult, DEFAULT_PRO_RESULT } from "@/lib/pro-types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ProPageState = "loading" | "results" | "error";

const ProPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fromResultId = searchParams.get("from");
  const contentRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<ProPageState>("loading");
  const [result, setResult] = useState<ProEditorialResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Get stored data from the Pro brief
  const getProBriefData = (): { 
    brandName: string; 
    category: string; 
    objective: string;
    images: string[]; 
    brandRefs: string[];
  } | null => {
    const storedBrief = sessionStorage.getItem("pro_brief");
    if (storedBrief) {
      try {
        const parsed = JSON.parse(storedBrief);
        return {
          brandName: parsed.brandName || "",
          category: parsed.category || "lifestyle",
          objective: parsed.objective || "consistencia",
          images: parsed.visualRefs || [],
          brandRefs: parsed.brandRefs || [],
        };
      } catch (e) {
        console.error("Failed to parse pro brief:", e);
      }
    }

    // Fallback to legacy storage (from B2C upgrade flow)
    const storedImages = sessionStorage.getItem("editorial_images");
    if (storedImages) {
      try {
        const parsed = JSON.parse(storedImages);
        if (Array.isArray(parsed) && parsed.length === 3) {
          return { 
            brandName: "", 
            category: "lifestyle", 
            objective: "consistencia",
            images: parsed, 
            brandRefs: [] 
          };
        }
      } catch (e) {
        console.error("Failed to parse stored images:", e);
      }
    }

    return null;
  };

  const generateProEditorial = async () => {
    setState("loading");
    setErrorMessage("");

    const briefData = getProBriefData();
    if (!briefData || (briefData.images.length === 0 && briefData.brandRefs.length === 0)) {
      // No data available, redirect to Pro brief
      navigate("/pro/brief");
      return;
    }

    try {
      const isUrls = briefData.images.length > 0 && briefData.images[0]?.startsWith("http");

      const response = await supabase.functions.invoke("generate-pro-editorial", {
        body: {
          images: briefData.images,
          isUrls,
          brandRefs: briefData.brandRefs,
          brandInfo: {
            name: briefData.brandName,
            category: briefData.category,
            objective: briefData.objective,
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate");
      }

      const data = response.data;

      if (data.error) {
        setErrorMessage(data.message || "Não foi possível gerar o editorial.");
        setState("error");
        return;
      }

      setResult(data as ProEditorialResult);
      setState("results");
      setHasGenerated(true);
    } catch (err) {
      console.error("Pro generation error:", err);
      setErrorMessage("Erro ao gerar. Tente novamente.");
      setState("error");
    }
  };

  useEffect(() => {
    if (!hasGenerated) {
      generateProEditorial();
    }
  }, []);

  const handleRetry = () => {
    generateProEditorial();
  };

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

      // Wait for any animations to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FAFAF8",
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          // Make all motion elements visible
          clonedDoc.querySelectorAll('[style*="opacity"]').forEach((el) => {
            (el as HTMLElement).style.opacity = '1';
            (el as HTMLElement).style.transform = 'none';
          });
        },
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas is empty");
      }

      // Create a single continuous PDF (no page breaks = no cutting)
      const pdfWidth = 210; // A4 width in mm
      const margin = 12;
      const contentWidth = pdfWidth - margin * 2;
      const aspectRatio = canvas.height / canvas.width;
      const contentHeight = contentWidth * aspectRatio;
      const pdfHeight = contentHeight + margin * 2;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight], // Custom height to fit all content
      });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", margin, margin, contentWidth, contentHeight);

      pdf.save("brand-editorial-kit.pdf");

      toast({
        title: "PDF exportado!",
        description: "O arquivo foi salvo.",
      });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o PDF. Tente novamente.",
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
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
          <div className="container-results py-4 flex items-center justify-between">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="editorial-caption">DROP Pro</span>
            </div>
            <div className="w-5" />
          </div>
        </header>
        <ProLoadingEditorial />
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
          <div className="container-results py-4 flex items-center justify-between">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="editorial-caption">DROP Pro</span>
            </div>
            <div className="w-5" />
          </div>
        </header>
        <ProLoadingEditorial hasError errorMessage={errorMessage} onRetry={handleRetry} />
      </div>
    );
  }

  // Results state
  const displayResult = result || DEFAULT_PRO_RESULT;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30 print-hide">
        <div className="container-results py-4 flex items-center justify-between">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="editorial-caption">Brand Editorial Kit</span>
          </div>
          <EditorialButton variant="ghost" size="icon" onClick={handleExportPDF}>
            <Download className="w-4 h-4" />
          </EditorialButton>
        </div>
      </header>

      {/* Content */}
      <div ref={contentRef} className="container-results py-10">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-12"
        >
          <span className="editorial-caption">DROP Pro</span>
          <h1 className="editorial-headline text-3xl md:text-4xl">
            Brand Editorial Kit
          </h1>
          <p className="editorial-subhead text-muted-foreground max-w-md mx-auto">
            Sua direção criativa completa. Pronta para aplicar.
          </p>
        </motion.header>

        <div className="editorial-divider mb-12" />

        <ProResultsView result={displayResult} />
      </div>

      {/* Actions */}
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
  );
};

export default ProPage;

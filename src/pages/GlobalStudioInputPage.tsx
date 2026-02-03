import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Building2, Layers, X, Plus, Link as LinkIcon, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EditorialButton } from "@/components/ui/EditorialButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import GlobalNav from "@/components/GlobalNav";

type GuidanceType = "visual" | "brands" | "both";

const GUIDANCE_OPTIONS = [
  {
    value: "visual" as const,
    label: "Visual references",
    description: "Moodboard, editorials, product images",
    icon: ImageIcon,
  },
  {
    value: "brands" as const,
    label: "Inspirational brands",
    description: "Brands that inspire your direction",
    icon: Building2,
  },
  {
    value: "both" as const,
    label: "Both",
    description: "Visual references + brand inspiration",
    icon: Layers,
  },
];

const CATEGORIES = [
  { id: "fashion", label: "Fashion" },
  { id: "beauty", label: "Beauty" },
  { id: "food", label: "Food" },
  { id: "tech", label: "Tech" },
];

const MAX_FILE_SIZE = 6 * 1024 * 1024;

const TRUSTED_DOMAINS = [
  "imgur.com", "i.imgur.com", "cloudinary.com", "res.cloudinary.com",
  "images.unsplash.com", "unsplash.com", "pexels.com", "images.pexels.com",
  "cdn.pixabay.com", "pixabay.com", "firebasestorage.googleapis.com",
  "storage.googleapis.com", "s3.amazonaws.com", "amazonaws.com",
  "supabase.co", "githubusercontent.com", "raw.githubusercontent.com",
];

const isValidImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const hasImageExt = /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(parsed.pathname);
    if (hasImageExt) return true;
    return TRUSTED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

const GlobalStudioInputPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState("fashion");
  const [guidanceType, setGuidanceType] = useState<GuidanceType | null>(null);
  const [visualRefs, setVisualRefs] = useState<string[]>([]);
  const [brandRefs, setBrandRefs] = useState<string[]>(["", "", ""]);
  const [note, setNote] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const needsVisual = guidanceType === "visual" || guidanceType === "both";
  const needsBrands = guidanceType === "brands" || guidanceType === "both";
  const filledBrandRefs = brandRefs.filter((b) => b.trim().length > 0);

  const updateBrandRef = (index: number, value: string) => {
    const updated = [...brandRefs];
    updated[index] = value;
    setBrandRefs(updated);
  };

  const isValid = () => {
    if (!guidanceType) return false;
    if (needsVisual && visualRefs.length !== 3) return false;
    if (needsBrands && filledBrandRefs.length < 2) return false;
    return true;
  };

  const handleSubmit = () => {
    if (!isValid()) return;

    const studioData = {
      category,
      guidanceType,
      visualRefs: needsVisual ? visualRefs : [],
      brandRefs: needsBrands ? filledBrandRefs : [],
      note: note.trim(),
      lang: "en",
    };

    sessionStorage.setItem("global_studio_brief", JSON.stringify(studioData));
    navigate("/global/studio/result");
  };

  // Image handling
  const addImageFromFile = useCallback(
    (file: File) => {
      if (visualRefs.length >= 3) return;

      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast({ title: "Invalid format", description: "Use PNG, JPG or WebP.", variant: "destructive" });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "File too large", description: "Maximum 6MB per image.", variant: "destructive" });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) setVisualRefs((prev) => [...prev, result].slice(0, 3));
      };
      reader.readAsDataURL(file);
    },
    [visualRefs, toast]
  );

  const addImageFromUrl = useCallback(() => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) return;

    if (!isValidImageUrl(trimmedUrl)) {
      toast({ title: "Invalid URL", description: "Use direct image links or trusted CDNs.", variant: "destructive" });
      return;
    }

    if (visualRefs.includes(trimmedUrl)) {
      toast({ title: "Duplicate", description: "This URL was already added.", variant: "destructive" });
      return;
    }

    setVisualRefs((prev) => [...prev, trimmedUrl].slice(0, 3));
    setUrlInput("");
    setShowUrlInput(false);
  }, [urlInput, visualRefs, toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const text = e.dataTransfer.getData("text/plain");
      if (text && isValidImageUrl(text)) {
        if (visualRefs.length < 3 && !visualRefs.includes(text)) {
          setVisualRefs((prev) => [...prev, text].slice(0, 3));
        }
        return;
      }

      const files = Array.from(e.dataTransfer.files);
      files.slice(0, 3 - visualRefs.length).forEach(addImageFromFile);
    },
    [visualRefs, addImageFromFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).slice(0, 3 - visualRefs.length).forEach(addImageFromFile);
  };

  const removeImage = (index: number) => {
    setVisualRefs(visualRefs.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />

      {/* Content */}
      <main className="container-results pt-24 py-10 space-y-10">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <span className="editorial-caption tracking-[0.3em]">Brand Direction</span>
          <h1 className="editorial-headline text-2xl md:text-3xl">
            How would you like to guide the direction?
          </h1>
        </motion.header>

        {/* Category Selection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <span className="editorial-caption block">Category</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "px-4 py-2 text-sm rounded-sm border transition-all",
                  category === c.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/60 text-muted-foreground hover:border-foreground/40"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </motion.section>

        <div className="editorial-divider" />

        {/* Guidance Type Selection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <RadioGroup
            value={guidanceType || ""}
            onValueChange={(v) => setGuidanceType(v as GuidanceType)}
            className="grid gap-3"
          >
            {GUIDANCE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = guidanceType === option.value;

              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-sm border-2 cursor-pointer transition-all",
                    isSelected
                      ? "border-foreground bg-foreground/5"
                      : "border-border/60 hover:border-foreground/40"
                  )}
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </motion.section>

        {/* Visual References */}
        {needsVisual && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="editorial-divider" />
            <div className="space-y-2">
              <h2 className="editorial-subhead font-medium">Visual references</h2>
              <p className="text-sm text-muted-foreground">
                Upload exactly 3 images that represent your desired aesthetic.
              </p>
            </div>

            {/* Counter */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Selected</span>
              <span className="text-sm font-medium">{visualRefs.length}/3</span>
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {visualRefs.map((url, index) => (
                  <motion.div
                    key={url.slice(0, 50) + index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square"
                  >
                    <img
                      src={url}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-full object-cover rounded-sm border border-border"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-foreground/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}

                {visualRefs.length < 3 && visualRefs.length > 0 && (
                  <motion.button
                    key="add-button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-border/60 rounded-sm flex flex-col items-center justify-center gap-1 hover:border-foreground/40 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-xs">Add</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Drop Zone */}
            {visualRefs.length === 0 && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-sm py-10 cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-border/60 hover:border-foreground/40"
                )}
              >
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Drag images or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WebP (max 6MB each)</p>
                </div>
              </div>
            )}

            {/* URL input */}
            {visualRefs.length < 3 && (
              <div className="space-y-3">
                {!showUrlInput ? (
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Or paste an image URL
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://... (direct image URL)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageFromUrl(); } }}
                    />
                    <button
                      type="button"
                      onClick={addImageFromUrl}
                      className="px-4 py-2 bg-foreground text-background rounded-sm text-sm font-medium hover:bg-foreground/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </motion.section>
        )}

        {/* Brand References */}
        {needsBrands && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="editorial-divider" />
            <div className="space-y-2">
              <h2 className="editorial-subhead font-medium">Inspirational brands</h2>
              <p className="text-sm text-muted-foreground">
                Name 2–3 brands whose visual language and tone inspire you.
              </p>
            </div>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Brand {index + 1}{index < 2 ? " *" : " (optional)"}
                  </label>
                  <Input
                    placeholder={index === 0 ? "e.g. Glossier" : index === 1 ? "e.g. The Row" : "e.g. Aesop"}
                    value={brandRefs[index]}
                    onChange={(e) => updateBrandRef(index, e.target.value)}
                    className="bg-background"
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">{filledBrandRefs.length}/3 brands • Minimum 2</p>
            </div>
          </motion.section>
        )}

        <div className="editorial-divider" />

        {/* Optional Note */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <span className="editorial-caption block">Short note (optional)</span>
            <p className="text-sm text-muted-foreground">
              Any additional context for the direction.
            </p>
          </div>
          <Textarea
            placeholder="e.g. Launching in Spring, targeting creative professionals..."
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 240))}
            className="bg-muted/30 border-border/50 resize-none"
            rows={3}
          />
          <p className="text-xs text-muted-foreground text-right">{note.length}/240</p>
        </motion.section>
      </main>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/30 py-4">
        <div className="container-results">
          <EditorialButton
            variant="primary"
            className="w-full"
            onClick={handleSubmit}
            disabled={!isValid()}
          >
            Create Studio Edit
            <ArrowRight className="w-4 h-4 ml-2" />
          </EditorialButton>
          {!isValid() && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              {!guidanceType && "Select a guidance type. "}
              {guidanceType && needsVisual && visualRefs.length !== 3 && "Upload exactly 3 visual references. "}
              {guidanceType && needsBrands && filledBrandRefs.length < 2 && "Add at least 2 brands. "}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalStudioInputPage;

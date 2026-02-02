import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ProImageUploaderProps {
  urls: string[];
  onUrlsChange: (urls: string[]) => void;
  maxImages?: number;
}

const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB

// Whitelist of trusted image CDNs
const TRUSTED_DOMAINS = [
  "imgur.com",
  "i.imgur.com",
  "cloudinary.com",
  "res.cloudinary.com",
  "images.unsplash.com",
  "unsplash.com",
  "pexels.com",
  "images.pexels.com",
  "cdn.pixabay.com",
  "pixabay.com",
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
  "s3.amazonaws.com",
  "amazonaws.com",
  "supabase.co",
  "githubusercontent.com",
  "raw.githubusercontent.com",
];

const isValidImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Check for direct image extensions
    const hasImageExt = /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(parsed.pathname);
    if (hasImageExt) return true;

    // Check trusted domains
    return TRUSTED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

export function ProImageUploader({
  urls,
  onUrlsChange,
  maxImages = 3,
}: ProImageUploaderProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addImageFromFile = useCallback(
    (file: File) => {
      if (urls.length >= maxImages) return;

      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: "Use PNG, JPG ou WebP.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Arquivo muito grande",
          description: "Máximo 6MB por imagem.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onUrlsChange([...urls, result].slice(0, maxImages));
        }
      };
      reader.readAsDataURL(file);
    },
    [urls, maxImages, onUrlsChange, toast]
  );

  const addImageFromUrl = useCallback(() => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) return;

    if (!isValidImageUrl(trimmedUrl)) {
      toast({
        title: "URL inválida",
        description: "Use links diretos de imagem (.jpg, .png, .webp) ou de CDNs confiáveis.",
        variant: "destructive",
      });
      return;
    }

    if (urls.includes(trimmedUrl)) {
      toast({
        title: "Imagem duplicada",
        description: "Esta URL já foi adicionada.",
        variant: "destructive",
      });
      return;
    }

    onUrlsChange([...urls, trimmedUrl].slice(0, maxImages));
    setUrlInput("");
    setShowUrlInput(false);
  }, [urlInput, urls, maxImages, onUrlsChange, toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      // Check for URL drops
      const text = e.dataTransfer.getData("text/plain");
      if (text && isValidImageUrl(text)) {
        if (urls.length < maxImages && !urls.includes(text)) {
          onUrlsChange([...urls, text].slice(0, maxImages));
        }
        return;
      }

      // Handle file drops
      const files = Array.from(e.dataTransfer.files);
      files.slice(0, maxImages - urls.length).forEach(addImageFromFile);
    },
    [urls, maxImages, onUrlsChange, addImageFromFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files)
      .slice(0, maxImages - urls.length)
      .forEach(addImageFromFile);
  };

  const removeImage = (index: number) => {
    onUrlsChange(urls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Counter */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Referências selecionadas</span>
        <span className="text-sm font-medium">
          {urls.length}/{maxImages}
        </span>
      </div>

      {/* Preview Grid */}
      <div className="grid grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {urls.map((url, index) => (
            <motion.div
              key={url.slice(0, 50) + index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square"
            >
              <img
                src={url}
                alt={`Referência ${index + 1}`}
                className="w-full h-full object-cover rounded-sm border border-border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
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

          {/* Add more button */}
          {urls.length < maxImages && urls.length > 0 && (
            <motion.button
              key="add-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-border/60 rounded-sm flex flex-col items-center justify-center gap-1 hover:border-foreground/40 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Adicionar</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Drop Zone (when no images) */}
      {urls.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-sm py-10 cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border/60 hover:border-foreground/40"
          )}
        >
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">Arraste imagens ou clique para enviar</p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG ou WebP (máx. 6MB cada)
            </p>
          </div>
        </div>
      )}

      {/* URL input toggle */}
      {urls.length < maxImages && (
        <div className="space-y-3">
          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              Ou cole uma URL de imagem
            </button>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="https://... (URL direta da imagem)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImageFromUrl();
                  }
                }}
              />
              <button
                type="button"
                onClick={addImageFromUrl}
                className="px-4 py-2 bg-foreground text-background rounded-sm text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                Adicionar
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
    </div>
  );
}

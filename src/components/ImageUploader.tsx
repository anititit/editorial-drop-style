import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SafetyModal } from "./SafetyModal";
import { ExampleThumbnails } from "./ExampleThumbnails";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  locale?: "en" | "pt-BR";
}

const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB

const i18n = {
  en: {
    selectedReferences: "Selected references",
    add: "Add",
    addMorePhotos: "Add more photos",
    dragImages: "Drag 3 images or click here",
    fileTypes: "PNG, JPG or WebP (max 6MB each)",
    reference: "Reference",
  },
  "pt-BR": {
    selectedReferences: "Referências selecionadas",
    add: "Adicionar",
    addMorePhotos: "Adicionar mais fotos",
    dragImages: "Arraste 3 imagens ou clique aqui",
    fileTypes: "PNG, JPG ou WebP (máx. 6MB cada)",
    reference: "Referência",
  },
};

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 3,
  locale = "pt-BR",
}: ImageUploaderProps) {
  const t = i18n[locale];
  const [isDragging, setIsDragging] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [hasAcceptedSafety, setHasAcceptedSafety] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if user has previously accepted (sessionStorage)
  useEffect(() => {
    const accepted = sessionStorage.getItem("safety_accepted");
    if (accepted === "true") {
      setHasAcceptedSafety(true);
    }
  }, []);

  const processFiles = useCallback(
    (files: File[]) => {
      const remaining = maxImages - images.length;
      const filesToProcess = files.slice(0, remaining);

      filesToProcess.forEach((file) => {
        // Validate file type
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
          console.warn(`Skipped ${file.name}: invalid type ${file.type}`);
          return;
        }

        // Validate file size (6MB max)
        if (file.size > MAX_FILE_SIZE) {
          console.warn(`Skipped ${file.name}: exceeds 6MB limit`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            onImagesChange([...images, result].slice(0, maxImages));
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [images, maxImages, onImagesChange]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      // If not accepted safety terms yet, show modal first
      if (!hasAcceptedSafety) {
        setPendingFiles(fileArray);
        setShowSafetyModal(true);
        return;
      }

      processFiles(fileArray);
    },
    [hasAcceptedSafety, processFiles]
  );

  const handleSafetyAccept = () => {
    setHasAcceptedSafety(true);
    sessionStorage.setItem("safety_accepted", "true");
    setShowSafetyModal(false);

    // Process pending files if any
    if (pendingFiles) {
      processFiles(pendingFiles);
      setPendingFiles(null);
    }
  };

  const handleSafetyClose = () => {
    setShowSafetyModal(false);
    setPendingFiles(null);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const triggerInput = () => {
    // If not accepted safety terms yet, show modal first
    if (!hasAcceptedSafety) {
      setShowSafetyModal(true);
      return;
    }
    inputRef.current?.click();
  };

  return (
    <>
      <SafetyModal
        isOpen={showSafetyModal}
        onAccept={handleSafetyAccept}
        onClose={handleSafetyClose}
      />

      <div 
        className="space-y-4"
        onDrop={images.length < maxImages ? handleDrop : undefined}
        onDragOver={images.length < maxImages ? handleDragOver : undefined}
        onDragLeave={images.length < maxImages ? handleDragLeave : undefined}
      >
      {/* Counter */}
        <div className="flex items-center justify-between">
          <span className="editorial-caption">{t.selectedReferences}</span>
          <span className="text-sm font-medium">
            {images.length}/{maxImages}
          </span>
        </div>

        {/* Preview Grid */}
        {images.length > 0 && (
          <div className={cn(
            "grid grid-cols-3 gap-3 p-4 rounded-lg border-2 border-dashed transition-colors",
            isDragging ? "border-foreground/40 bg-muted/50" : "border-transparent"
          )}>
            <AnimatePresence mode="popLayout">
              {images.map((img, index) => (
                <motion.div
                  key={img.slice(0, 50) + index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-square"
                >
                  <img
                    src={img}
                    alt={`${t.reference} ${index + 1}`}
                    className="image-preview w-full h-full object-cover"
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
              {images.length < maxImages && (
                <motion.button
                  key="add-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  type="button"
                  onClick={triggerInput}
                  className="aspect-square border-2 border-dashed border-border/60 rounded-sm flex flex-col items-center justify-center gap-1 hover:border-foreground/40 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">{t.add}</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Add more button */}
        {images.length > 0 && images.length < maxImages && (
          <button
            type="button"
            onClick={triggerInput}
            className="w-full py-3 border-2 border-dashed border-border/60 rounded-lg flex items-center justify-center gap-2 hover:border-foreground/40 hover:bg-muted/30 transition-colors text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">{t.addMorePhotos}</span>
          </button>
        )}

        {/* Drop Zone (when no images) */}
        {images.length === 0 && (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={triggerInput}
              className={cn(
                "upload-zone py-12 cursor-pointer flex flex-col items-center justify-center gap-3",
                isDragging && "active"
              )}
            >
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  {t.dragImages}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.fileTypes}
                </p>
              </div>
            </div>

            {/* Example thumbnails */}
            <ExampleThumbnails locale={locale} />
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </>
  );
}

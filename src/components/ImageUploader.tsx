import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 3,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const remaining = maxImages - images.length;
      const filesToProcess = Array.from(files).slice(0, remaining);

      filesToProcess.forEach((file) => {
        if (!file.type.startsWith("image/")) return;

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
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Counter */}
      <div className="flex items-center justify-between">
        <span className="editorial-caption">Imagens selecionadas</span>
        <span className="text-sm font-medium">
          {images.length}/{maxImages}
        </span>
      </div>

      {/* Preview Grid */}
      <div className="grid grid-cols-3 gap-3">
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
                alt={`Referência ${index + 1}`}
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
              <span className="text-xs">Adicionar</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Drop Zone (when no images) */}
      {images.length === 0 && (
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
              Arraste imagens ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG ou WebP (máx. 3 imagens)
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

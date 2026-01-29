import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface UrlInputProps {
  urls: string[];
  onUrlsChange: (urls: string[]) => void;
  maxUrls?: number;
}

export function UrlInput({ urls, onUrlsChange, maxUrls = 3 }: UrlInputProps) {
  const [text, setText] = useState(urls.join("\n"));

  useEffect(() => {
    // Parse URLs from text
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, maxUrls);
    
    onUrlsChange(lines);
  }, [text, maxUrls, onUrlsChange]);

  const validCount = urls.filter((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }).length;

  return (
    <div className="space-y-4">
      {/* Counter */}
      <div className="flex items-center justify-between">
        <span className="editorial-caption">URLs válidas</span>
        <span className="text-sm font-medium">
          {validCount}/{maxUrls}
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="https://pinterest.com/pin/123...&#10;https://instagram.com/p/abc...&#10;https://example.com/image.jpg"
        className={cn(
          "w-full h-32 px-4 py-3 text-sm",
          "bg-transparent border border-border rounded-sm",
          "placeholder:text-muted-foreground/60",
          "focus:outline-none focus:border-foreground/40",
          "resize-none font-mono"
        )}
      />

      <p className="text-xs text-muted-foreground">
        Cole uma URL por linha (Pinterest, Instagram, ou links diretos de imagem)
      </p>
    </div>
  );
}

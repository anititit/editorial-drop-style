import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, X, AlertCircle } from "lucide-react";

interface UrlInputProps {
  urls: string[];
  onUrlsChange: (urls: string[]) => void;
  maxUrls?: number;
}

interface UrlValidation {
  url: string;
  isValid: boolean;
  error?: string;
}

// Valid image extensions
const VALID_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

// Allowed CDN domains for direct images
const ALLOWED_CDN_DOMAINS = [
  "i.pinimg.com",
  "images.unsplash.com",
  "images.pexels.com",
  "cdn.pixabay.com",
];

// Invalid page URLs (not direct images)
const INVALID_PAGE_PATTERNS = [
  { pattern: /pinterest\.com\/pin\//i, message: "Use link direto de i.pinimg.com" },
  { pattern: /instagram\.com\//i, message: "Instagram não suporta links diretos" },
  { pattern: /pinterest\.[a-z]+\/pin\//i, message: "Use link direto de i.pinimg.com" },
];

function validateImageUrl(url: string): UrlValidation {
  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return { url: trimmedUrl, isValid: false };
  }

  // Check if it's a valid URL format
  try {
    const parsed = new URL(trimmedUrl);
    
    // Check for invalid page patterns first
    for (const { pattern, message } of INVALID_PAGE_PATTERNS) {
      if (pattern.test(trimmedUrl)) {
        return { url: trimmedUrl, isValid: false, error: message };
      }
    }

    // Check if it's from an allowed CDN (these don't always have extensions)
    const hostname = parsed.hostname.toLowerCase();
    const isAllowedCdn = ALLOWED_CDN_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
    
    if (isAllowedCdn) {
      return { url: trimmedUrl, isValid: true };
    }

    // For other URLs, require valid image extension
    const pathname = parsed.pathname.toLowerCase();
    const hasValidExtension = VALID_EXTENSIONS.some(ext => pathname.endsWith(ext));
    
    if (!hasValidExtension) {
      return { 
        url: trimmedUrl, 
        isValid: false, 
        error: "Use URL terminando em .jpg, .png ou .webp" 
      };
    }

    return { url: trimmedUrl, isValid: true };
  } catch {
    return { url: trimmedUrl, isValid: false, error: "URL inválida" };
  }
}

export function UrlInput({ urls, onUrlsChange, maxUrls = 3 }: UrlInputProps) {
  const [text, setText] = useState(urls.join("\n"));
  const [validations, setValidations] = useState<UrlValidation[]>([]);

  useEffect(() => {
    // Parse URLs from text
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, maxUrls);
    
    // Validate each URL
    const newValidations = lines.map(validateImageUrl);
    setValidations(newValidations);
    
    // Only pass valid URLs to parent
    const validUrls = newValidations
      .filter(v => v.isValid)
      .map(v => v.url);
    
    onUrlsChange(validUrls);
  }, [text, maxUrls, onUrlsChange]);

  const validCount = validations.filter(v => v.isValid).length;

  return (
    <div className="space-y-4">
      {/* Counter */}
      <div className="flex items-center justify-between">
        <span className="editorial-caption">URLs válidas</span>
        <span className={cn(
          "text-sm font-medium",
          validCount === maxUrls ? "text-green-600" : "text-muted-foreground"
        )}>
          {validCount}/{maxUrls}
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="https://i.pinimg.com/originals/...&#10;https://images.unsplash.com/photo-...&#10;https://example.com/image.jpg"
        className={cn(
          "w-full h-32 px-4 py-3 text-sm",
          "bg-transparent border border-border rounded-sm",
          "placeholder:text-muted-foreground/60",
          "focus:outline-none focus:border-foreground/40",
          "resize-none font-mono"
        )}
      />

      {/* Inline validation feedback */}
      {validations.length > 0 && (
        <div className="space-y-1.5">
          {validations.map((v, idx) => (
            <div 
              key={idx}
              className={cn(
                "flex items-start gap-2 text-xs py-1.5 px-2 rounded-sm",
                v.isValid 
                  ? "bg-green-500/10 text-green-700 dark:text-green-400" 
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {v.isValid ? (
                <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              )}
              <span className="truncate flex-1 font-mono">
                {v.url.length > 50 ? `${v.url.slice(0, 50)}...` : v.url}
              </span>
              {v.error && (
                <span className="shrink-0 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {v.error}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Cole 1 link direto de imagem por linha (.jpg, .png, .webp).
        <br />
        <span className="text-muted-foreground/80">
          Dica: do Pinterest, use links que começam com i.pinimg.com.
        </span>
      </p>
    </div>
  );
}

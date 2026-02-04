import { motion } from "framer-motion";
import { Share2, Link as LinkIcon, MessageCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareSectionProps {
  profileName: string;
  headline: string;
  resultId?: string;
}

export function SocialShareSection({ profileName, headline, resultId }: SocialShareSectionProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/resultado/${resultId}` 
    : "";
  
  const shareText = `Meu perfil estético: ${profileName}. "${headline}" — Descubra o seu no DROP Edit.`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "Compartilhe seu resultado editorial.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`;
    // Use link navigation instead of window.open to avoid iframe blocking
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DROP Edit — ${profileName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed silently
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="print-hide space-y-6"
    >
      <div className="editorial-divider" />
      
      <div className="text-center space-y-3">
        <h2 className="editorial-headline text-xl md:text-2xl">
          Compartilhe seu estilo
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Sua leitura estética merece ser vista.
        </p>
      </div>
      
      {/* Share Buttons */}
      <div className="flex items-center justify-center gap-4">
        {/* WhatsApp */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleWhatsAppShare}
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors min-w-[80px]"
          aria-label="Compartilhar no WhatsApp"
        >
          <MessageCircle className="w-5 h-5 text-foreground" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            WhatsApp
          </span>
        </motion.button>
        
        {/* Copy Link */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors min-w-[80px]"
          aria-label="Copiar link"
        >
          {copied ? (
            <Check className="w-5 h-5 text-foreground" />
          ) : (
            <LinkIcon className="w-5 h-5 text-foreground" />
          )}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {copied ? "Copiado" : "Copiar"}
          </span>
        </motion.button>
        
        {/* Native Share (if available) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNativeShare}
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors min-w-[80px]"
          aria-label="Mais opções de compartilhamento"
        >
          <Share2 className="w-5 h-5 text-foreground" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Mais
          </span>
        </motion.button>
      </div>
      
      {/* Subtle tagline */}
      <p className="text-center text-[10px] tracking-[0.2em] text-muted-foreground/50 uppercase">
        DROP Edit™ — Seu estilo, editado.
      </p>
    </motion.section>
  );
}

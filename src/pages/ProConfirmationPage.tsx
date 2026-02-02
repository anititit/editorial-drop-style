import { motion } from "framer-motion";
import { Check, Clock, FileText } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { EditorialButton } from "@/components/ui/EditorialButton";

const ProConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("code");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container-editorial py-16 max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Check className="w-8 h-8 text-primary" />
          </motion.div>

          {/* Headline */}
          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="editorial-title text-3xl md:text-4xl"
            >
              Pedido recebido.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="editorial-subhead text-lg text-muted-foreground"
            >
              Estamos fechando sua edição.
            </motion.p>
          </div>

          {/* Order Code */}
          {orderCode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="py-4 px-6 bg-muted/30 rounded-lg border border-border/30"
            >
              <span className="editorial-caption block mb-1">Código do pedido</span>
              <span className="font-mono text-lg tracking-wide">{orderCode}</span>
            </motion.div>
          )}

          {/* Delivery Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span className="text-sm">Entrega em até 24h</span>
            </div>
            
            <p className="text-sm text-muted-foreground/80 italic">
              (muitas vezes no mesmo dia)
            </p>
          </motion.div>

          {/* Divider */}
          <div className="editorial-divider" />

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <span className="editorial-caption">O que vem agora</span>
            
            <div className="flex items-start gap-4 text-left p-4 bg-muted/20 rounded-lg">
              <div className="p-2 bg-background rounded-lg shadow-sm flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1 text-sm">PDF A4 no WhatsApp</h3>
                <p className="text-xs text-muted-foreground">
                  Direção estética completa, shotlist, copy kit — tudo pronto para aplicar.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-4"
          >
            <Link to="/">
              <EditorialButton variant="secondary" className="w-full">
                Voltar ao início
              </EditorialButton>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProConfirmationPage;

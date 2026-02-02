import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const EditorialPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-editorial min-h-screen py-16">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 mb-16"
        >
          <span className="editorial-caption">Leitura</span>
          <h1 className="editorial-headline text-4xl md:text-5xl">Editorial</h1>
          <p className="editorial-subhead text-muted-foreground">
            Leituras sobre estética, imagem e cultura visual.
          </p>
        </motion.header>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="editorial-divider mb-16"
        />

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-md mx-auto space-y-6"
        >
          <p className="editorial-body text-foreground/90 leading-relaxed">
            O Editorial é um espaço de leitura e observação.
          </p>
          <p className="editorial-body text-foreground/90 leading-relaxed">
            Aqui, estética é linguagem.
          </p>
          <p className="editorial-body text-muted-foreground leading-relaxed">
            Escrevemos sobre imagem, marcas, cultura visual e aquilo que molda o jeito como vemos — e somos vistos.
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="editorial-divider my-16"
        />

        {/* Empty state */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center"
        >
          <p className="editorial-caption text-muted-foreground/60">
            Em breve
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EditorialPage;

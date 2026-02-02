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
            Leituras sobre imagem e cultura visual.
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
          className="max-w-md mx-auto text-center"
        >
          <p className="editorial-body text-muted-foreground leading-relaxed">
            Neste espaço, observamos marcas, cultura visual e os códigos que moldam o jeito como vemos, e como somos vistos.
          </p>
          <p className="editorial-caption text-muted-foreground/50 mt-12">
            Em breve, novos artigos.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EditorialPage;

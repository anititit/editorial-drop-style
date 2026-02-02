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
          className="max-w-md mx-auto"
        >
          <p className="editorial-body text-muted-foreground leading-relaxed">
            Neste espaço, observamos marcas, cultura visual e os códigos que moldam o jeito como vemos, e como somos vistos.
          </p>
        </motion.div>

        {/* Articles Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="editorial-caption text-muted-foreground mb-8">Artigos</h2>
          
          {/* Article list */}
          <div className="divide-y divide-border/30">
            <article className="group py-8 first:pt-0">
              <Link to="/editorial/o-codigo-do-luxo-silencioso" className="block space-y-3">
                <span className="editorial-caption text-muted-foreground/60">
                  Códigos Visuais · Janeiro 2026
                </span>
                <h3 className="editorial-headline text-xl md:text-2xl group-hover:text-muted-foreground transition-colors duration-300">
                  O Código do Luxo Silencioso
                </h3>
                <p className="editorial-body text-muted-foreground line-clamp-2">
                  Por que as marcas mais desejadas abandonaram os logos? Uma leitura sobre o novo vocabulário do prestígio.
                </p>
              </Link>
            </article>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default EditorialPage;

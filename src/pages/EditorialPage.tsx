import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import editorialLuxoSilencioso from "@/assets/editorial-luxo-silencioso.jpg";
import editorialEsteticaVazio from "@/assets/editorial-estetica-vazio.jpg";
import editorialCoresComunicam from "@/assets/editorial-cores-comunicam.jpg";
import editorialRetornoClassico from "@/assets/editorial-retorno-classico.jpg";

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
          className="max-w-md mx-auto mb-24"
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
          className="space-y-12"
        >
          <h2 className="editorial-caption text-muted-foreground mb-8">Artigos</h2>
          
          {/* Article grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            <article className="group">
              <Link to="/editorial/o-codigo-do-luxo-silencioso" className="block space-y-4">
                <div className="aspect-[4/3] bg-muted/30 overflow-hidden">
                  <img 
                    src={editorialLuxoSilencioso} 
                    alt="O Código do Luxo Silencioso" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-2">
                  <span className="editorial-caption text-muted-foreground/60">
                    Códigos Visuais · Janeiro 2026
                  </span>
                  <h3 className="editorial-headline text-lg md:text-xl group-hover:text-muted-foreground transition-colors duration-300">
                    O Código do Luxo Silencioso
                  </h3>
                  <p className="editorial-body text-sm text-muted-foreground line-clamp-2">
                    Por que as marcas mais desejadas abandonaram os logos? Uma leitura sobre o novo vocabulário do prestígio.
                  </p>
                </div>
              </Link>
            </article>

            <article className="group">
              <Link to="/editorial/a-estetica-do-vazio" className="block space-y-4">
                <div className="aspect-[4/3] bg-muted/30 overflow-hidden">
                  <img 
                    src={editorialEsteticaVazio} 
                    alt="A Estética do Vazio" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-2">
                  <span className="editorial-caption text-muted-foreground/60">
                    Tendências · Dezembro 2025
                  </span>
                  <h3 className="editorial-headline text-lg md:text-xl group-hover:text-muted-foreground transition-colors duration-300">
                    A Estética do Vazio
                  </h3>
                  <p className="editorial-body text-sm text-muted-foreground line-clamp-2">
                    Como o minimalismo deixou de ser uma escolha estética para se tornar uma linguagem de poder.
                  </p>
                </div>
              </Link>
            </article>

            <article className="group">
              <Link to="/editorial/cores-que-comunicam" className="block space-y-4">
                <div className="aspect-[4/3] bg-muted/30 overflow-hidden">
                  <img 
                    src={editorialCoresComunicam} 
                    alt="Cores que Comunicam" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-2">
                  <span className="editorial-caption text-muted-foreground/60">
                    Paletas · Novembro 2025
                  </span>
                  <h3 className="editorial-headline text-lg md:text-xl group-hover:text-muted-foreground transition-colors duration-300">
                    Cores que Comunicam
                  </h3>
                  <p className="editorial-body text-sm text-muted-foreground line-clamp-2">
                    O papel da cor na construção de uma imagem memorável. Da psicologia à prática.
                  </p>
                </div>
              </Link>
            </article>

            <article className="group">
              <Link to="/editorial/o-retorno-do-classico" className="block space-y-4">
                <div className="aspect-[4/3] bg-muted/30 overflow-hidden">
                  <img 
                    src={editorialRetornoClassico} 
                    alt="O Retorno do Clássico" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-2">
                  <span className="editorial-caption text-muted-foreground/60">
                    Arquivo · Outubro 2025
                  </span>
                  <h3 className="editorial-headline text-lg md:text-xl group-hover:text-muted-foreground transition-colors duration-300">
                    O Retorno do Clássico
                  </h3>
                  <p className="editorial-body text-sm text-muted-foreground line-clamp-2">
                    Em tempos de excesso visual, a elegância atemporal volta ao centro da conversa.
                  </p>
                </div>
              </Link>
            </article>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default EditorialPage;

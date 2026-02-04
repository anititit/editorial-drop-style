import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Palette, Wand2, BookOpen } from "lucide-react";
import { Footer } from "@/components/Footer";

const content = {
  "pt-BR": {
    title: "Nossa Metodologia",
    subtitle: "O Processo DROP Edit",
    heroText: "Transformamos sua essência em identidade visual através de um processo curatorial refinado.",
    backLink: "/",
    backText: "Voltar",
    howItWorks: "Como Funciona",
    steps: [
      {
        number: "01",
        title: "Análise de Personalidade",
        icon: "sparkles",
        items: [
          "Questionário detalhado sobre estilo de vida",
          "Identificação de preferências estéticas",
          "Mapeamento de valores pessoais"
        ]
      },
      {
        number: "02",
        title: "Curadoria de Mood",
        icon: "palette",
        items: [
          "Seleção de paleta de cores personalizada",
          "Definição de atmosfera visual",
          "Escolha de estilo editorial"
        ]
      },
      {
        number: "03",
        title: "Geração de Identidade Visual",
        icon: "wand",
        items: [
          "IA generativa cria composições únicas",
          "Recomendações de marcas alinhadas ao seu perfil",
          "Sugestões de styling personalizadas"
        ]
      },
      {
        number: "04",
        title: "Resultado Final",
        icon: "book",
        items: [
          "Editorial visual completo",
          "Guia de estilo pessoal",
          "Recomendações de marcas brasileiras e internacionais"
        ]
      }
    ],
    technologyTitle: "Tecnologia",
    technologyText: "Utilizamos IA de última geração para criar editoriais visuais únicos, combinando análise de dados com sensibilidade estética.",
    ctaText: "Começar agora",
    ctaLink: "/input"
  },
  en: {
    title: "Our Methodology",
    subtitle: "The DROP Edit Process",
    heroText: "We transform your essence into visual identity through a refined curatorial process.",
    backLink: "/global",
    backText: "Back",
    howItWorks: "How It Works",
    steps: [
      {
        number: "01",
        title: "Personality Analysis",
        icon: "sparkles",
        items: [
          "Detailed lifestyle questionnaire",
          "Aesthetic preference identification",
          "Personal values mapping"
        ]
      },
      {
        number: "02",
        title: "Mood Curation",
        icon: "palette",
        items: [
          "Personalized color palette selection",
          "Visual atmosphere definition",
          "Editorial style choice"
        ]
      },
      {
        number: "03",
        title: "Visual Identity Generation",
        icon: "wand",
        items: [
          "Generative AI creates unique compositions",
          "Brand recommendations aligned with your profile",
          "Personalized styling suggestions"
        ]
      },
      {
        number: "04",
        title: "Final Result",
        icon: "book",
        items: [
          "Complete visual editorial",
          "Personal style guide",
          "Brazilian and international brand recommendations"
        ]
      }
    ],
    technologyTitle: "Technology",
    technologyText: "We use cutting-edge AI to create unique visual editorials, combining data analysis with aesthetic sensibility.",
    ctaText: "Get started",
    ctaLink: "/global"
  }
};

const iconMap = {
  sparkles: Sparkles,
  palette: Palette,
  wand: Wand2,
  book: BookOpen
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function MethodPage() {
  const location = useLocation();
  const isGlobalRoute = location.pathname.startsWith("/global");
  const locale = isGlobalRoute ? "en" : "pt-BR";
  const t = content[locale];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link 
            to={t.backLink}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backText}
          </Link>

          {/* Hero Section */}
          <motion.header 
            className="text-center mb-16 md:mb-24"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              {t.subtitle}
            </p>
            <h1 className="editorial-headline text-4xl md:text-5xl lg:text-6xl mb-8">
              {t.title}
            </h1>
            <div className="editorial-divider mx-auto" />
            <p className="editorial-body text-muted-foreground max-w-xl mx-auto mt-8 text-lg md:text-xl leading-relaxed">
              {t.heroText}
            </p>
          </motion.header>

          {/* How It Works Section */}
          <motion.section 
            className="mb-16 md:mb-24"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="editorial-headline text-2xl md:text-3xl text-center mb-12 md:mb-16"
              variants={fadeInUp}
            >
              {t.howItWorks}
            </motion.h2>

            <div className="space-y-12 md:space-y-16">
              {t.steps.map((step, index) => {
                const IconComponent = iconMap[step.icon as keyof typeof iconMap];
                return (
                  <motion.div 
                    key={index}
                    className="relative"
                    variants={fadeInUp}
                  >
                    {/* Step number */}
                    <div className="flex items-start gap-6 md:gap-8">
                      <div className="flex-shrink-0">
                        <span className="font-serif text-4xl md:text-5xl text-muted-foreground/30">
                          {step.number}
                        </span>
                      </div>
                      
                      <div className="flex-1 pt-2">
                        <div className="flex items-center gap-3 mb-4">
                          <IconComponent className="w-5 h-5 text-foreground/70" />
                          <h3 className="font-serif text-xl md:text-2xl font-medium">
                            {step.title}
                          </h3>
                        </div>
                        
                        <ul className="space-y-2 text-muted-foreground">
                          {step.items.map((item, itemIndex) => (
                            <li 
                              key={itemIndex}
                              className="editorial-body text-sm md:text-base pl-4 border-l border-border/50"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Connector line */}
                    {index < t.steps.length - 1 && (
                      <div className="absolute left-[1.75rem] md:left-[2rem] top-16 h-full w-px bg-gradient-to-b from-border/50 to-transparent" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Technology Section */}
          <motion.section 
            className="text-center mb-16 md:mb-24 py-12 md:py-16 border-y border-border/30"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="editorial-headline text-2xl md:text-3xl mb-6">
              {t.technologyTitle}
            </h2>
            <p className="editorial-body text-muted-foreground max-w-lg mx-auto leading-relaxed">
              {t.technologyText}
            </p>
          </motion.section>

          {/* CTA Section */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              to={t.ctaLink}
              className="inline-flex items-center gap-2 px-8 py-3 bg-foreground text-background font-medium text-sm tracking-wide hover:bg-foreground/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t.ctaText}
            </Link>
          </motion.div>
        </div>
      </div>
      
      <Footer locale={locale} />
    </div>
  );
}

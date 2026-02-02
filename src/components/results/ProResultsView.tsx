import { motion } from "framer-motion";
import { ProEditorialResult } from "@/lib/pro-types";

interface ProResultsViewProps {
  result: ProEditorialResult;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="editorial-headline text-xl md:text-2xl mb-6">{children}</h2>
  );
}

function SubsectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="editorial-caption mb-3">{children}</h3>
  );
}

export function ProResultsView({ result }: ProResultsViewProps) {
  const { persona, positioning, brand_codes, creative_directions, content_system, copy_kit, dos_donts } = result;

  return (
    <div className="space-y-12">
      {/* 1. Brand Persona */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <SectionTitle>01 — Brand Persona</SectionTitle>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-muted/30 rounded-lg">
            <SubsectionTitle>Arquétipo</SubsectionTitle>
            <p className="editorial-body text-lg">{persona.archetype}</p>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <SubsectionTitle>Idade Cultural</SubsectionTitle>
            <p className="editorial-body text-lg">{persona.cultural_age}</p>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <SubsectionTitle>Cidade Mental</SubsectionTitle>
            <p className="editorial-body text-lg">{persona.mental_city}</p>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <SubsectionTitle>Ambição</SubsectionTitle>
            <p className="editorial-body">{persona.ambition}</p>
          </div>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg">
          <SubsectionTitle>Evita</SubsectionTitle>
          <div className="flex flex-wrap gap-2">
            {persona.avoidances.map((item, i) => (
              <span key={i} className="px-3 py-1 bg-background rounded-full text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border-l-2 border-primary/30">
            <SubsectionTitle>Ela diria</SubsectionTitle>
            <p className="editorial-body italic">"{persona.would_say}"</p>
          </div>
          
          <div className="p-4 border-l-2 border-destructive/30">
            <SubsectionTitle>Ela nunca diria</SubsectionTitle>
            <p className="editorial-body italic text-muted-foreground">"{persona.would_never_say}"</p>
          </div>
        </div>
      </motion.section>

      <div className="editorial-divider" />

      {/* 2. Positioning */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center py-8"
      >
        <SectionTitle>02 — Posicionamento</SectionTitle>
        <p className="editorial-subhead text-lg md:text-xl max-w-2xl mx-auto">
          {positioning}
        </p>
      </motion.section>

      <div className="editorial-divider" />

      {/* 3. Brand Codes */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-8"
      >
        <SectionTitle>03 — Códigos de Marca</SectionTitle>
        
        {/* Visual Codes */}
        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Visual</h3>
          
          <div className="flex items-center gap-3 mb-4">
            {brand_codes.visual.palette.map((color, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-lg shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              Contraste: {brand_codes.visual.contrast}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted/30 rounded-lg">
              <SubsectionTitle>Texturas</SubsectionTitle>
              <p className="text-sm">{brand_codes.visual.textures.join(" · ")}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <SubsectionTitle>Composição</SubsectionTitle>
              <ul className="text-sm space-y-1">
                {brand_codes.visual.composition_rules.map((rule, i) => (
                  <li key={i}>• {rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Verbal Codes */}
        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Verbal</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted/30 rounded-lg">
              <SubsectionTitle>Tom</SubsectionTitle>
              <p className="text-sm">{brand_codes.verbal.tone}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <SubsectionTitle>Ritmo</SubsectionTitle>
              <p className="text-sm">{brand_codes.verbal.rhythm}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <SubsectionTitle>Palavras Permitidas</SubsectionTitle>
              <div className="flex flex-wrap gap-2">
                {brand_codes.verbal.allowed_words.map((word, i) => (
                  <span key={i} className="px-2 py-1 bg-primary/10 rounded text-xs">
                    {word}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/10">
              <SubsectionTitle>Palavras Proibidas</SubsectionTitle>
              <div className="flex flex-wrap gap-2">
                {brand_codes.verbal.forbidden_words.map((word, i) => (
                  <span key={i} className="px-2 py-1 bg-destructive/10 rounded text-xs line-through">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="editorial-divider" />

      {/* 4. Creative Directions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <SectionTitle>04 — Direções Criativas</SectionTitle>
        
        <div className="grid gap-6 md:grid-cols-3">
          {creative_directions.map((direction, i) => (
            <div key={i} className="p-5 bg-muted/30 rounded-lg space-y-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {direction.type === "signature" && "Assinatura"}
                  {direction.type === "aspirational" && "Aspiracional"}
                  {direction.type === "conversion" && "Conversão"}
                </span>
                <h4 className="font-medium mt-1">{direction.title}</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Luz:</span> {direction.lighting}</p>
                <p><span className="text-muted-foreground">Enquadramento:</span> {direction.framing}</p>
                <p><span className="text-muted-foreground">Styling:</span> {direction.styling}</p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Ideias de post:</span>
                <ul className="mt-1 space-y-1 text-sm">
                  {direction.post_ideas.map((idea, j) => (
                    <li key={j}>• {idea}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <div className="editorial-divider" />

      {/* 5. Content System */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-6"
      >
        <SectionTitle>05 — Sistema de Conteúdo</SectionTitle>
        
        <div className="grid gap-4 md:grid-cols-3">
          {content_system.pillars.map((pillar, i) => (
            <div key={i} className="p-4 bg-muted/30 rounded-lg text-center">
              <span className="text-xs text-muted-foreground">Pilar {i + 1}</span>
              <p className="font-medium mt-1">{pillar}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-muted/30 rounded-lg">
          <SubsectionTitle>Cadência</SubsectionTitle>
          <p className="text-sm">{content_system.cadence}</p>
        </div>

        <div>
          <SubsectionTitle>Shotlist (12 shots)</SubsectionTitle>
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
            {content_system.shotlist.map((shot, i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg text-sm">
                <span className="text-muted-foreground mr-2">{String(i + 1).padStart(2, "0")}</span>
                {shot}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="editorial-divider" />

      {/* 6. Copy Kit */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-6"
      >
        <SectionTitle>06 — Copy Kit</SectionTitle>
        
        <div className="text-center p-6 bg-muted/30 rounded-lg">
          <SubsectionTitle>Tagline</SubsectionTitle>
          <p className="editorial-subhead text-lg">{copy_kit.tagline}</p>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg">
          <SubsectionTitle>Claims</SubsectionTitle>
          <ul className="space-y-2">
            {copy_kit.claims.map((claim, i) => (
              <li key={i} className="text-sm">• {claim}</li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg">
          <SubsectionTitle>Hooks (10)</SubsectionTitle>
          <div className="grid gap-2 md:grid-cols-2">
            {copy_kit.hooks.map((hook, i) => (
              <p key={i} className="text-sm p-2 bg-background rounded">
                "{hook}"
              </p>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-muted/30 rounded-lg">
            <SubsectionTitle>Legendas modelo</SubsectionTitle>
            <ul className="space-y-3">
              {copy_kit.captions.map((caption, i) => (
                <li key={i} className="text-sm italic border-l-2 border-border pl-3">
                  {caption}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <SubsectionTitle>CTAs</SubsectionTitle>
            <ul className="space-y-2">
              {copy_kit.ctas.map((cta, i) => (
                <li key={i} className="text-sm">→ {cta}</li>
              ))}
            </ul>
          </div>
        </div>
      </motion.section>

      <div className="editorial-divider" />

      {/* 7. Do/Don't */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-6"
      >
        <SectionTitle>07 — Do / Don't</SectionTitle>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-5 bg-primary/5 rounded-lg border border-primary/10">
            <h4 className="font-medium text-primary mb-4">✓ DO</h4>
            <ul className="space-y-2">
              {dos_donts.dos.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-5 bg-destructive/5 rounded-lg border border-destructive/10">
            <h4 className="font-medium text-destructive mb-4">✗ DON'T</h4>
            <ul className="space-y-2">
              {dos_donts.donts.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

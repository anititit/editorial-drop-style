import { ProEditorialResult } from "@/lib/pro-types";
import { EditorialCommerceSection, CommerceData } from "./EditorialCommerceSection";

interface ProResultsViewProps {
  result: ProEditorialResult;
}
function SectionTitle({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <h2 className="text-lg md:text-xl font-semibold tracking-tight mb-6 page-break-before">
      <span className="text-muted-foreground mr-3">{number}</span>
      {children}
    </h2>
  );
}

function SubsectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{children}</h3>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-5 bg-muted/30 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

export function ProResultsView({ result }: ProResultsViewProps) {
  const { persona, positioning, brand_codes, editorial_directions, editorial_example, editorial_closing, commerce } = result;
  
  // Check if we have editorial directions to display (Completo mode)
  const hasDirections = editorial_directions && editorial_directions.length > 0;

  // Calculate section number for commerce (depends on whether directions are shown)
  const commerceSectionNumber = hasDirections ? "06" : "05";
  const closingSectionNumber = hasDirections ? "07" : "06";

  return (
    <div className="pro-editorial-content space-y-16 leading-relaxed">
      {/* 01 — Brand Persona */}
      <section className="space-y-6 page-break-after">
        <SectionTitle number="01">Brand Persona</SectionTitle>
        
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <SubsectionTitle>Arquétipo</SubsectionTitle>
            <p className="text-lg font-medium">{persona.archetype}</p>
          </Card>
          
          <Card>
            <SubsectionTitle>Idade Cultural</SubsectionTitle>
            <p className="text-lg font-medium">{persona.cultural_age}</p>
          </Card>
          
          <Card>
            <SubsectionTitle>Cidade Mental</SubsectionTitle>
            <p className="text-lg font-medium">{persona.mental_city}</p>
          </Card>
          
          <Card>
            <SubsectionTitle>Ambição</SubsectionTitle>
            <p className="text-base">{persona.ambition}</p>
          </Card>
        </div>

        <Card>
          <SubsectionTitle>Evita</SubsectionTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {persona.avoidances.map((item, i) => (
              <span key={i} className="px-3 py-1.5 bg-background rounded-full text-sm">
                {item}
              </span>
            ))}
          </div>
        </Card>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="p-5 border-l-2 border-primary/40 bg-primary/5 rounded-r-lg">
            <SubsectionTitle>Ela diria</SubsectionTitle>
            <p className="text-base italic leading-relaxed">"{persona.would_say}"</p>
          </div>
          
          <div className="p-5 border-l-2 border-muted-foreground/30 bg-muted/20 rounded-r-lg">
            <SubsectionTitle>Ela nunca diria</SubsectionTitle>
            <p className="text-base italic text-muted-foreground leading-relaxed">"{persona.would_never_say}"</p>
          </div>
        </div>
      </section>

      {/* 02 — Positioning */}
      <section className="text-center py-10 page-break-after">
        <SectionTitle number="02">Posicionamento</SectionTitle>
        <p className="text-xl md:text-2xl font-light leading-relaxed max-w-2xl mx-auto mt-6">
          {positioning}
        </p>
      </section>

      {/* 03 — Brand Codes */}
      <section className="space-y-8 page-break-after">
        <SectionTitle number="03">Códigos de Marca</SectionTitle>
        
        {/* Visual Codes */}
        <div className="space-y-5">
          <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
            Códigos Visuais
          </h3>
          
          <div className="flex items-center gap-3">
            {brand_codes.visual.palette.map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-12 h-12 rounded-lg shadow-sm border border-border/30"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] text-muted-foreground font-mono">{color}</span>
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-4">
              Contraste: <strong>{brand_codes.visual.contrast}</strong>
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <SubsectionTitle>Texturas</SubsectionTitle>
              <p className="text-sm leading-relaxed">{brand_codes.visual.textures.join(" · ")}</p>
            </Card>
            <Card>
              <SubsectionTitle>Composição</SubsectionTitle>
              <ul className="text-sm space-y-1.5 leading-relaxed">
                {brand_codes.visual.composition.map((rule, i) => (
                  <li key={i}>• {rule}</li>
                ))}
              </ul>
            </Card>
          </div>

          <Card>
            <SubsectionTitle>Luz</SubsectionTitle>
            <p className="text-sm leading-relaxed">{brand_codes.visual.light}</p>
          </Card>
        </div>

        {/* Verbal Codes */}
        <div className="space-y-5">
          <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
            Códigos Verbais
          </h3>
          
          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <SubsectionTitle>Tom</SubsectionTitle>
              <p className="text-sm leading-relaxed">{brand_codes.verbal.tone}</p>
            </Card>
            <Card>
              <SubsectionTitle>Ritmo</SubsectionTitle>
              <p className="text-sm leading-relaxed">{brand_codes.verbal.rhythm}</p>
            </Card>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Card className="border border-primary/10">
              <SubsectionTitle>Palavras Permitidas</SubsectionTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {brand_codes.verbal.allowed_words.map((word, i) => (
                  <span key={i} className="px-2.5 py-1 bg-primary/10 rounded text-xs">
                    {word}
                  </span>
                ))}
              </div>
            </Card>
            <Card className="border border-destructive/10">
              <SubsectionTitle>Palavras Proibidas</SubsectionTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {brand_codes.verbal.forbidden_words.map((word, i) => (
                  <span key={i} className="px-2.5 py-1 bg-destructive/10 rounded text-xs line-through">
                    {word}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 04 — Editorial Directions (only for Completo mode) */}
      {hasDirections && (
        <section className="space-y-8 page-break-after">
          <SectionTitle number="04">Direções Editoriais</SectionTitle>
          
          <div className="space-y-6">
            {editorial_directions.map((direction, i) => (
              <Card key={i} className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {direction.type === "signature" && "Assinatura"}
                    {direction.type === "aspirational" && "Aspiracional"}
                    {direction.type === "conversion" && "Conversão"}
                  </span>
                  <h4 className="text-lg font-medium">{direction.title}</h4>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Mood Visual:</span>
                    <p className="mt-1 leading-relaxed">{direction.visual_mood}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Composição:</span>
                    <p className="mt-1 leading-relaxed">{direction.composition}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Styling / Ambiente:</span>
                    <p className="mt-1 leading-relaxed">{direction.styling_environment}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contexto de Uso:</span>
                    <p className="mt-1 leading-relaxed">{direction.usage_context}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Editorial Example (section number adjusts based on mode) */}
      <section className="space-y-6 page-break-after">
        <SectionTitle number={hasDirections ? "05" : "04"}>Aplicação Editorial — Exemplo</SectionTitle>
        
        <Card className="bg-muted/50 border border-border/50">
          <h4 className="text-lg font-medium mb-4">{editorial_example.title}</h4>
          <p className="text-base leading-relaxed text-muted-foreground">
            {editorial_example.description}
          </p>
        </Card>
      </section>

      {/* Commerce Section - O Edit */}
      {commerce && (
        <section className="space-y-6 page-break-after">
          <SectionTitle number={commerceSectionNumber}>O Edit — por onde começar</SectionTitle>
          <EditorialCommerceSection commerce={commerce as CommerceData} delay={0} />
        </section>
      )}

      {/* Editorial Closing */}
      <section className="py-10 text-center max-w-xl mx-auto">
        <div className="w-16 h-px bg-border mx-auto mb-8" />
        <p className="text-base leading-relaxed italic text-muted-foreground">
          {editorial_closing}
        </p>
        <div className="w-16 h-px bg-border mx-auto mt-8" />
      </section>
    </div>
  );
}

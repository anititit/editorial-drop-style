import { forwardRef } from "react";
import { ProEditorialResult } from "@/lib/pro-types";

interface ProPDFExportLayoutProps {
  result: ProEditorialResult;
  showOptionalLayer?: boolean;
}

export const ProPDFExportLayout = forwardRef<HTMLDivElement, ProPDFExportLayoutProps>(
  ({ result, showOptionalLayer = false }, ref) => {
    const { persona, positioning, brand_codes, editorial_directions, editorial_example, editorial_closing, commerce } = result;
    const hasDirections = editorial_directions && editorial_directions.length > 0;

    return (
      <div
        ref={ref}
        className="pdf-export-container bg-[#FAFAF8] text-foreground"
        style={{ width: "794px", fontFamily: "system-ui, sans-serif" }}
      >
        {/* PAGE 1: Direction */}
        <div className="pdf-page p-12" style={{ minHeight: "1123px", pageBreakAfter: "always" }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">DROP Pro</span>
            <span className="text-xs text-muted-foreground">Brand Editorial Kit</span>
          </div>

          {/* Positioning as Headline */}
          <div className="text-center mb-16">
            <h1 className="text-3xl font-light tracking-tight mb-8 leading-tight max-w-lg mx-auto">
              {positioning}
            </h1>
          </div>

          {/* Persona Compact */}
          <div className="max-w-lg mx-auto mb-12">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Arquétipo</span>
                <span className="font-medium">{persona.archetype}</span>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Cidade Mental</span>
                <span className="font-medium">{persona.mental_city}</span>
              </div>
            </div>
          </div>

          {/* Palette + Visual Codes */}
          <div className="max-w-lg mx-auto">
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-6">
              Códigos Visuais
            </h2>
            
            {/* Palette */}
            <div className="flex justify-center gap-2 mb-6">
              {brand_codes.visual.palette.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 rounded-lg shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[9px] text-muted-foreground font-mono">{color}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Contraste</span>
                <span>{brand_codes.visual.contrast}</span>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Texturas</span>
                <span>{brand_codes.visual.textures.slice(0, 2).join(" · ")}</span>
              </div>
            </div>
          </div>

          {/* Reassurance */}
          <div className="mt-auto pt-24 text-center">
            <p className="text-xs text-muted-foreground/60 italic">
              Não precisa estar claro. O DROP edita referências soltas em direção.
            </p>
          </div>
        </div>

        {/* PAGE 2: The Edit (Actionable) */}
        <div className="pdf-page p-12" style={{ minHeight: "1123px", pageBreakAfter: "always" }}>
          <h2 className="text-2xl font-light tracking-tight mb-10">
            O Edit — por onde começar
          </h2>

          {/* Shortlist */}
          {commerce?.shortlist && (
            <div className="mb-10">
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                The Shortlist
              </h3>
              <div className="space-y-3">
                {commerce.shortlist.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-baseline gap-4 text-sm">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground w-20 flex-shrink-0">
                      {item.category}
                    </span>
                    <span className="font-medium flex-1">{item.item_name}</span>
                    <span className="text-xs text-muted-foreground">{item.price_lane}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Se você só fizer isso */}
          <div className="mb-10 p-6 bg-muted/30 rounded-lg">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Se você só fizer isso
            </h3>
            <ul className="space-y-2">
              {commerce?.look_recipes?.slice(0, 3).map((recipe, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">→</span>
                  <span>{recipe.formula}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Verbal Codes Compact */}
          <div className="mb-10">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Tom de Voz
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs mb-1">Tom</span>
                <p>{brand_codes.verbal.tone}</p>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mb-1">Ritmo</span>
                <p>{brand_codes.verbal.rhythm}</p>
              </div>
            </div>
          </div>

          {/* Search Terms */}
          {commerce?.search_terms && (
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Termos para buscar
              </h3>
              <div className="flex flex-wrap gap-2">
                {commerce.search_terms.map((term, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-muted/50 rounded-full text-xs"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PAGE 3: Optional Layer (Editorial Directions) */}
        {showOptionalLayer && hasDirections && (
          <div className="pdf-page p-12" style={{ minHeight: "1123px", pageBreakAfter: "always" }}>
            <h2 className="text-2xl font-light tracking-tight mb-10">
              Direções Editoriais
            </h2>

            <div className="space-y-6">
              {editorial_directions.map((direction, i) => (
                <div key={i} className="p-5 bg-muted/30 rounded-lg">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {direction.type === "signature" && "Assinatura"}
                      {direction.type === "aspirational" && "Aspiracional"}
                      {direction.type === "conversion" && "Conversão"}
                    </span>
                    <span className="font-medium">{direction.title}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Mood Visual</span>
                      <p className="mt-1">{direction.visual_mood}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Composição</span>
                      <p className="mt-1">{direction.composition}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Editorial Example */}
            <div className="mt-10 p-6 border border-border/50 rounded-lg">
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Aplicação
              </h3>
              <p className="font-medium mb-2">{editorial_example.title}</p>
              <p className="text-sm text-muted-foreground">{editorial_example.description}</p>
            </div>
          </div>
        )}

        {/* PAGE 4: Closing Note */}
        <div className="pdf-page p-12 flex flex-col" style={{ minHeight: "1123px" }}>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-px bg-border mx-auto mb-10" />
              <p className="text-lg font-light leading-relaxed italic text-muted-foreground">
                {editorial_closing}
              </p>
              <div className="w-16 h-px bg-border mx-auto mt-10" />
            </div>
          </div>

          {/* Quote */}
          <div className="text-center mb-12">
            <p className="text-sm text-muted-foreground/70 italic">
              "{persona.would_say}"
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-8">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              DROP Pro
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ProPDFExportLayout.displayName = "ProPDFExportLayout";

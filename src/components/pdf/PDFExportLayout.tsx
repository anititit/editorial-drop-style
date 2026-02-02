import { forwardRef } from "react";
import { EditorialResult, AESTHETIC_NAMES } from "@/lib/types";

interface PDFExportLayoutProps {
  result: EditorialResult;
  showOptionalLayer?: boolean;
}

export const PDFExportLayout = forwardRef<HTMLDivElement, PDFExportLayoutProps>(
  ({ result, showOptionalLayer = false }, ref) => {
    const { profile, editorial } = result;
    const primaryName = AESTHETIC_NAMES[profile.aesthetic_primary] || profile.aesthetic_primary;

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
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">DROP</span>
            <span className="text-xs text-muted-foreground">Leitura Estética</span>
          </div>

          {/* Editorial Headline */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-light tracking-tight mb-6 leading-tight">
              {editorial.headline}
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              {editorial.dek}
            </p>
          </div>

          {/* Palette */}
          <div className="flex justify-center gap-3 mb-16">
            {profile.palette_hex.map((color, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-lg shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Visual Codes - Compact */}
          <div className="max-w-md mx-auto">
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-6">
              Códigos Visuais
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Contraste</span>
                <span className="capitalize">{profile.contrast}</span>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Texturas</span>
                <span>{profile.textures.slice(0, 2).join(" · ")}</span>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Silhuetas</span>
                <span>{profile.silhouettes.slice(0, 2).join(" · ")}</span>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Acabamento</span>
                <span>{profile.makeup_finish}</span>
              </div>
            </div>
          </div>

          {/* Reassurance Copy */}
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
          {editorial.commerce?.shortlist && (
            <div className="mb-10">
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                The Shortlist
              </h3>
              <div className="space-y-3">
                {editorial.commerce.shortlist.slice(0, 5).map((item, i) => (
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

          {/* Se você só fizer isso - 3 bullets from look recipes */}
          <div className="mb-10 p-6 bg-muted/30 rounded-lg">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Se você só fizer isso
            </h3>
            <ul className="space-y-2">
              {editorial.commerce?.look_recipes?.slice(0, 3).map((recipe, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">→</span>
                  <span>{recipe.formula}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Beauty + Fragrance by Price Lane */}
          <div className="grid grid-cols-2 gap-8">
            {/* Makeup Compact */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Make Essencial
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Olhos:</span>{" "}
                  {editorial.makeup_day.eyes}
                </div>
                <div>
                  <span className="text-muted-foreground">Lábios:</span>{" "}
                  {editorial.makeup_day.lips}
                </div>
              </div>
            </div>

            {/* Fragrance by Lane */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Fragrâncias
              </h3>
              <div className="space-y-2 text-sm">
                {editorial.fragrances.map((f, i) => (
                  <div key={i} className="flex items-baseline gap-2">
                    <span className="text-xs text-muted-foreground uppercase w-16 flex-shrink-0">
                      {f.price_tier === "affordable" ? "Acessível" : 
                       f.price_tier === "mid" ? "Médio" : "Premium"}
                    </span>
                    <span>{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Search Terms */}
          {editorial.commerce?.search_terms && (
            <div className="mt-10">
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Termos para buscar
              </h3>
              <div className="flex flex-wrap gap-2">
                {editorial.commerce.search_terms.map((term, i) => (
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

        {/* PAGE 3: Optional Layer (only if showOptionalLayer) */}
        {showOptionalLayer && (
          <div className="pdf-page p-12" style={{ minHeight: "1123px", pageBreakAfter: "always" }}>
            <h2 className="text-2xl font-light tracking-tight mb-10">
              Edições Conceituais
            </h2>

            {/* Look Recipes Full */}
            <div className="mb-12">
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
                Receitas de Look
              </h3>
              <div className="space-y-6">
                {editorial.looks.map((look, i) => (
                  <div key={i} className="p-5 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">
                        {look.title}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <p className="font-medium mb-2">{look.hero_piece}</p>
                    <p className="text-sm text-muted-foreground">
                      {look.supporting.join(" + ")}
                    </p>
                    <p className="text-xs italic text-muted-foreground mt-3">
                      "{look.caption}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Makeup Full */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Make Dia
                </h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Base:</span> {editorial.makeup_day.base}</div>
                  <div><span className="text-muted-foreground">Bochechas:</span> {editorial.makeup_day.cheeks}</div>
                  <div><span className="text-muted-foreground">Olhos:</span> {editorial.makeup_day.eyes}</div>
                  <div><span className="text-muted-foreground">Lábios:</span> {editorial.makeup_day.lips}</div>
                </div>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Make Noite
                </h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Base:</span> {editorial.makeup_night.base}</div>
                  <div><span className="text-muted-foreground">Bochechas:</span> {editorial.makeup_night.cheeks}</div>
                  <div><span className="text-muted-foreground">Olhos:</span> {editorial.makeup_night.eyes}</div>
                  <div><span className="text-muted-foreground">Lábios:</span> {editorial.makeup_night.lips}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 4: Closing Note */}
        <div className="pdf-page p-12 flex flex-col" style={{ minHeight: "1123px" }}>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-px bg-border mx-auto mb-10" />
              <p className="text-lg font-light leading-relaxed italic text-muted-foreground">
                {editorial.footer_note || `${primaryName}. Direção clara. Agora é só editar.`}
              </p>
              <div className="w-16 h-px bg-border mx-auto mt-10" />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              DROP
            </span>
          </div>
        </div>
      </div>
    );
  }
);

PDFExportLayout.displayName = "PDFExportLayout";

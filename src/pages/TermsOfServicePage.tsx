import { useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

const content = {
  "pt-BR": {
    title: "Termos de Uso",
    lastUpdated: "Última atualização: Fevereiro de 2025",
    backLink: "/",
    backText: "Voltar",
    sections: [
      {
        title: "1. Aceitação dos Termos",
        content: `Ao acessar e usar a DROP Edit ("plataforma", "serviço"), você concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nosso serviço.`
      },
      {
        title: "2. Descrição do Serviço",
        content: `A DROP Edit é uma ferramenta gratuita de inteligência artificial que gera leituras estéticas editoriais personalizadas com base em imagens de referência fornecidas pelo usuário. O serviço utiliza IA para analisar referências visuais e criar recomendações de estilo no formato de revista de moda.`
      },
      {
        title: "3. Uso do Serviço",
        content: `**Elegibilidade:** Você deve ter pelo menos 18 anos para usar este serviço.

**Imagens enviadas:** Você é responsável por garantir que possui os direitos necessários sobre as imagens que envia. As imagens devem ser referências de moda, editoriais, produtos ou texturas — não aceitamos:
• Selfies ou fotos pessoais
• Conteúdo sexual, nudez ou material adulto
• Imagens de menores de idade
• Conteúdo ilegal ou ofensivo

**Propriedade:** Você mantém todos os direitos sobre as imagens que envia. Nós não armazenamos suas imagens — elas são processadas temporariamente e imediatamente descartadas.`
      },
      {
        title: "4. Limitações do Serviço",
        content: `**Sem garantias:** O serviço é fornecido "como está" e "conforme disponível". Não garantimos que:
• Os resultados da IA sejam precisos, completos ou adequados a qualquer propósito específico
• O serviço estará sempre disponível ou livre de erros
• Os resultados atenderão suas expectativas ou necessidades

**Natureza experimental:** A DROP Edit utiliza inteligência artificial experimental. Os resultados são sugestões criativas e não devem ser considerados consultoria profissional de moda ou estilo.`
      },
      {
        title: "5. Usos Proibidos",
        content: `Você concorda em não usar o serviço para:
• Enviar conteúdo ilegal, ofensivo, difamatório ou que viole direitos de terceiros
• Tentar burlar sistemas de segurança ou moderação de conteúdo
• Usar os resultados para fins de assédio, discriminação ou atividades ilegais
• Sobrecarregar intencionalmente nossos sistemas ou realizar ataques técnicos
• Revender, licenciar ou comercializar o acesso ao serviço
• Coletar dados de outros usuários sem autorização`
      },
      {
        title: "6. Propriedade Intelectual",
        content: `**Nossa propriedade:** A plataforma DROP Edit, incluindo design, código, marca e conteúdo editorial, são de nossa propriedade ou licenciados para nós.

**Resultados gerados:** Os textos e recomendações gerados pela IA são criados especificamente para você e podem ser usados livremente para fins pessoais ou comerciais, sem atribuição obrigatória.`
      },
      {
        title: "7. Limitação de Responsabilidade",
        content: `Na máxima extensão permitida por lei, a DROP Edit não será responsável por:
• Danos indiretos, incidentais ou consequenciais
• Perda de dados, lucros ou oportunidades de negócio
• Decisões tomadas com base nos resultados da IA
• Interrupções ou indisponibilidade do serviço

Você concorda em usar o serviço por sua conta e risco.`
      },
      {
        title: "8. Modificações",
        content: `Reservamo-nos o direito de:
• Modificar, suspender ou descontinuar o serviço a qualquer momento
• Alterar estes Termos de Uso mediante aviso na plataforma
• Recusar acesso a usuários que violem estes termos

O uso continuado após alterações constitui aceitação dos novos termos.`
      },
      {
        title: "9. Lei Aplicável",
        content: `Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida nos foros da cidade de São Paulo, SP.`
      },
      {
        title: "10. Contato",
        content: `Para dúvidas sobre estes Termos de Uso:

**E-mail:** contato@dropedit.com.br`
      }
    ]
  },
  en: {
    title: "Terms of Service",
    lastUpdated: "Last updated: February 2025",
    backLink: "/global",
    backText: "Back",
    sections: [
      {
        title: "1. Acceptance of Terms",
        content: `By accessing and using DROP Edit ("platform", "service"), you agree to comply with these Terms of Service. If you do not agree with any part of these terms, you should not use our service.`
      },
      {
        title: "2. Service Description",
        content: `DROP Edit is a free artificial intelligence tool that generates personalized editorial style readings based on reference images provided by the user. The service uses AI to analyze visual references and create style recommendations in fashion magazine format.`
      },
      {
        title: "3. Use of Service",
        content: `**Eligibility:** You must be at least 18 years old to use this service.

**Uploaded images:** You are responsible for ensuring you have the necessary rights to the images you upload. Images must be fashion references, editorials, products, or textures — we do not accept:
• Selfies or personal photos
• Sexual content, nudity, or adult material
• Images of minors
• Illegal or offensive content

**Ownership:** You retain all rights to the images you upload. We do not store your images — they are temporarily processed and immediately discarded.`
      },
      {
        title: "4. Service Limitations",
        content: `**No warranties:** The service is provided "as is" and "as available". We do not guarantee that:
• AI results are accurate, complete, or suitable for any specific purpose
• The service will always be available or error-free
• Results will meet your expectations or needs

**Experimental nature:** DROP Edit uses experimental artificial intelligence. Results are creative suggestions and should not be considered professional fashion or style advice.`
      },
      {
        title: "5. Prohibited Uses",
        content: `You agree not to use the service to:
• Submit illegal, offensive, defamatory content or content that violates third-party rights
• Attempt to bypass security or content moderation systems
• Use results for harassment, discrimination, or illegal activities
• Intentionally overload our systems or conduct technical attacks
• Resell, license, or commercialize access to the service
• Collect data from other users without authorization`
      },
      {
        title: "6. Intellectual Property",
        content: `**Our property:** The DROP Edit platform, including design, code, brand, and editorial content, are our property or licensed to us.

**Generated results:** Texts and recommendations generated by AI are created specifically for you and may be freely used for personal or commercial purposes, without mandatory attribution.`
      },
      {
        title: "7. Limitation of Liability",
        content: `To the maximum extent permitted by law, DROP Edit shall not be liable for:
• Indirect, incidental, or consequential damages
• Loss of data, profits, or business opportunities
• Decisions made based on AI results
• Service interruptions or unavailability

You agree to use the service at your own risk.`
      },
      {
        title: "8. Modifications",
        content: `We reserve the right to:
• Modify, suspend, or discontinue the service at any time
• Change these Terms of Service with notice on the platform
• Deny access to users who violate these terms

Continued use after changes constitutes acceptance of the new terms.`
      },
      {
        title: "9. Applicable Law",
        content: `These Terms are governed by the laws of the Federative Republic of Brazil. Any dispute shall be resolved in the courts of the city of São Paulo, SP, Brazil.`
      },
      {
        title: "10. Contact",
        content: `For questions about these Terms of Service:

**Email:** contato@dropedit.com.br`
      }
    ]
  }
};

function parseMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    // Bold text
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-medium text-foreground">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    
    // Bullet points
    if (line.startsWith('• ')) {
      return <li key={i} className="ml-4">{rendered}</li>;
    }
    
    return <p key={i} className={line === '' ? 'h-4' : ''}>{rendered}</p>;
  });
}

export default function TermsOfServicePage() {
  const location = useLocation();
  const isGlobalRoute = location.pathname.startsWith("/global");
  const locale = isGlobalRoute ? "en" : "pt-BR";
  const t = content[locale];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          <Link 
            to={t.backLink}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backText}
          </Link>

          <header className="mb-12">
            <h1 className="editorial-headline text-3xl md:text-4xl mb-3">
              {t.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t.lastUpdated}
            </p>
          </header>

          <div className="space-y-8">
            {t.sections.map((section, index) => (
              <section key={index} className="space-y-3">
                <h2 className="font-serif text-lg font-medium text-foreground">
                  {section.title}
                </h2>
                <div className="editorial-body text-sm text-muted-foreground leading-relaxed space-y-2">
                  {parseMarkdown(section.content)}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
      
      <Footer locale={locale} />
    </div>
  );
}

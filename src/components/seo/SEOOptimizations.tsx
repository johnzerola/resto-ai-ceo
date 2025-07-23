import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOOptimizationsProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const defaultKeywords = [
  'CMV restaurante',
  'controle de custos restaurante',
  'gestão restaurante',
  'sistema restaurante',
  'controle estoque restaurante',
  'custo mercadoria vendida',
  'lucratividade restaurante',
  'precificação pratos',
  'cardápio digital',
  'gestão financeira restaurante',
  'DRE restaurante',
  'fluxo de caixa restaurante',
  'receitas culinárias',
  'ingredientes restaurante',
  'delivery restaurante',
  'ifood gestão',
  'margem lucro restaurante',
  'despesas restaurante',
  'inventário restaurante',
  'análise financeira gastronômica'
].join(', ');

const baseUrl = 'https://restaurantecmv.com';

export function SEOOptimizations({
  title = 'RestauranteCMV - Sistema Completo de Gestão e Controle de CMV para Restaurantes',
  description = 'Sistema profissional para controle de CMV, gestão de estoque, análise financeira e precificação de pratos. Aumente a lucratividade do seu restaurante com relatórios inteligentes e controle preciso de custos.',
  keywords = defaultKeywords,
  canonical,
  ogImage = `${baseUrl}/og-image.jpg`,
  noIndex = false
}: SEOOptimizationsProps) {
  return (
    <Helmet>
      {/* Título da página */}
      <title>{title}</title>
      
      {/* Meta tags básicas */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="RestauranteCMV" />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical || baseUrl} />
      <meta property="og:site_name" content="RestauranteCMV" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@restaurantecmv" />
      
      {/* Viewport e responsividade */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Meta tags para performance */}
      <meta name="theme-color" content="#059669" />
      <meta name="msapplication-TileColor" content="#059669" />
      
      {/* Schema.org JSON-LD para melhor SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "RestauranteCMV",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": description,
          "url": baseUrl,
          "developer": {
            "@type": "Organization",
            "name": "RestauranteCMV",
            "url": baseUrl
          },
          "offers": {
            "@type": "Offer",
            "price": "97.00",
            "priceCurrency": "BRL",
            "priceValidUntil": "2025-12-31",
            "availability": "https://schema.org/InStock",
            "url": `${baseUrl}/assinatura`
          },
          "featureList": [
            "Controle de CMV",
            "Gestão de Estoque", 
            "Análise Financeira",
            "Precificação de Pratos",
            "Relatórios de Lucratividade",
            "DRE Automático",
            "Controle de Despesas",
            "Gestão de Receitas"
          ],
          "screenshot": ogImage,
          "softwareVersion": "1.0",
          "releaseNotes": "Sistema completo de gestão para restaurantes"
        })}
      </script>
      
      {/* Schema para organização */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "RestauranteCMV",
          "url": baseUrl,
          "logo": `${baseUrl}/logo.png`,
          "description": "Plataforma especializada em gestão e controle de CMV para restaurantes",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "email": "contato@restaurantecmv.com",
            "availableLanguage": "Portuguese"
          },
          "sameAs": [
            "https://instagram.com/restaurantecmv",
            "https://facebook.com/restaurantecmv",
            "https://linkedin.com/company/restaurantecmv"
          ]
        })}
      </script>
      
      {/* Preconnect para performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS prefetch para recursos externos */}
      <link rel="dns-prefetch" href="//google-analytics.com" />
      <link rel="dns-prefetch" href="//googletagmanager.com" />
      
      {/* Meta tags para controle de cache */}
      <meta httpEquiv="Cache-Control" content="public, max-age=31536000" />
      
      {/* Dados estruturados para FAQ (se aplicável) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "O que é CMV em restaurantes?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "CMV (Custo da Mercadoria Vendida) é o valor total gasto com ingredientes para produzir os pratos vendidos. É fundamental para calcular a lucratividade real de cada item do cardápio."
              }
            },
            {
              "@type": "Question", 
              "name": "Como controlar o CMV do meu restaurante?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Para controlar o CMV, é necessário monitorar preços de ingredientes, controlar desperdícios, fazer inventário regular e precificar pratos corretamente. Nosso sistema automatiza esses processos."
              }
            },
            {
              "@type": "Question",
              "name": "Qual a diferença entre os planos?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "O plano Básico inclui controle de CMV e estoque para até 2 restaurantes. O Profissional oferece recursos ilimitados, relatórios avançados e integração com delivery."
              }
            }
          ]
        })}
      </script>
    </Helmet>
  );
}
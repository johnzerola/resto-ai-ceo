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
  'como precificar pratos restaurante',
  'como lucrar restaurante',
  'restaurante parar de dar prejuízo',
  'como calcular preço prato restaurante',
  'aumentar lucro restaurante',
  'reduzir custos restaurante',
  'controle financeiro restaurante',
  'CMV restaurante',
  'controle de custos restaurante',
  'gestão restaurante lucrativa',
  'sistema gestão restaurante',
  'precificação correta restaurante',
  'margem lucro ideal restaurante',
  'como não ter prejuízo restaurante',
  'controle estoque restaurante',
  'custo mercadoria vendida',
  'lucratividade restaurante dicas',
  'precificar cardápio restaurante',
  'cardápio rentável',
  'gestão financeira restaurante',
  'DRE restaurante como fazer',
  'fluxo de caixa restaurante',
  'receitas culinárias rentáveis',
  'ingredientes custo benefício',
  'delivery lucrativo',
  'ifood margem lucro',
  'despesas restaurante controle',
  'inventário restaurante eficiente',
  'análise financeira gastronômica',
  'restaurante dar lucro',
  'negócio restaurante rentável',
  'como salvar restaurante falência'
].join(', ');

const baseUrl = 'https://restaurantecmv.com';

export function SEOOptimizations({
  title = 'Como Precificar Pratos e Lucrar no Restaurante - RestauranteCMV',
  description = 'Descubra como precificar corretamente seus pratos, aumentar a lucratividade e fazer seu restaurante parar de dar prejuízo. Sistema completo de controle de CMV, gestão financeira e precificação inteligente para restaurantes.',
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
              "name": "Como precificar pratos do restaurante corretamente?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Para precificar corretamente, calcule o CMV (custo dos ingredientes), adicione custos fixos e variáveis, defina a margem de lucro desejada. Use a fórmula: Preço = (CMV + Custos) ÷ (1 - Margem de Lucro %)."
              }
            },
            {
              "@type": "Question",
              "name": "Como fazer meu restaurante parar de dar prejuízo?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Controle rigorosamente o CMV, monitore despesas, precifique corretamente os pratos, reduza desperdícios, analise a lucratividade de cada item do cardápio e mantenha um fluxo de caixa organizado."
              }
            },
            {
              "@type": "Question", 
              "name": "Como aumentar a lucratividade do restaurante?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Otimize a precificação, controle o CMV, elimite pratos pouco lucrativos, negocie com fornecedores, reduza desperdícios e use dados para tomar decisões financeiras inteligentes."
              }
            },
            {
              "@type": "Question",
              "name": "O que é CMV e como calcular?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "CMV (Custo da Mercadoria Vendida) é o valor gasto com ingredientes para produzir os pratos. Calcule: CMV = Estoque Inicial + Compras - Estoque Final. É essencial para precificação correta."
              }
            },
            {
              "@type": "Question",
              "name": "Como controlar custos no restaurante?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Monitore preços de ingredientes, controle porções, reduza desperdícios, negocie com fornecedores, faça inventário regular e use um sistema de gestão para acompanhar todos os custos em tempo real."
              }
            }
          ]
        })}
      </script>
      
      {/* Schema adicional para How-To sobre precificação */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "Como Precificar Pratos de Restaurante",
          "description": "Guia completo para precificar corretamente os pratos do seu restaurante e aumentar a lucratividade",
          "image": ogImage,
          "step": [
            {
              "@type": "HowToStep",
              "name": "Calcular o CMV",
              "text": "Some todos os custos dos ingredientes necessários para produzir o prato"
            },
            {
              "@type": "HowToStep", 
              "name": "Adicionar custos fixos",
              "text": "Inclua uma porcentagem dos custos fixos (aluguel, funcionários, energia) no preço"
            },
            {
              "@type": "HowToStep",
              "name": "Definir margem de lucro",
              "text": "Estabeleça a margem de lucro desejada (normalmente entre 200% a 400% sobre o CMV)"
            },
            {
              "@type": "HowToStep",
              "name": "Calcular preço final",
              "text": "Use a fórmula: Preço = (CMV + Custos Fixos) ÷ (1 - Margem %)"
            }
          ]
        })}
      </script>
    </Helmet>
  );
}
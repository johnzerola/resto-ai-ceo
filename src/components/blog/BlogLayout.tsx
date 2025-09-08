import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  PieChart, 
  Clock, 
  ArrowRight,
  Star,
  Eye,
  Calendar
} from "lucide-react";
import { SEOOptimizations } from "@/components/seo/SEOOptimizations";

export function BlogLayout() {
  const featuredArticles = [
    {
      id: "como-precificar-pratos-restaurante",
      title: "Como Precificar Pratos de Restaurante: Guia Completo 2024",
      excerpt: "Aprenda como calcular o preço ideal dos seus pratos para maximizar lucro sem perder clientes. Método científico comprovado.",
      image: "/blog/precificacao-restaurante.jpg",
      category: "Precificação",
      readTime: "12 min",
      views: "15.4k",
      publishDate: "2024-01-15",
      tags: ["precificar", "preço", "cmv", "lucro"],
      featured: true
    },
    {
      id: "como-calcular-cmv-restaurante",
      title: "Como Calcular CMV de Restaurante: Fórmula + Planilha Grátis",
      excerpt: "Descubra como calcular o CMV correto do seu restaurante e reduza custos em até 30%. Inclui planilha gratuita.",
      image: "/blog/cmv-restaurante.jpg",
      category: "Controle de Custos",
      readTime: "8 min",
      views: "12.2k",
      publishDate: "2024-01-10",
      tags: ["cmv", "custos", "calculadora", "planilha"]
    },
    {
      id: "como-aumentar-lucro-restaurante",
      title: "15 Estratégias Para Aumentar o Lucro do Restaurante em 2024",
      excerpt: "Métodos comprovados que aumentaram o lucro de mais de 200 restaurantes em até 40% em 30 dias.",
      image: "/blog/aumentar-lucro.jpg",
      category: "Gestão",
      readTime: "15 min",
      views: "18.7k",
      publishDate: "2024-01-08",
      tags: ["lucro", "estratégias", "gestão", "vendas"]
    },
    {
      id: "restaurante-dando-prejuizo",
      title: "Meu Restaurante Está Dando Prejuízo: O Que Fazer?",
      excerpt: "Guia completo para reverter prejuízos no seu restaurante. Cases reais de recuperação e volta à lucratividade.",
      image: "/blog/prejuizo-restaurante.jpg",
      category: "Recuperação",
      readTime: "10 min",
      views: "9.8k",
      publishDate: "2024-01-05",
      tags: ["prejuízo", "recuperação", "gestão", "custos"]
    }
  ];

  const allArticles = [
    ...featuredArticles,
    {
      id: "controle-financeiro-restaurante",
      title: "Controle Financeiro Para Restaurantes: Guia Definitivo",
      excerpt: "Sistema completo de controle financeiro específico para food service. Templates e ferramentas inclusos.",
      category: "Finanças",
      readTime: "12 min",
      views: "8.5k",
      publishDate: "2024-01-03",
      tags: ["controle financeiro", "dre", "fluxo de caixa"]
    },
    {
      id: "dre-restaurante",
      title: "DRE Para Restaurantes: Como Fazer e Interpretar",
      excerpt: "Aprenda a fazer DRE específico para restaurantes e use os dados para aumentar sua lucratividade.",
      category: "Contabilidade",
      readTime: "9 min",
      views: "7.1k",
      publishDate: "2024-01-01",
      tags: ["dre", "contabilidade", "resultado", "lucro"]
    },
    {
      id: "gestao-restaurante",
      title: "Gestão de Restaurante: Ferramentas e Metodologias",
      excerpt: "Ferramentas essenciais e metodologias comprovadas para uma gestão eficiente de restaurantes.",
      category: "Gestão",
      readTime: "11 min",
      views: "6.8k",
      publishDate: "2023-12-28",
      tags: ["gestão", "ferramentas", "metodologia", "eficiência"]
    },
    {
      id: "planilha-controle-estoque",
      title: "Planilha de Controle de Estoque Para Restaurante [Grátis]",
      excerpt: "Planilha gratuita completa para controle de estoque com alertas automáticos e relatórios.",
      category: "Estoque",
      readTime: "6 min",
      views: "11.3k",
      publishDate: "2023-12-25",
      tags: ["estoque", "planilha", "controle", "gratuito"]
    },
    {
      id: "software-gestao-restaurante",
      title: "Melhor Software de Gestão Para Restaurante 2024",
      excerpt: "Comparativo completo dos melhores softwares de gestão para restaurantes no Brasil.",
      category: "Tecnologia",
      readTime: "14 min",
      views: "5.9k",
      publishDate: "2023-12-20",
      tags: ["software", "sistema", "tecnologia", "gestão"]
    },
    {
      id: "margem-lucro-restaurante",
      title: "Qual a Margem de Lucro Ideal Para Restaurante?",
      excerpt: "Descubra qual é a margem de lucro ideal para cada tipo de restaurante e como alcançá-la.",
      category: "Lucratividade",
      readTime: "8 min",
      views: "9.2k",
      publishDate: "2023-12-15",
      tags: ["margem", "lucro", "rentabilidade", "benchmark"]
    }
  ];

  const categories = [
    { name: "Precificação", count: 8, color: "bg-blue-500" },
    { name: "Controle de Custos", count: 12, color: "bg-green-500" },
    { name: "Gestão", count: 15, color: "bg-purple-500" },
    { name: "Finanças", count: 9, color: "bg-orange-500" },
    { name: "Lucratividade", count: 6, color: "bg-red-500" },
    { name: "Tecnologia", count: 4, color: "bg-indigo-500" }
  ];

  return (
    <>
      <SEOOptimizations
        title="Blog Lucraí - Dicas Para Aumentar Lucro do Restaurante"
        description="Aprenda como precificar pratos, calcular CMV, aumentar lucro e evitar prejuízos no seu restaurante. Artigos escritos por especialistas em gestão de food service."
        keywords="blog restaurante, como precificar pratos, cmv restaurante, lucro restaurante, gestão restaurante, dicas food service"
        canonical="https://lucrai.com/blog"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-accent text-white py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Blog Lucraí
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Aprenda como <strong>precificar corretamente</strong>, <strong>aumentar o lucro</strong> e 
                <strong> evitar que seu restaurante dê prejuízo</strong> com dicas de especialistas
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Badge className="bg-white/20 text-white">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  +40% lucro médio
                </Badge>
                <Badge className="bg-white/20 text-white">
                  <DollarSign className="mr-2 h-4 w-4" />
                  200+ restaurantes ajudados
                </Badge>
                <Badge className="bg-white/20 text-white">
                  <Star className="mr-2 h-4 w-4" />
                  Métodos comprovados
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured Articles */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-8 flex items-center">
                  <TrendingUp className="mr-3 h-8 w-8 text-primary" />
                  Artigos em Destaque
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                        <div className="text-center">
                          <Calculator className="h-16 w-16 text-primary mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">{article.category}</p>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">{article.category}</Badge>
                          {article.featured && (
                            <Badge className="bg-destructive/10 text-destructive">Destaque</Badge>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-lg mb-3 line-clamp-2">
                          {article.title}
                        </h3>
                        
                        <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {article.readTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {article.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(article.publishDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {article.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button className="w-full group">
                          Ler Artigo Completo
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* All Articles */}
              <section>
                <h2 className="text-3xl font-bold mb-8">Todos os Artigos</h2>
                
                <div className="space-y-6">
                  {allArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <PieChart className="h-8 w-8 text-primary" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{article.category}</Badge>
                            </div>
                            
                            <h3 className="font-bold text-xl mb-2 hover:text-primary transition-colors cursor-pointer">
                              {article.title}
                            </h3>
                            
                            <p className="text-muted-foreground mb-3">
                              {article.excerpt}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {article.readTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {article.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(article.publishDate).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              
                              <Button variant="outline" size="sm" className="group">
                                Ler mais
                                <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Categories */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Categorias</h3>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <Badge variant="secondary">{category.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3">Newsletter Exclusiva</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Receba dicas semanais sobre como <strong>aumentar o lucro</strong> e <strong>evitar prejuízos</strong> no seu restaurante.
                  </p>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Seu melhor email"
                      className="w-full p-2 border rounded-lg text-sm"
                    />
                    <Button size="sm" className="w-full">
                      Quero Receber Dicas
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ✅ Sem spam • ✅ Descadastro fácil
                  </p>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Tags Populares</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "precificar", "cmv", "lucro", "prejuízo", "gestão", 
                      "custos", "margem", "dre", "estoque", "planilha",
                      "software", "controle financeiro", "vendas"
                    ].map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
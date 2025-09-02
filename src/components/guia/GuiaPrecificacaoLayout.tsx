import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  DollarSign, 
  Calculator, 
  TrendingUp, 
  Target,
  CheckCircle,
  AlertTriangle,
  Download,
  Star,
  ArrowRight
} from "lucide-react";
import { SEOOptimizations } from "@/components/seo/SEOOptimizations";

export function GuiaPrecificacaoLayout() {
  const topicos = [
    {
      numero: "01",
      titulo: "Fundamentos da Precificação",
      descricao: "Entenda os conceitos básicos e a importância da precificação correta",
      icone: BookOpen,
      cor: "from-blue-500 to-blue-600"
    },
    {
      numero: "02", 
      titulo: "Calculando o CMV Corretamente",
      descricao: "Aprenda a calcular o Custo de Mercadoria Vendida de forma precisa",
      icone: Calculator,
      cor: "from-green-500 to-green-600"
    },
    {
      numero: "03",
      titulo: "Definindo Margem de Lucro Ideal",
      descricao: "Como estabelecer margens que garantem lucratividade sustentável",
      icone: TrendingUp,
      cor: "from-purple-500 to-purple-600"
    },
    {
      numero: "04",
      titulo: "Precificação Psicológica",
      descricao: "Técnicas para definir preços que os clientes aceitem pagar",
      icone: Target,
      cor: "from-orange-500 to-orange-600"
    },
    {
      numero: "05",
      titulo: "Análise da Concorrência",
      descricao: "Como pesquisar e posicionar seus preços no mercado",
      icone: Star,
      cor: "from-red-500 to-red-600"
    },
    {
      numero: "06",
      titulo: "Ajustes e Otimização",
      descricao: "Estratégias para ajustar preços e maximizar resultados",
      icone: ArrowRight,
      cor: "from-indigo-500 to-indigo-600"
    }
  ];

  const metodologias = [
    {
      nome: "Método Cost-Plus",
      descricao: "Soma dos custos + margem desejada",
      vantagens: ["Simples de calcular", "Garante margem mínima"],
      desvantagens: ["Ignora valor percebido", "Pode ser pouco competitivo"]
    },
    {
      nome: "Método Baseado em Valor",
      descricao: "Preço baseado no valor percebido pelo cliente",
      vantagens: ["Maximiza lucros", "Diferenciação no mercado"],
      desvantagens: ["Difícil de mensurar", "Requer pesquisa"]
    },
    {
      nome: "Método da Concorrência",
      descricao: "Preços baseados nos praticados pelos concorrentes",
      vantagens: ["Competitividade", "Referência de mercado"],
      desvantagens: ["Pode comprometer margem", "Guerra de preços"]
    }
  ];

  return (
    <>
      <SEOOptimizations
        title="Guia Completo: Como Precificar Pratos de Restaurante 2024"
        description="Aprenda como precificar pratos de restaurante corretamente. Guia completo com métodos, fórmulas e estratégias para aumentar lucro e evitar prejuízos."
        keywords="como precificar pratos restaurante, precificação restaurante, preço comida, calcular preço prato, margem lucro restaurante, cmv restaurante"
        canonical="https://lucrai.com/guia-completo-precificacao"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-accent text-white py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-white/20 text-white border-white/30">
                <BookOpen className="mr-2 h-4 w-4" />
                Guia Completo • 100% Gratuito
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Como Precificar Pratos de Restaurante
              </h1>
              
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                O guia definitivo para <strong>precificar corretamente</strong> seus pratos, 
                <strong> aumentar o lucro</strong> e <strong>evitar que seu restaurante dê prejuízo</strong>
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm mb-8">
                <Badge className="bg-white/20 text-white">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  6 Métodos Comprovados
                </Badge>
                <Badge className="bg-white/20 text-white">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculadoras Grátis
                </Badge>
                <Badge className="bg-white/20 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Templates Inclusos
                </Badge>
              </div>
              
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                <Download className="mr-2 h-5 w-5" />
                Baixar Guia Completo (PDF)
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12">
          {/* Introdução */}
          <section className="mb-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">
                Por Que a Precificação é Crucial Para Seu Restaurante?
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">85% dos Restaurantes</h3>
                    <p className="text-muted-foreground">Fecham por problemas de precificação e controle de custos inadequados</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">+40% de Lucro</h3>
                    <p className="text-muted-foreground">Aumento médio de lucro com precificação correta em 30 dias</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">R$ 15.000/mês</h3>
                    <p className="text-muted-foreground">Prejuízo médio por precificação incorreta em restaurantes médios</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-center">
                    🎯 O Que Você Vai Aprender Neste Guia
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span>Como calcular CMV corretamente</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span>6 métodos de precificação comprovados</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span>Como definir margem de lucro ideal</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span>Técnicas de precificação psicológica</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span>Análise de concorrência eficaz</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span>Estratégias de otimização contínua</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Tópicos do Guia */}
          <section className="mb-16">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Conteúdo Completo do Guia
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topicos.map((topico, index) => (
                  <Card key={index} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${topico.cor} rounded-lg flex items-center justify-center text-white font-bold`}>
                          {topico.numero}
                        </div>
                        <div className={`w-10 h-10 bg-gradient-to-r ${topico.cor} rounded-lg flex items-center justify-center`}>
                          <topico.icone className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2">{topico.titulo}</h3>
                      <p className="text-muted-foreground text-sm">{topico.descricao}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Metodologias */}
          <section className="mb-16">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                3 Principais Metodologias de Precificação
              </h2>
              
              <div className="grid lg:grid-cols-3 gap-6">
                {metodologias.map((metodo, index) => (
                  <Card key={index} className="h-full">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-3 text-primary">{metodo.nome}</h3>
                      <p className="text-muted-foreground mb-4">{metodo.descricao}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-600 mb-2">✅ Vantagens:</h4>
                          <ul className="space-y-1">
                            {metodo.vantagens.map((vantagem, i) => (
                              <li key={i} className="text-sm text-muted-foreground">• {vantagem}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-red-600 mb-2">❌ Desvantagens:</h4>
                          <ul className="space-y-1">
                            {metodo.desvantagens.map((desvantagem, i) => (
                              <li key={i} className="text-sm text-muted-foreground">• {desvantagem}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Final */}
          <section className="mb-16">
            <Card className="bg-gradient-to-r from-primary to-accent text-white">
              <CardContent className="p-12 text-center">
                <h2 className="text-4xl font-bold mb-6">
                  Pronto Para Transformar Seu Restaurante?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Baixe o guia completo e comece a <strong>precificar corretamente</strong> hoje mesmo. 
                  Inclui calculadoras, templates e estudos de caso reais.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 flex-1">
                    <Download className="mr-2 h-5 w-5" />
                    Baixar Guia Gratuito
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary flex-1">
                    <Calculator className="mr-2 h-5 w-5" />
                    Usar Calculadora CMV
                  </Button>
                </div>
                
                <div className="flex justify-center items-center gap-4 mt-6 text-sm opacity-80">
                  <span>✅ 100% Gratuito</span>
                  <span>✅ Download Imediato</span>
                  <span>✅ Sem Cadastro</span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Ferramentas Relacionadas */}
          <section>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Ferramentas Complementares</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">Calculadora de CMV</h3>
                    <p className="text-muted-foreground mb-4">
                      Calcule o custo de mercadoria vendida dos seus pratos gratuitamente
                    </p>
                    <Button className="w-full">
                      Usar Calculadora
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="h-12 w-12 text-accent mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">Blog de Gestão</h3>
                    <p className="text-muted-foreground mb-4">
                      Artigos semanais sobre como aumentar lucro e evitar prejuízos
                    </p>
                    <Button variant="outline" className="w-full">
                      Ler Artigos
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
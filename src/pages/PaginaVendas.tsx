import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ShieldCheck, Star, CircleDollarSign, Users, ArrowRight, Play, TrendingUp, BarChart3, Shield, Zap, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PaginaVendas = () => {
  const [planoPeriodo, setPlanoPeriodo] = useState<"mensal" | "anual">("mensal");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handlePlanoPeriodo = (value: string) => {
    setPlanoPeriodo(value as "mensal" | "anual");
  };
  
  // Preços e descontos
  const precoBasicoMensal = 39.90;
  const precoPremiumMensal = 79.90;
  const descontoAnual = 0.20; // 20% de desconto
  
  const precoBasicoAnual = precoBasicoMensal * 12 * (1 - descontoAnual);
  const precoPremiumAnual = precoPremiumMensal * 12 * (1 - descontoAnual);
  
  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
  };

  const handleTesteGratuito = async () => {
    if (!email) {
      toast.error("Por favor, insira seu email para começar o teste gratuito");
      return;
    }
    
    setIsLoading(true);
    // Simular criação de conta de teste
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Teste gratuito iniciado! Redirecionando...");
      navigate("/register", { state: { email, trial: true } });
    }, 2000);
  };

  const handleComprarPlano = (plano: "basico" | "premium") => {
    navigate("/register", { state: { plano, periodo: planoPeriodo } });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Cabeçalho fixo */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">
              <span className="text-primary">Resto</span>
              <span className="text-blue-600">AI</span> CEO
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" className="hidden sm:flex">Entrar</Button>
            </Link>
            <Link to="/login">
              <Button>Começar agora</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Otimizada */}
      <section className="relative bg-gradient-to-br from-blue-600 via-primary to-purple-700 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-white text-primary hover:bg-gray-100 text-sm px-4 py-2">
              🚀 Mais de 5.000 restaurantes já usam
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Aumente sua <span className="text-yellow-300">lucratividade</span><br />
              em até <span className="text-yellow-300">40%</span> com IA
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
              O único sistema que combina gestão financeira, controle de estoque e inteligência artificial 
              para maximizar os resultados do seu restaurante.
            </p>
            
            {/* CTA Principal */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto mb-8">
              <h3 className="text-white text-xl font-semibold mb-4">Teste GRÁTIS por 14 dias</h3>
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white text-gray-900"
                />
                <Button 
                  onClick={handleTesteGratuito}
                  disabled={isLoading}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 text-lg"
                >
                  {isLoading ? "Criando sua conta..." : "Começar teste gratuito"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <p className="text-white/80 text-sm mt-3">
                ✅ Sem compromisso • ✅ Acesso completo
              </p>
            </div>
          </div>
          
          {/* Prova Social */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 no Google</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>5.000+ restaurantes</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>40% mais lucro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios Principais */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Por que mais de 5.000 restaurantes escolheram o RestoAI CEO?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Resultados comprovados que você pode alcançar nos primeiros 30 dias
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Benefício 1 */}
            <Card className="border-2 border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-600">+40% Lucro</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Identifique os pratos mais lucrativos e otimize preços automaticamente
                </p>
                <Badge className="bg-green-100 text-green-800">Resultado médio em 30 dias</Badge>
              </CardContent>
            </Card>

            {/* Benefício 2 */}
            <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-blue-600">-15h/semana</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Automação completa de relatórios financeiros e controle de estoque
                </p>
                <Badge className="bg-blue-100 text-blue-800">Tempo economizado</Badge>
              </CardContent>
            </Card>

            {/* Benefício 3 */}
            <Card className="border-2 border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl text-purple-600">-25% Desperdício</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Controle inteligente de estoque com previsão de demanda por IA
                </p>
                <Badge className="bg-purple-100 text-purple-800">Redução garantida</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Funcionalidades Completas */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Tudo que você precisa em um só lugar</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sistema completo com mais de 50 funcionalidades para transformar a gestão do seu restaurante
            </p>
          </div>
          
          <Tabs defaultValue="financeiro" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="financeiro">💰 Financeiro</TabsTrigger>
              <TabsTrigger value="estoque">📦 Estoque</TabsTrigger>
              <TabsTrigger value="ia">🤖 IA</TabsTrigger>
              <TabsTrigger value="gestao">👥 Gestão</TabsTrigger>
            </TabsList>
            
            <TabsContent value="financeiro" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      DRE Automatizada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Demonstrativo de resultados em tempo real com análise de lucratividade por produto</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CircleDollarSign className="h-5 w-5" />
                      Fluxo de Caixa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Controle total de entradas e saídas com projeções automáticas</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="estoque" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Controle Inteligente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Previsão de demanda com IA para evitar rupturas e desperdícios</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Fichas Técnicas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Padronização de receitas com cálculo automático de custos</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="ia" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assistente IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Sugestões personalizadas para otimização de cardápio e preços</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Análise Preditiva</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Previsões de vendas e tendências do mercado</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="gestao" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Multi-usuários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Controle de acesso por perfil e gestão de equipes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Relatórios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Mais de 20 relatórios automáticos para tomada de decisão</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Histórias de sucesso reais</h2>
            <p className="text-xl text-gray-600">
              Veja como nossos clientes transformaram seus negócios
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Depoimento 1 */}
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-gray-600 mb-6">
                  "Em 3 meses aumentei minha margem de lucro em 35%. O sistema identificou produtos com precificação inadequada e me ajudou a otimizar o cardápio."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                    CS
                  </div>
                  <div>
                    <p className="font-semibold">Carlos Silva</p>
                    <p className="text-sm text-gray-500">Restaurante Sabor Único - São Paulo</p>
                    <p className="text-sm text-green-600 font-semibold">+35% lucro em 3 meses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Depoimento 2 */}
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-gray-600 mb-6">
                  "Economizo 20 horas por semana que antes gastava com planilhas. Agora posso focar no atendimento e na qualidade. Meu faturamento cresceu 50%."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                    AR
                  </div>
                  <div>
                    <p className="font-semibold">Ana Rodrigues</p>
                    <p className="text-sm text-gray-500">Café Aroma - Rio de Janeiro</p>
                    <p className="text-sm text-green-600 font-semibold">+50% faturamento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Depoimento 3 */}
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-gray-600 mb-6">
                  "A IA me surpreende todos os dias com insights precisos. Reduzi o desperdício em 30% e minha operação ficou muito mais eficiente."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                    MO
                  </div>
                  <div>
                    <p className="font-semibold">Marcelo Oliveira</p>
                    <p className="text-sm text-gray-500">Bistrô Mediterrâneo - Brasília</p>
                    <p className="text-sm text-green-600 font-semibold">-30% desperdício</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Planos e Preços Otimizados */}
      <section id="planos" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Escolha o plano que vai transformar seu restaurante
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Preços justos com ROI garantido. Se não aumentar sua lucratividade em 30 dias, devolvemos seu dinheiro.
            </p>
            
            <Tabs defaultValue="mensal" className="max-w-xs mx-auto" onValueChange={handlePlanoPeriodo}>
              <TabsList className="grid w-full grid-cols-2 bg-white">
                <TabsTrigger value="mensal">Mensal</TabsTrigger>
                <TabsTrigger value="anual" className="relative">
                  Anual
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-xs px-1">20% OFF</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Plano Básico */}
            <Card className="border-2 border-gray-200 shadow-lg relative overflow-hidden hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-2xl">Plano Essencial</CardTitle>
                <CardDescription className="text-lg">Perfeito para começar a transformação</CardDescription>
                <div className="mt-6">
                  <p className="text-4xl font-bold text-blue-600">
                    {planoPeriodo === "mensal" 
                      ? formatarPreco(precoBasicoMensal) 
                      : formatarPreco(precoBasicoAnual / 12)
                    }
                    <span className="text-lg font-normal text-gray-500">/mês</span>
                  </p>
                  {planoPeriodo === "anual" && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatarPreco(precoBasicoAnual)} cobrados anualmente
                    </p>
                  )}
                  <p className="text-sm text-green-600 font-semibold mt-2">
                    ROI médio: 300% em 6 meses
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong>Gestão Financeira Completa:</strong> DRE, Fluxo de Caixa, CMV</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong>Controle de Estoque:</strong> Até 500 produtos</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong>Fichas Técnicas:</strong> Padronização de receitas</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong>Relatórios Automáticos:</strong> 15+ relatórios</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong>Suporte por email:</strong> Resposta em até 24h</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleComprarPlano("basico")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                >
                  Começar agora - 14 dias grátis
                </Button>
              </CardFooter>
            </Card>
            
            {/* Plano Premium */}
            <Card className="border-2 border-primary shadow-xl relative overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-blue-600 text-white px-4 py-2 text-sm font-semibold">
                🔥 MAIS POPULAR
              </div>
              <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-50">
                <CardTitle className="text-2xl">Plano Profissional</CardTitle>
                <CardDescription className="text-lg">Para restaurantes que querem máxima performance</CardDescription>
                <div className="mt-6">
                  <p className="text-4xl font-bold text-primary">
                    {planoPeriodo === "mensal" 
                      ? formatarPreco(precoPremiumMensal) 
                      : formatarPreco(precoPremiumAnual / 12)
                    }
                    <span className="text-lg font-normal text-gray-500">/mês</span>
                  </p>
                  {planoPeriodo === "anual" && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatarPreco(precoPremiumAnual)} cobrados anualmente
                    </p>
                  )}
                  <p className="text-sm text-green-600 font-semibold mt-2">
                    ROI médio: 500% em 3 meses
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <Badge className="bg-primary/10 text-primary mb-4">Tudo do Essencial +</Badge>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong>Assistente IA Avançado:</strong> Insights personalizados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong>Produtos Ilimitados:</strong> Sem restrições</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong>Análise Preditiva:</strong> Previsão de vendas com IA</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong>Simulador de Cenários:</strong> Teste estratégias</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong>Suporte Prioritário 24/7:</strong> WhatsApp + telefone</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong>Consultor Especialista:</strong> 2h/mês de consultoria</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleComprarPlano("premium")}
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-3"
                >
                  Escolher Profissional - 14 dias grátis
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <Alert className="max-w-2xl mx-auto bg-green-50 border-green-200">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800">Garantia de Resultados</AlertTitle>
              <AlertDescription className="text-green-700">
                Se você não aumentar sua lucratividade em pelo menos 20% nos primeiros 30 dias, 
                devolvemos 100% do seu dinheiro. Sem perguntas, sem complicações.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Urgência e Escassez */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            ⚠️ OFERTA LIMITADA: Apenas para os próximos 50 restaurantes
          </h2>
          <p className="text-xl mb-8">
            Devido à alta demanda, estamos limitando novos cadastros para garantir 
            o melhor suporte e implementação. Não perca essa oportunidade!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button 
              size="lg" 
              className="bg-white text-red-600 hover:bg-gray-100 font-bold"
              onClick={() => navigate("/register")}
            >
              Garantir minha vaga agora
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => document.getElementById('planos')?.scrollIntoView()}
            >
              Ver planos disponíveis
            </Button>
          </div>
          <p className="text-red-100 text-sm">
            🔥 Restam apenas 23 vagas • ⏰ Oferta válida até o final do mês
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Perguntas Frequentes</h2>
            <p className="text-xl text-gray-600">
              Tudo o que você precisa saber antes de transformar seu restaurante
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                Em quanto tempo vou ver resultados no meu restaurante?
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">
                  Nossos clientes relatam melhorias significativas já nas primeiras semanas:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Semana 1-2:</strong> Identificação de vazamentos financeiros e produtos deficitários</li>
                  <li><strong>Semana 3-4:</strong> Otimização de preços e redução de desperdícios</li>
                  <li><strong>Mês 1:</strong> Aumento médio de 15-25% na margem de lucro</li>
                  <li><strong>Mês 2-3:</strong> Estabilização e crescimento sustentável (30-40% de melhoria)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Preciso ter conhecimentos técnicos para usar o sistema?
              </AccordionTrigger>
              <AccordionContent>
                Não! O RestoAI CEO foi desenvolvido para ser extremamente intuitivo. Oferecemos:
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Interface simples e amigável</li>
                  <li>Onboarding guiado passo a passo</li>
                  <li>Treinamento gratuito para sua equipe</li>
                  <li>Suporte especializado para dúvidas</li>
                  <li>Biblioteca de vídeos tutoriais</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Como funciona a migração dos meus dados atuais?
              </AccordionTrigger>
              <AccordionContent>
                Nossa equipe técnica faz toda a migração para você sem custo adicional:
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Importação de cardápio e produtos</li>
                  <li>Migração de dados financeiros</li>
                  <li>Configuração personalizada</li>
                  <li>Teste completo antes do go-live</li>
                  <li>Suporte durante a transição</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                O que acontece se eu não ficar satisfeito?
              </AccordionTrigger>
              <AccordionContent>
                Oferecemos uma garantia incondicional de 30 dias. Se você não ver melhoria na 
                lucratividade do seu restaurante, devolvemos 100% do valor pago, sem perguntas 
                ou burocracias. Sua satisfação é nossa prioridade.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Vocês têm suporte para diferentes tipos de estabelecimento?
              </AccordionTrigger>
              <AccordionContent>
                Sim! O RestoAI CEO atende todos os tipos de estabelecimentos:
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Restaurantes tradicionais</li>
                  <li>Fast food e delivery</li>
                  <li>Cafeterias e padarias</li>
                  <li>Bares e pubs</li>
                  <li>Food trucks</li>
                  <li>Redes e franquias</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-primary to-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Está pronto para revolucionar seu restaurante?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Junte-se a mais de 5.000 restaurantes que já aumentaram sua lucratividade 
            com o RestoAI CEO. Comece seu teste gratuito hoje mesmo!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100 font-bold text-lg px-8 py-4"
              onClick={() => navigate("/register")}
            >
              Começar teste gratuito de 14 dias
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-4"
              onClick={() => navigate("/login")}
            >
              Já sou cliente - Fazer login
            </Button>
          </div>
          <p className="text-white/80 text-sm">
            ✅ Sem cartão de crédito • ✅ Sem compromisso • ✅ Suporte completo • ✅ Garantia de resultados
          </p>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">RestoAI CEO</h3>
              <p className="text-sm mb-4">
                A plataforma completa que transforma restaurantes com inteligência artificial.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-400" />
                <span>100% Seguro e Confiável</span>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="hover:text-white">Funcionalidades</Link></li>
                <li><Link to="#planos" className="hover:text-white">Preços</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/register" className="hover:text-white">Cadastro</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Recursos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="hover:text-white">Blog</Link></li>
                <li><Link to="/documentacao" className="hover:text-white">Documentação</Link></li>
                <li><Link to="#" className="hover:text-white">Tutoriais</Link></li>
                <li><Link to="#" className="hover:text-white">Webinars</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Suporte</h3>
              <ul className="space-y-2 text-sm">
                <li>📞 (11) 99999-9999</li>
                <li>📧 contato@restoaiceo.com</li>
                <li>💬 Chat 24/7</li>
                <li><Link to="/privacidade" className="hover:text-white">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>© {new Date().getFullYear()} RestoAI CEO. Todos os direitos reservados.</p>
            <p className="mt-2 text-gray-400">
              CNPJ: 00.000.000/0001-00 • Feito com ❤️ para restauranteurs brasileiros
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PaginaVendas;

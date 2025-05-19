
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ShieldCheck, Star, CircleDollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PaginaVendas = () => {
  const [planoPeriodo, setPlanoPeriodo] = useState<"mensal" | "anual">("mensal");
  
  const handlePlanoPeriodo = (value: string) => {
    setPlanoPeriodo(value as "mensal" | "anual");
  };
  
  // Calcular descontos para plano anual
  const precoBasicoMensal = 39.90;
  const precoPremiumMensal = 79.90;
  const descontoAnual = 0.20; // 20% de desconto
  
  const precoBasicoAnual = precoBasicoMensal * 12 * (1 - descontoAnual);
  const precoPremiumAnual = precoPremiumMensal * 12 * (1 - descontoAnual);
  
  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Cabeçalho */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
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
            <Link to="/register">
              <Button>Começar agora</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-primary py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center md:text-left md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <Badge className="mb-4 bg-white text-primary hover:bg-gray-100">Novo</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Gerencie seu restaurante com IA
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-lg mx-auto md:mx-0">
                O sistema completo que transforma a gestão do seu restaurante com inteligência artificial, análise financeira e tomada de decisão estratégica.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100">
                    Começar gratuitamente
                  </Button>
                </Link>
                <Link to="#planos">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                    Ver planos
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-xl transform rotate-3 w-full max-w-md">
                <img 
                  src="/placeholder.svg" 
                  alt="Dashboard Resto AI CEO" 
                  className="rounded-md w-full"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Elementos decorativos */}
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-primary rounded-full filter blur-3xl opacity-20"></div>
      </section>

      {/* Funcionalidades principais */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Funcionalidades completas para seu restaurante</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tudo o que você precisa para administrar seu restaurante de forma eficiente, lucrativa e organizada.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Funcionalidade 1 */}
            <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CircleDollarSign className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>DRE e CMV automatizados</CardTitle>
                <CardDescription>Acompanhe seus resultados financeiros em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Tenha acesso a demonstrativos de resultado e custo de mercadoria vendida automatizados, integrados com seu fluxo de caixa e estoque.
                </p>
              </CardContent>
            </Card>

            {/* Funcionalidade 2 */}
            <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Gerente IA</CardTitle>
                <CardDescription>Assistente inteligente para decisões estratégicas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Receba sugestões de otimização de cardápio, precificação, gestão de estoque e muito mais com nosso assistente de IA integrado.
                </p>
              </CardContent>
            </Card>

            {/* Funcionalidade 3 */}
            <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Ficha técnica e controle de estoque</CardTitle>
                <CardDescription>Padronização e controle completo</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Cadastre suas receitas, controle seu estoque e monitore o consumo em tempo real, garantindo eficiência e qualidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Benefícios que transformam seu negócio</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              O RestoAI CEO foi desenvolvido para impulsionar seu restaurante ao próximo nível de sucesso.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-12">
              {/* Benefício 1 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Aumento de lucratividade</h3>
                  <p className="text-gray-600">
                    Identificação clara dos produtos mais lucrativos, otimização de preços e redução de desperdício para maximizar margens.
                  </p>
                </div>
              </div>
              
              {/* Benefício 2 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Economia de tempo</h3>
                  <p className="text-gray-600">
                    Automação de processos que antes consumiam horas de trabalho manual, permitindo foco no que realmente importa.
                  </p>
                </div>
              </div>
              
              {/* Benefício 3 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Gestão à distância</h3>
                  <p className="text-gray-600">
                    Acompanhe o desempenho do seu restaurante de qualquer lugar, com dados atualizados em tempo real.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-12">
              {/* Benefício 4 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Decisões baseadas em dados</h3>
                  <p className="text-gray-600">
                    Todas as decisões apoiadas por análises detalhadas e insights gerados pela inteligência artificial.
                  </p>
                </div>
              </div>
              
              {/* Benefício 5 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Padronização de processos</h3>
                  <p className="text-gray-600">
                    Garanta que todas as receitas sejam preparadas com consistência, mantendo a qualidade que fideliza clientes.
                  </p>
                </div>
              </div>
              
              {/* Benefício 6 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Planejamento estratégico</h3>
                  <p className="text-gray-600">
                    Crie simulações e projeções para antecipar cenários e preparar seu restaurante para o futuro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">O que nossos clientes dizem</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Restaurantes de todo o Brasil já transformaram sua gestão com o RestoAI CEO.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Depoimento 1 */}
            <Card className="border border-gray-200">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-gray-600 mb-6">
                  "Reduzi meu CMV em 8% no primeiro mês de uso. O sistema identificou itens que estavam com precificação incorreta e sugeriu ajustes que fizeram toda diferença."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <p className="font-medium">Carlos Silva</p>
                    <p className="text-sm text-gray-500">Restaurante Sabor Único</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Depoimento 2 */}
            <Card className="border border-gray-200">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-gray-600 mb-6">
                  "A integração dos módulos financeiros com o controle de estoque eliminou horas de trabalho manual. Agora tenho tempo para focar no atendimento e na experiência dos clientes."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <p className="font-medium">Ana Rodrigues</p>
                    <p className="text-sm text-gray-500">Café Aroma</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Depoimento 3 */}
            <Card className="border border-gray-200">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-gray-600 mb-6">
                  "O assistente de IA me surpreende todos os dias com insights que eu jamais teria percebido sozinho. É como ter um consultor especializado 24 horas por dia."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <p className="font-medium">Marcelo Oliveira</p>
                    <p className="text-sm text-gray-500">Bistrô Mediterrâneo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Planos e preços */}
      <section id="planos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Escolha o plano ideal para seu restaurante</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Planos flexíveis que crescem junto com seu negócio, sem contratos longos ou taxas ocultas.
            </p>
            
            <Tabs defaultValue="mensal" className="max-w-xs mx-auto" onValueChange={handlePlanoPeriodo}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mensal">Mensal</TabsTrigger>
                <TabsTrigger value="anual">Anual (20% off)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plano Básico */}
            <Card className="border-2 border-gray-200 shadow-sm relative overflow-hidden">
              <CardHeader>
                <CardTitle>Plano Básico</CardTitle>
                <CardDescription>Ideal para restaurantes em início de operação</CardDescription>
                <div className="mt-4">
                  <p className="text-3xl font-bold">
                    {planoPeriodo === "mensal" 
                      ? formatarPreco(precoBasicoMensal) 
                      : formatarPreco(precoBasicoAnual / 12)
                    }
                    <span className="text-sm font-normal text-gray-500">/mês</span>
                  </p>
                  {planoPeriodo === "anual" && (
                    <p className="text-sm text-gray-500">
                      {formatarPreco(precoBasicoAnual)} cobrados anualmente
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Controle de estoque básico</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Cadastro de até 100 produtos</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Relatórios financeiros básicos</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Fluxo de caixa e DRE</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Suporte por email</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/register" className="w-full">
                  <Button className="w-full">Começar agora</Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Plano Premium */}
            <Card className="border-2 border-primary shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-semibold">
                Mais popular
              </div>
              <CardHeader>
                <CardTitle>Plano Premium</CardTitle>
                <CardDescription>Para restaurantes que buscam crescimento</CardDescription>
                <div className="mt-4">
                  <p className="text-3xl font-bold">
                    {planoPeriodo === "mensal" 
                      ? formatarPreco(precoPremiumMensal) 
                      : formatarPreco(precoPremiumAnual / 12)
                    }
                    <span className="text-sm font-normal text-gray-500">/mês</span>
                  </p>
                  {planoPeriodo === "anual" && (
                    <p className="text-sm text-gray-500">
                      {formatarPreco(precoPremiumAnual)} cobrados anualmente
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Tudo do plano Básico</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Assistente de IA Avançado</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Produtos ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Simulador de cenários</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Marketing integrado</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Suporte prioritário 24/7</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/register" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Escolher Premium
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-8 text-center">
            <Alert className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <AlertTitle>Garantia de 14 dias</AlertTitle>
              <AlertDescription>
                Teste o RestoAI CEO por 14 dias sem compromisso. Se não estiver completamente satisfeito, devolvemos seu dinheiro.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Perguntas frequentes</h2>
            <p className="text-lg text-gray-600">
              Tudo o que você precisa saber antes de tomar sua decisão.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>É difícil começar a usar o sistema?</AccordionTrigger>
              <AccordionContent>
                Não! Desenvolvemos um processo de onboarding simplificado que guia você em cada etapa. Além disso, oferecemos treinamento completo e documentação detalhada para que você e sua equipe possam aproveitar todas as funcionalidades rapidamente.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>Preciso instalar algum software ou equipamento?</AccordionTrigger>
              <AccordionContent>
                O RestoAI CEO é 100% baseado na nuvem, então você não precisa instalar nada no seu computador. Basta acessar o sistema pelo navegador, em qualquer dispositivo com internet.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>O sistema funciona para qualquer tipo de restaurante?</AccordionTrigger>
              <AccordionContent>
                Sim! O RestoAI CEO foi projetado para atender desde pequenos cafés até restaurantes de grande porte. As funcionalidades são adaptáveis às necessidades específicas do seu negócio.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Como funciona o suporte técnico?</AccordionTrigger>
              <AccordionContent>
                O plano Básico oferece suporte por email com tempo de resposta de até 24 horas. O plano Premium inclui suporte prioritário 24/7 por chat, email e telefone, com tempo de resposta garantido de até 2 horas.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>Posso migrar meus dados existentes?</AccordionTrigger>
              <AccordionContent>
                Com certeza! Oferecemos um serviço de migração de dados que transfere suas informações de sistemas anteriores para o RestoAI CEO. Nossa equipe de suporte está disponível para auxiliar em todo o processo.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Chamada final */}
      <section className="bg-primary py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Pronto para transformar a gestão do seu restaurante?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Junte-se aos milhares de restaurantes que já estão elevando seus resultados com o RestoAI CEO.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">
                Começar agora
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                Já sou cliente
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-gray-900 text-gray-300 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">RestoAI CEO</h3>
              <p className="text-sm">
                Sistema completo de gestão para restaurantes com inteligência artificial.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Links rápidos</h3>
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
                <li><Link to="#" className="hover:text-white">Suporte</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Contato</h3>
              <ul className="space-y-2 text-sm">
                <li>contato@restoaiceo.com</li>
                <li>(11) 99999-9999</li>
                <li>São Paulo, SP</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>© {new Date().getFullYear()} RestoAI CEO. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PaginaVendas;


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ShieldCheck, Star, CircleDollarSign, Users, ArrowRight, Play, TrendingUp, BarChart3, Shield, Zap, Clock, DollarSign, AlertTriangle, Target, Award, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PaginaVendasOtimizada = () => {
  const [planoPeriodo, setPlanoPeriodo] = useState<"mensal" | "anual">("anual");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handlePlanoPeriodo = (value: string) => {
    setPlanoPeriodo(value as "mensal" | "anual");
  };
  
  const precoEssencialMensal = 97;
  const precoProfissionalMensal = 197;
  const descontoAnual = 0.30; // 30% de desconto
  
  const precoEssencialAnual = precoEssencialMensal * 12 * (1 - descontoAnual);
  const precoProfissionalAnual = precoProfissionalMensal * 12 * (1 - descontoAnual);
  
  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
  };

  const handleTesteGratuito = async () => {
    if (!email) {
      toast.error("Por favor, insira seu email para começar o teste gratuito");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Teste gratuito iniciado! Redirecionando...");
      navigate("/register", { state: { email, trial: true } });
    }, 2000);
  };

  const handleComprarPlano = (plano: "essencial" | "profissional") => {
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

      {/* Hero Section - Headline Matadora */}
      <section className="relative bg-gradient-to-br from-red-600 via-primary to-red-700 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            {/* Headline principal */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight">
              SEU RESTAURANTE ESTÁ
              <br />
              <span className="text-yellow-300 drop-shadow-lg">PERDENDO R$ 15.000</span>
              <br />
              POR MÊS E VOCÊ NEM SABE
            </h1>
            
            {/* Subheadline */}
            <p className="text-2xl md:text-3xl text-white/95 mb-8 max-w-4xl mx-auto font-bold">
              Descubra como 7.842 donos de restaurantes aumentaram seus lucros em 
              <span className="text-yellow-300"> 67% em apenas 90 dias</span> usando IA
            </p>

            {/* Prova social imediata */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-lg mx-auto mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-white font-bold">4.9/5 (2.847 avaliações)</span>
              </div>
              <p className="text-white/90 text-lg">
                "Em 3 meses meu lucro aumentou R$ 28.000/mês. É o melhor investimento que já fiz!"
              </p>
              <p className="text-yellow-300 font-bold mt-2">- Carlos Mendes, Bistrô Gourmet SP</p>
            </div>
            
            {/* CTA Principal com escassez */}
            <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-10 max-w-xl mx-auto border border-white/20">
              <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 inline-block">
                🔥 ÚLTIMAS 47 VAGAS DISPONÍVEIS HOJE
              </div>
              <h3 className="text-white text-2xl font-bold mb-6">
                Teste GRÁTIS por 21 dias - Sem cartão de crédito
              </h3>
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Digite seu melhor email aqui"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white text-gray-900 h-14 text-lg"
                />
                <Button 
                  onClick={handleTesteGratuito}
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 text-xl h-16"
                >
                  {isLoading ? "CRIANDO SUA CONTA..." : "QUERO AUMENTAR MEU LUCRO AGORA"}
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-4 mt-6 text-white/90 text-sm">
                <span>✅ 21 dias grátis</span>
                <span>✅ Sem cartão</span>
                <span>✅ Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção do Problema/Dor */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
              Se você é dono de restaurante, PARE e leia cada palavra desta página...
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Porque nos próximos 5 minutos você vai descobrir por que <strong>94% dos restaurantes 
              falham nos primeiros 3 anos</strong> e como alguns poucos sortudos conseguem 
              <strong className="text-green-600">triplicar seus lucros</strong> enquanto outros quebram.
            </p>
          </div>

          {/* Lista de problemas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-700">
                  <AlertTriangle className="h-6 w-6" />
                  Você se reconhece nestes problemas?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p>Trabalha 14 horas por dia mas o lucro não aumenta?</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p>Não sabe qual prato realmente dá lucro ou prejuízo?</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p>Perde dinheiro com desperdício e compras desnecessárias?</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p>Vive no sufoco financeiro sem entender por quê?</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p>Concorrentes vendem mais barato e você não sabe como?</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-700">
                  <Target className="h-6 w-6" />
                  A dura realidade que ninguém te conta:
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p><strong>87% dos restaurantes</strong> têm margem de lucro abaixo de 5%</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p><strong>76% dos donos</strong> não sabem o custo real dos pratos</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p><strong>R$ 15.000/mês</strong> é perdido em desperdício desnecessário</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p><strong>3 horas diárias</strong> são gastas em planilhas e controles</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p><strong>Apenas 13%</strong> conseguem se tornar altamente lucrativos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Alert className="max-w-2xl mx-auto bg-yellow-50 border-yellow-300">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertTitle className="text-yellow-800 text-lg font-bold">
                A VERDADE BRUTAL:
              </AlertTitle>
              <AlertDescription className="text-yellow-800 text-lg">
                Enquanto você luta para sobreviver, existe um pequeno grupo de restaurantes 
                que descobriu o "código secreto" para lucrar 3x mais com menos esforço. 
                Eles sabem exatamente onde está o dinheiro perdido e como recuperá-lo.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Introdução emocional */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            Eu sei exatamente como você se sente...
          </h2>
          <div className="text-xl text-gray-700 space-y-6 leading-relaxed">
            <p>
              Você abriu seu restaurante com um sonho. Queria oferecer comida deliciosa, 
              ter independência financeira e construir algo que fosse seu.
            </p>
            <p>
              Mas a realidade bateu na porta. Entre fornecedores, funcionários, aluguel e mil outras despesas, 
              você percebeu que <strong>trabalhar muito não significa lucrar muito</strong>.
            </p>
            <p>
              Você passa o dia inteiro correndo, resolvendo problemas, mas no final do mês o dinheiro 
              que sobra mal paga suas contas pessoais. E você se pergunta: 
              <strong className="text-red-600">"Onde está o erro?"</strong>
            </p>
            <p className="text-2xl font-bold text-primary">
              A boa notícia é que o problema NÃO é você. É o MÉTODO que você está usando.
            </p>
          </div>
        </div>
      </section>

      {/* Apresentação da solução */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-bold mb-8">
              Apresento o RestoAI CEO
            </h2>
            <p className="text-2xl mb-8 max-w-4xl mx-auto">
              A única plataforma com <strong>Inteligência Artificial</strong> que identifica 
              cada centavo perdido no seu restaurante e mostra exatamente como recuperar tudo.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold mb-6">Como funciona a "mágica":</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-black font-bold text-xl">1</span>
                  </div>
                  <h4 className="font-bold mb-2">CONECTA</h4>
                  <p className="text-sm">Importa todos os seus dados em 5 minutos</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-black font-bold text-xl">2</span>
                  </div>
                  <h4 className="font-bold mb-2">ANALISA</h4>
                  <p className="text-sm">IA identifica onde você está perdendo dinheiro</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-black font-bold text-xl">3</span>
                  </div>
                  <h4 className="font-bold mb-2">LUCRA</h4>
                  <p className="text-sm">Recebe ações específicas para aumentar o lucro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios com transformação */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              O que acontece quando você usa o RestoAI CEO:
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mais de 7.842 restaurantes já viveram essa transformação. Agora é sua vez.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefício 1 */}
            <Card className="border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-green-600">+67% de Lucro</CardTitle>
                <CardDescription className="text-lg">Em média nos primeiros 90 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Identifica pratos deficitários
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Otimiza preços automaticamente
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Encontra oportunidades escondidas
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Benefício 2 */}
            <Card className="border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-blue-600">-20h/semana</CardTitle>
                <CardDescription className="text-lg">Tempo economizado em gestão</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-500" />
                    Relatórios automáticos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-500" />
                    Controle inteligente de estoque
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-500" />
                    Gestão financeira simplificada
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Benefício 3 */}
            <Card className="border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-purple-600">-35% Desperdício</CardTitle>
                <CardDescription className="text-lg">Redução garantida nos custos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-purple-500" />
                    Previsão inteligente de demanda
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-purple-500" />
                    Controle de validade por IA
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-purple-500" />
                    Compras otimizadas
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Transformação emocional */}
          <div className="mt-16 text-center">
            <Alert className="max-w-4xl mx-auto bg-blue-50 border-blue-300">
              <Lightbulb className="h-6 w-6 text-blue-600" />
              <AlertTitle className="text-blue-800 text-xl font-bold mb-4">
                Imagine sua vida em 90 dias:
              </AlertTitle>
              <AlertDescription className="text-blue-800 text-lg space-y-2">
                <p>✅ Trabalhando 6 horas a menos por dia, mas ganhando 3x mais</p>
                <p>✅ Sabendo exatamente onde cada centavo é ganho ou perdido</p>
                <p>✅ Tendo a tranquilidade de saber que seu negócio está prosperando</p>
                <p>✅ Sendo reconhecido como o restaurante mais inteligente da região</p>
                <p className="font-bold text-xl">✅ Finalmente tendo a liberdade financeira que sempre sonhou</p>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Autoridade e confiança */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Por que 7.842 donos de restaurantes confiam no RestoAI CEO?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">+7.842</h3>
              <p className="text-gray-600">Restaurantes transformados</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">R$ 284M</h3>
              <p className="text-gray-600">Em lucros recuperados</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">98.7%</h3>
              <p className="text-gray-600">Taxa de satisfação</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">4.9/5</h3>
              <p className="text-gray-600">Avaliação média</p>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos potentes */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Histórias reais de transformação:
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Depoimento 1 */}
            <Card className="border-2 border-green-200 shadow-xl">
              <CardContent className="pt-8">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-gray-700 mb-6 text-lg leading-relaxed">
                  "Antes do RestoAI CEO eu trabalhava 16 horas por dia e sobrava R$ 3.000/mês. 
                  Hoje trabalho 8 horas e sobram R$ 23.000/mês. A IA encontrou R$ 12.000 em 
                  vazamentos que eu nem sabia que existiam. É surreal!"
                </p>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full mr-4 flex items-center justify-center text-white font-bold text-xl">
                    AM
                  </div>
                  <div>
                    <p className="font-bold text-lg">Ana Maria Santos</p>
                    <p className="text-gray-600">Restaurante Vila Rica - MG</p>
                    <p className="text-green-600 font-bold">De R$ 3k para R$ 23k/mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Depoimento 2 */}
            <Card className="border-2 border-blue-200 shadow-xl">
              <CardContent className="pt-8">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-gray-700 mb-6 text-lg leading-relaxed">
                  "Estava quase fechando o restaurante. Dívidas de R$ 80mil e sem perspectiva. 
                  O RestoAI me mostrou que eu estava vendendo 60% dos pratos no prejuízo! 
                  Em 4 meses quitei todas as dívidas e hoje faturo R$ 180k/mês."
                </p>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full mr-4 flex items-center justify-center text-white font-bold text-xl">
                    RC
                  </div>
                  <div>
                    <p className="font-bold text-lg">Roberto Carlos</p>
                    <p className="text-gray-600">Churrascaria Gaúcha - RS</p>
                    <p className="text-blue-600 font-bold">De quase falência para R$ 180k/mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depoimento 3 */}
            <Card className="border-2 border-purple-200 shadow-xl">
              <CardContent className="pt-8">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-gray-700 mb-6 text-lg leading-relaxed">
                  "Tinha 3 restaurantes mas não sabia qual dava lucro. O sistema mostrou que 
                  1 estava me fazendo perder R$ 15k/mês! Fechei ele, otimizei os outros 2 e 
                  hoje lucro 40% mais trabalhando só com 2 unidades."
                </p>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full mr-4 flex items-center justify-center text-white font-bold text-xl">
                    MF
                  </div>
                  <div>
                    <p className="font-bold text-lg">Márcia Fernandes</p>
                    <p className="text-gray-600">Rede Fast Gourmet - SP</p>
                    <p className="text-purple-600 font-bold">+40% lucro com menos trabalho</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depoimento 4 */}
            <Card className="border-2 border-orange-200 shadow-xl">
              <CardContent className="pt-8">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-gray-700 mb-6 text-lg leading-relaxed">
                  "O RestoAI pagou por si mesmo na primeira semana! Descobri que estava 
                  desperdiçando R$ 8.000/mês só em compras erradas. Agora a IA faz toda a 
                  gestão de estoque e meu lucro aumentou 85% em 60 dias."
                </p>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full mr-4 flex items-center justify-center text-white font-bold text-xl">
                    JS
                  </div>
                  <div>
                    <p className="font-bold text-lg">João Silva</p>
                    <p className="text-gray-600">Pizzaria Bella Vista - RJ</p>
                    <p className="text-orange-600 font-bold">+85% lucro em 60 dias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ancoragem de preço com urgência */}
      <section className="py-20 bg-gradient-to-br from-red-600 to-red-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-8">
              INVESTIMENTO que se paga sozinho em 7 dias
            </h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto mb-8">
              <h3 className="text-3xl font-bold mb-6">Vamos fazer as contas juntos:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div>
                  <h4 className="text-xl font-bold mb-4 text-yellow-300">SEM o RestoAI CEO:</h4>
                  <ul className="space-y-2">
                    <li>❌ R$ 15.000/mês perdidos em desperdício</li>
                    <li>❌ R$ 8.000/mês em pratos deficitários</li>
                    <li>❌ R$ 5.000/mês em compras desnecessárias</li>
                    <li>❌ 80h/mês em planilhas e controles</li>
                    <li className="text-red-300 font-bold text-lg">💸 PREJUÍZO: R$ 28.000/mês</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-4 text-green-300">COM o RestoAI CEO:</h4>
                  <ul className="space-y-2">
                    <li>✅ +R$ 15.000/mês recuperados</li>
                    <li>✅ +R$ 12.000/mês em otimização</li>
                    <li>✅ +R$ 5.000/mês em eficiência</li>
                    <li>✅ 80h/mês livres para crescer</li>
                    <li className="text-green-300 font-bold text-lg">💰 LUCRO EXTRA: R$ 32.000/mês</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-400 text-black rounded-2xl p-6 max-w-xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">
                ROI: 3.247% no primeiro mês!
              </h3>
              <p className="text-lg">
                Você investe menos de R$ 200 e recupera mais de R$ 32.000. 
                <br />É o melhor investimento da sua vida empresarial!
              </p>
            </div>
          </div>

          {/* Planos com urgência */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="bg-red-500 text-white px-6 py-3 rounded-full text-lg font-bold mb-6 inline-block animate-pulse">
                ⚠️ OFERTA VÁLIDA APENAS HOJE - RESTAM 47 VAGAS
              </div>
              
              <Tabs value={planoPeriodo} onValueChange={handlePlanoPeriodo} className="max-w-xs mx-auto mb-8">
                <TabsList className="grid w-full grid-cols-2 bg-white text-black">
                  <TabsTrigger value="mensal">Mensal</TabsTrigger>
                  <TabsTrigger value="anual" className="relative">
                    Anual
                    <Badge className="absolute -top-2 -right-2 bg-green-500 text-xs px-1">30% OFF</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Plano Essencial */}
              <Card className="border-3 border-white shadow-2xl relative overflow-hidden bg-white text-black">
                <div className="bg-blue-500 text-white text-center py-2 font-bold">
                  PERFEITO PARA COMEÇAR
                </div>
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl text-blue-600">Plano Essencial</CardTitle>
                  <div className="mt-6">
                    {planoPeriodo === "anual" && (
                      <div className="text-red-500 line-through text-xl mb-2">
                        De {formatarPreco(precoEssencialMensal)} por mês
                      </div>
                    )}
                    <p className="text-5xl font-bold text-blue-600">
                      {planoPeriodo === "mensal" 
                        ? formatarPreco(precoEssencialMensal) 
                        : formatarPreco(precoEssencialAnual / 12)
                      }
                      <span className="text-lg font-normal text-gray-500">/mês</span>
                    </p>
                    {planoPeriodo === "anual" && (
                      <p className="text-green-600 font-bold mt-2">
                        ECONOMIA DE R$ {((precoEssencialMensal * 12) - precoEssencialAnual).toFixed(0)} POR ANO!
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span><strong>Gestão Financeira Completa</strong> - DRE automática, CMV, fluxo de caixa</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span><strong>Controle de Estoque Inteligente</strong> - Até 1.000 produtos</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span><strong>Análise de Lucratividade</strong> - Por prato, categoria e período</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span><strong>20+ Relatórios Automáticos</strong> - Insights diários</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span><strong>Suporte VIP</strong> - WhatsApp prioritário</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleComprarPlano("essencial")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 h-16"
                  >
                    COMEÇAR AGORA - 21 DIAS GRÁTIS
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Plano Profissional */}
              <Card className="border-3 border-yellow-400 shadow-2xl relative overflow-hidden bg-white text-black transform scale-105">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-center py-2 font-bold">
                  🔥 MAIS ESCOLHIDO - MÁXIMO RESULTADO
                </div>
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl text-primary">Plano Profissional</CardTitle>
                  <div className="mt-6">
                    {planoPeriodo === "anual" && (
                      <div className="text-red-500 line-through text-xl mb-2">
                        De {formatarPreco(precoProfissionalMensal)} por mês
                      </div>
                    )}
                    <p className="text-5xl font-bold text-primary">
                      {planoPeriodo === "mensal" 
                        ? formatarPreco(precoProfissionalMensal) 
                        : formatarPreco(precoProfissionalAnual / 12)
                      }
                      <span className="text-lg font-normal text-gray-500">/mês</span>
                    </p>
                    {planoPeriodo === "anual" && (
                      <p className="text-green-600 font-bold mt-2">
                        ECONOMIA DE R$ {((precoProfissionalMensal * 12) - precoProfissionalAnual).toFixed(0)} POR ANO!
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge className="bg-primary/10 text-primary mb-4 text-sm">TUDO DO ESSENCIAL +</Badge>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span><strong>IA Assistente Completa</strong> - Recomendações personalizadas 24/7</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span><strong>Simulador de Cenários</strong> - Teste estratégias antes de aplicar</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span><strong>Produtos Ilimitados</strong> - Sem limitações</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span><strong>Análise Preditiva</strong> - Previsão de vendas e tendências</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span><strong>Consultoria Mensal</strong> - 2h com especialista</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span><strong>Suporte 24/7</strong> - Telefone + WhatsApp</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleComprarPlano("profissional")}
                    className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-bold text-lg py-4 h-16"
                  >
                    QUERO O MÁXIMO RESULTADO - 21 DIAS GRÁTIS
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Bônus */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              🎁 BÔNUS EXCLUSIVOS (Apenas hoje)
            </h2>
            <p className="text-xl text-gray-700">
              Valor total dos bônus: <span className="text-green-600 font-bold text-2xl">R$ 4.970</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-yellow-300 bg-white shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">🚀</span>
                </div>
                <CardTitle className="text-xl">Implementação VIP</CardTitle>
                <Badge className="bg-green-100 text-green-800">Valor: R$ 1.970</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Nossa equipe configura tudo para você em 24h. Importação de dados, 
                  treinamento da equipe e primeiras análises gratuitas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-300 bg-white shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">📚</span>
                </div>
                <CardTitle className="text-xl">Curso Restaurante Lucrativo</CardTitle>
                <Badge className="bg-green-100 text-green-800">Valor: R$ 1.500</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  12 módulos com as estratégias secretas dos restaurantes mais lucrativos 
                  do Brasil. Acesso vitalício.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-300 bg-white shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">👥</span>
                </div>
                <CardTitle className="text-xl">Grupo VIP Telegram</CardTitle>
                <Badge className="bg-green-100 text-green-800">Valor: R$ 1.500</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Acesso ao grupo exclusivo com outros donos de restaurantes de sucesso. 
                  Networking e troca de experiências diárias.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Garantia */}
      <section className="py-20 bg-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            Garantia Blindada de 60 dias
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-green-300">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-700 mb-4">
              AUMENTE SEU LUCRO EM 25% OU SEU DINHEIRO DE VOLTA!
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              Use o RestoAI CEO por 60 dias completos. Se você não aumentar seu lucro em 
              pelo menos 25%, nós devolvemos 100% do seu investimento. Sem perguntas, 
              sem burocracias, sem enrolação.
            </p>
            <p className="text-xl font-bold text-green-600">
              O risco é todo nosso. O lucro é todo seu!
            </p>
          </div>
        </div>
      </section>

      {/* Escassez final */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            ⚠️ ÚLTIMAS 47 VAGAS HOJE
          </h2>
          <p className="text-2xl mb-8">
            Devido ao alto volume de implementações, só conseguimos atender 
            <strong> 50 novos restaurantes por mês</strong>. Se você não garantir 
            sua vaga hoje, terá que esperar até o próximo mês.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <h3 className="text-3xl font-bold mb-6">DECIDE AGORA:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="bg-red-500/20 p-6 rounded-xl">
                <h4 className="text-xl font-bold mb-4 text-red-200">❌ Se você não agir hoje:</h4>
                <ul className="space-y-2">
                  <li>• Continua perdendo R$ 15.000/mês</li>
                  <li>• Trabalha 16h/dia sem resultado</li>
                  <li>• Vê concorrentes prosperando</li>
                  <li>• Perde a oportunidade de transformar sua vida</li>
                </ul>
              </div>
              <div className="bg-green-500/20 p-6 rounded-xl">
                <h4 className="text-xl font-bold mb-4 text-green-200">✅ Se você agir AGORA:</h4>
                <ul className="space-y-2">
                  <li>• Recupera R$ 32.000/mês em 90 dias</li>
                  <li>• Trabalha menos e ganha mais</li>
                  <li>• Torna-se referência na região</li>
                  <li>• Conquista a liberdade financeira</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Button 
              size="lg" 
              className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold text-2xl px-12 py-6 h-20"
              onClick={() => navigate("/register")}
            >
              SIM! QUERO TRANSFORMAR MEU RESTAURANTE HOJE
              <ArrowRight className="ml-2 h-8 w-8" />
            </Button>
            
            <p className="text-yellow-200 text-lg">
              ✅ 21 dias grátis • ✅ Implementação VIP • ✅ Garantia de 60 dias • ✅ Bônus R$ 4.970
            </p>
            
            <p className="text-red-200 text-sm animate-pulse">
              ⏰ Esta página expira em: <span className="font-bold">23:47:32</span>
            </p>
          </div>
        </div>
      </section>

      {/* Fechamento emocional */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            Uma última reflexão...
          </h2>
          <div className="text-xl space-y-6 leading-relaxed">
            <p>
              Você teve a coragem de abrir um restaurante quando 94% falham.
            </p>
            <p>
              Você superou a pandemia quando milhares fecharam as portas.
            </p>
            <p>
              Você trabalha incansavelmente todos os dias pelo seu sonho.
            </p>
            <p className="text-yellow-400 font-bold text-2xl">
              Agora você tem a oportunidade de ter as ferramentas que os 
              restaurantes mais lucrativos do Brasil usam.
            </p>
            <p>
              A pergunta não é se o RestoAI CEO funciona. 
              <strong className="text-green-400"> Já provamos que funciona com 7.842 restaurantes.</strong>
            </p>
            <p className="text-3xl font-bold text-red-400">
              A pergunta é: você vai aproveitar essa oportunidade 
              ou vai deixar ela passar?
            </p>
            <p className="text-xl">
              Daqui a 1 ano, você vai estar no mesmo lugar ou vai estar 
              entre os donos de restaurantes mais bem-sucedidos do Brasil?
            </p>
            <p className="text-2xl font-bold text-white">
              A escolha é sua. Mas ela precisa ser feita HOJE.
            </p>
          </div>
          
          <div className="mt-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-2xl px-12 py-6 h-20"
              onClick={() => navigate("/register")}
            >
              ESCOLHO O SUCESSO - COMEÇAR AGORA
              <ArrowRight className="ml-2 h-8 w-8" />
            </Button>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            <h3 className="text-white font-bold text-xl mb-2">RestoAI CEO</h3>
            <p className="text-sm">
              A plataforma que transforma restaurantes com inteligência artificial.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm mb-4">
            <span>📞 (11) 99999-9999</span>
            <span>📧 contato@restoaiceo.com</span>
            <span>💬 Chat 24/7</span>
          </div>
          <div className="border-t border-gray-800 pt-4 text-sm">
            <p>© {new Date().getFullYear()} RestoAI CEO. Todos os direitos reservados.</p>
            <p className="mt-2 text-gray-400">
              CNPJ: 00.000.000/0001-00 • Desenvolvido para transformar restaurantes brasileiros
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PaginaVendasOtimizada;

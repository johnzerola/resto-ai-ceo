import { useState } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, BarChartBig, Lightbulb, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GerenteIA = () => {
  const [query, setQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState("");
  const { toast } = useToast();

  // Histórico de perguntas como exemplo
  const queryHistory = [
    { question: "Como reduzir o desperdício na cozinha?", date: "2023-05-10" },
    { question: "Qual o melhor dia para fazer promoção de bebidas?", date: "2023-05-08" },
    { question: "Como aumentar as vendas em dias de semana?", date: "2023-05-05" }
  ];

  // Recomendações automáticas como exemplo
  const autoRecommendations = [
    {
      title: "Alto CMV na categoria Bebidas",
      description: "Sua margem nas bebidas está 5% abaixo do ideal. Considere renegociar com fornecedores ou ajustar preços.",
      category: "financeiro",
      impact: "médio"
    },
    {
      title: "Oportunidade de Promoção",
      description: "Terça-feira tem sido seu dia de menor movimento. Uma promoção de 2 por 1 em pratos específicos pode aumentar o fluxo.",
      category: "marketing",
      impact: "alto"
    },
    {
      title: "Estoque Crítico",
      description: "3 ingredientes importantes estão próximos do limite mínimo. Recomendamos fazer pedido hoje.",
      category: "estoque",
      impact: "urgente"
    }
  ];

  const handleQuerySubmit = () => {
    if (!query.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, digite sua pergunta",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    // Simulação de resposta da IA
    setTimeout(() => {
      setRecommendation(`
Com base nas informações disponíveis sobre seu restaurante, aqui estão minhas recomendações para "${query}":

1. **Análise de Dados**: Seus registros mostram que o período de 18h às 21h nas quintas e sextas-feiras tem o maior fluxo de clientes.

2. **Recomendação**: Considere aumentar o número de funcionários nesses horários para melhorar a experiência do cliente e aumentar a rotatividade das mesas.

3. **Oportunidade**: O ticket médio nesse período é 15% menor que nos finais de semana. Sugiro treinar a equipe para sugerir entradas e bebidas premium, o que pode aumentar o ticket médio em até 20%.

4. **Próximos passos**: Implemente essas mudanças por 2 semanas e monitore os resultados. Podemos ajustar a estratégia com base no desempenho.
      `);
      setIsGenerating(false);
    }, 2000);
  };

  const handleRecommendationClick = (rec) => {
    setRecommendation(`
**Análise Detalhada: ${rec.title}**

${rec.description}

**Causas Prováveis:**
${rec.category === 'financeiro' 
  ? '- Aumento nos preços dos fornecedores\n- Desperdício no uso de insumos\n- Porções inconsistentes' 
  : rec.category === 'marketing' 
    ? '- Baixa circulação de pessoas no dia\n- Falta de atratividade no cardápio para esse dia\n- Concorrência com promoções similares' 
    : '- Falha no controle de estoque\n- Aumento inesperado na demanda\n- Atrasos nas entregas dos fornecedores'}

**Ações Recomendadas:**
${rec.category === 'financeiro' 
  ? '1. Revise os contratos com fornecedores\n2. Implemente controle de porcionamento padronizado\n3. Treine a equipe para redução de desperdício' 
  : rec.category === 'marketing' 
    ? '1. Crie uma promoção específica para terças-feiras\n2. Divulgue nas redes sociais com 48h de antecedência\n3. Análise o resultado após 3 semanas' 
    : '1. Faça o pedido hoje com prioridade\n2. Revise o ponto de pedido desses itens\n3. Verifique fornecedores alternativos para emergências'}

**Impacto Estimado:**
Resolver esta questão tem potencial para ${rec.impact === 'alto' ? 'aumentar sua rentabilidade em 8-10%' : rec.impact === 'médio' ? 'melhorar sua margem em 3-5%' : 'evitar paradas na operação e garantir o atendimento normal'}.
    `);
  };

  return (
    <ModernLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerente IA</h1>
          <p className="text-muted-foreground">
            Seu assistente inteligente para gestão do restaurante
          </p>
        </div>

        <Tabs defaultValue="consulta" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="consulta">Consulta ao Gerente</TabsTrigger>
            <TabsTrigger value="recomendacoes">Recomendações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="consulta" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Pergunte ao Gerente IA
                </CardTitle>
                <CardDescription>
                  Faça perguntas específicas sobre o seu negócio e obtenha análises e recomendações personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="Exemplo: Como posso aumentar o ticket médio no horário de almoço?" 
                  className="min-h-[120px]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={handleQuerySubmit} disabled={isGenerating}>
                    {isGenerating ? "Gerando..." : "Enviar Consulta"}
                  </Button>
                </div>

                {recommendation && (
                  <Card className="mt-4 bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm">{recommendation}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Consultas recentes</h3>
                  <div className="space-y-2">
                    {queryHistory.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-md hover:bg-muted/80 cursor-pointer text-sm">
                        <span>{item.question}</span>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recomendacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Recomendações Inteligentes
                </CardTitle>
                <CardDescription>
                  Insights automáticos baseados na análise dos seus dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {autoRecommendations.map((rec, index) => (
                    <div 
                      key={index} 
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleRecommendationClick(rec)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{rec.title}</h3>
                        <Badge variant={
                          rec.impact === "urgente" ? "destructive" : 
                          rec.impact === "alto" ? "default" : 
                          "secondary"
                        }>
                          {rec.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Atualizado hoje</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Relatório Semanal</h3>
                  <Button variant="outline" size="sm">
                    <BarChartBig className="h-4 w-4 mr-2" />
                    Ver Relatório Completo
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">+12%</div>
                      <p className="text-xs text-muted-foreground">Vendas vs. semana anterior</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">31%</div>
                      <p className="text-xs text-muted-foreground">CMV médio atual</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">18</div>
                      <p className="text-xs text-muted-foreground">Itens com baixo giro</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
};

export default GerenteIA;

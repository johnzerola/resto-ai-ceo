
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface TrendData {
  date: string;
  revenue: number;
  customers: number;
  averageTicket: number;
}

interface SeasonalInsight {
  type: "positive" | "negative" | "neutral";
  title: string;
  description: string;
  recommendation?: string;
}

export function AdvancedAnalytics() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [isLoading, setIsLoading] = useState(true);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [seasonalInsights, setSeasonalInsights] = useState<SeasonalInsight[]>([]);

  // Carregar dados históricos
  useEffect(() => {
    // Simulação de carregamento de dados
    setIsLoading(true);
    
    setTimeout(() => {
      const generateHistoricalData = () => {
        // Gerar dados simulados baseados no período selecionado
        const data: TrendData[] = [];
        let startDate: Date;
        let increment: number;
        let format: Intl.DateTimeFormatOptions;
        let points: number;
        
        if (period === "daily") {
          // Últimos 14 dias
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 14);
          increment = 1;
          format = { day: '2-digit', month: '2-digit' };
          points = 14;
          
          // Padrão semanal: final de semana mais movimentado
          const weekPattern = [0.9, 0.85, 0.8, 0.9, 1.1, 1.3, 1.25]; // Seg-Dom
        
          for (let i = 0; i < points; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);
            const dayOfWeek = currentDate.getDay();
            
            // Base + variação sazonal + ruído aleatório
            const baseRevenue = 2000;
            const dayMultiplier = weekPattern[dayOfWeek];
            const randomFactor = 0.9 + Math.random() * 0.2; // 0.9-1.1
            
            const revenue = baseRevenue * dayMultiplier * randomFactor;
            const customers = Math.round(revenue / 80 * randomFactor);
            const averageTicket = revenue / customers;
            
            data.push({
              date: currentDate.toLocaleDateString('pt-BR', format),
              revenue: Math.round(revenue),
              customers,
              averageTicket: Math.round(averageTicket * 100) / 100
            });
          }
        } else if (period === "weekly") {
          // Últimas 12 semanas
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 84); // 12 semanas atrás
          increment = 7;
          format = { day: '2-digit', month: '2-digit' };
          points = 12;
          
          // Padrão mensal: primeira e última semana do mês mais fortes
          const monthPattern = [1.1, 0.9, 0.85, 1.05, 1.1, 0.9, 0.85, 1.05, 1.1, 0.9, 0.85, 1.05];
          
          for (let i = 0; i < points; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + (i * increment));
            
            const endDate = new Date(currentDate);
            endDate.setDate(endDate.getDate() + 6);
            
            // Base + variação sazonal + tendência crescente + ruído aleatório
            const baseRevenue = 14000;
            const monthMultiplier = monthPattern[i % monthPattern.length];
            const trendMultiplier = 1 + (i * 0.01); // Leve tendência crescente
            const randomFactor = 0.95 + Math.random() * 0.1; // 0.95-1.05
            
            const revenue = baseRevenue * monthMultiplier * trendMultiplier * randomFactor;
            const customers = Math.round(revenue / 80 * randomFactor);
            const averageTicket = revenue / customers;
            
            const dateLabel = `${currentDate.toLocaleDateString('pt-BR', format)} - ${endDate.toLocaleDateString('pt-BR', format)}`;
            
            data.push({
              date: dateLabel,
              revenue: Math.round(revenue),
              customers,
              averageTicket: Math.round(averageTicket * 100) / 100
            });
          }
        } else {
          // Últimos 12 meses
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 12);
          increment = 1;
          format = { month: 'short', year: 'numeric' };
          points = 12;
          
          // Padrão sazonal: final de ano e julho mais fortes
          const yearPattern = [0.9, 0.85, 0.9, 0.95, 1.0, 1.05, 1.15, 1.0, 0.95, 1.0, 1.1, 1.3];
          
          for (let i = 0; i < points; i++) {
            const currentDate = new Date(startDate);
            currentDate.setMonth(currentDate.getMonth() + i);
            
            const monthIndex = currentDate.getMonth();
            
            // Base + variação sazonal + ruído aleatório
            const baseRevenue = 60000;
            const monthMultiplier = yearPattern[monthIndex];
            const randomFactor = 0.97 + Math.random() * 0.06; // 0.97-1.03
            
            const revenue = baseRevenue * monthMultiplier * randomFactor;
            const customers = Math.round(revenue / 80 * randomFactor);
            const averageTicket = revenue / customers;
            
            data.push({
              date: currentDate.toLocaleDateString('pt-BR', format),
              revenue: Math.round(revenue),
              customers,
              averageTicket: Math.round(averageTicket * 100) / 100
            });
          }
        }
        
        return data;
      };
      
      // Gerar insights com base nos dados
      const generateInsights = (data: TrendData[]): SeasonalInsight[] => {
        const insights: SeasonalInsight[] = [];
        
        // Verificar tendência de receita
        const revenueStart = data[0].revenue;
        const revenueEnd = data[data.length - 1].revenue;
        const revenueChange = ((revenueEnd - revenueStart) / revenueStart) * 100;
        
        // Adicionar insight sobre tendência geral
        if (revenueChange > 5) {
          insights.push({
            type: "positive",
            title: "Tendência de crescimento",
            description: `As receitas aumentaram ${revenueChange.toFixed(1)}% no período analisado.`,
            recommendation: "Continue investindo nas estratégias atuais de marketing e retenção de clientes."
          });
        } else if (revenueChange < -5) {
          insights.push({
            type: "negative",
            title: "Tendência de queda",
            description: `As receitas caíram ${Math.abs(revenueChange).toFixed(1)}% no período analisado.`,
            recommendation: "Revise seu cardápio e estratégias de precificação. Considere uma campanha promocional."
          });
        }
        
        // Identificar períodos de pico
        let maxRevenue = 0;
        let maxRevenueIndex = 0;
        
        data.forEach((item, index) => {
          if (item.revenue > maxRevenue) {
            maxRevenue = item.revenue;
            maxRevenueIndex = index;
          }
        });
        
        // Verificar sazonalidade
        if (period === "daily") {
          // Padrão semanal
          const weekdayPattern = [0, 0, 0, 0, 0, 0, 0]; // Dom-Sáb
          let totalRevenue = 0;
          
          data.forEach((item, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (data.length - 1 - index));
            const dayOfWeek = date.getDay();
            
            weekdayPattern[dayOfWeek] += item.revenue;
            totalRevenue += item.revenue;
          });
          
          // Encontrar dia da semana mais forte
          let maxDay = 0;
          let maxDayRevenue = 0;
          
          weekdayPattern.forEach((revenue, day) => {
            if (revenue > maxDayRevenue) {
              maxDayRevenue = revenue;
              maxDay = day;
            }
          });
          
          const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
          const bestDay = weekdays[maxDay];
          
          insights.push({
            type: "positive",
            title: `${bestDay}: seu melhor dia`,
            description: `${bestDay} é o dia com maior faturamento médio.`,
            recommendation: `Considere promoções especiais e maior equipe nos dias de ${bestDay}.`
          });
          
        } else if (period === "monthly") {
          // Padrão anual
          const highSeasonMonths = ["Dezembro", "Julho"];
          const lowSeasonMonths = ["Fevereiro", "Março"];
          
          insights.push({
            type: "neutral",
            title: "Sazonalidade anual detectada",
            description: `${highSeasonMonths.join(" e ")} são os meses de maior movimento, enquanto ${lowSeasonMonths.join(" e ")} apresentam movimento reduzido.`,
            recommendation: "Prepare estratégias específicas para alta e baixa temporada."
          });
        }
        
        // Adicionar insight sobre ticket médio
        const ticketStart = data[0].averageTicket;
        const ticketEnd = data[data.length - 1].averageTicket;
        const ticketChange = ((ticketEnd - ticketStart) / ticketStart) * 100;
        
        if (ticketChange > 3) {
          insights.push({
            type: "positive",
            title: "Ticket médio em crescimento",
            description: `O ticket médio aumentou ${ticketChange.toFixed(1)}% no período.`,
            recommendation: "Sua estratégia de venda adicional está funcionando. Continue promovendo combos e sugestões."
          });
        } else if (ticketChange < -3) {
          insights.push({
            type: "negative",
            title: "Queda no ticket médio",
            description: `O ticket médio diminuiu ${Math.abs(ticketChange).toFixed(1)}% no período.`,
            recommendation: "Revise suas estratégias de venda adicional e sugestões complementares."
          });
        }
        
        return insights;
      };
      
      const data = generateHistoricalData();
      setTrendData(data);
      setSeasonalInsights(generateInsights(data));
      setIsLoading(false);
    }, 500);
  }, [period]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Análise de Tendências</CardTitle>
        <Tabs value={period} onValueChange={(value: any) => setPeriod(value)} className="w-[300px]">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="daily">Diário</TabsTrigger>
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Gráficos */}
          <div className="h-[300px]">
            {isLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-muted-foreground">Carregando dados...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <XAxis 
                    dataKey="date"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value / 1000}k`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === "revenue") return [formatCurrency(value), "Receita"];
                      if (name === "customers") return [value, "Clientes"];
                      if (name === "averageTicket") return [formatCurrency(value), "Ticket Médio"];
                      return [value, name];
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    name="revenue"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="customers"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    name="customers"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Insights sazonais */}
          <div>
            <h3 className="text-base font-medium mb-4">Insights Sazonais</h3>
            <div className="space-y-4">
              {seasonalInsights.length > 0 ? (
                seasonalInsights.map((insight, index) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-lg ${insight.type === 'positive' ? 'border-green-200 bg-green-50' : insight.type === 'negative' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}
                  >
                    <h4 className={`text-sm font-medium ${insight.type === 'positive' ? 'text-green-800' : insight.type === 'negative' ? 'text-red-800' : 'text-blue-800'}`}>
                      {insight.title}
                    </h4>
                    <p className="text-sm mt-1">{insight.description}</p>
                    {insight.recommendation && (
                      <p className="text-sm mt-2 font-medium">
                        Recomendação: {insight.recommendation}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  Nenhum insight sazonal detectado para o período selecionado.
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Exportar relatório
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

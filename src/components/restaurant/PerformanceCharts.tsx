
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  Legend,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ChartContainer } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, CalendarDays } from "lucide-react";

// Dados de exemplo para o gráfico - Aqui seriam substituídos por dados reais da API
const getDailyData = () => [
  {
    date: "01/05",
    atual: 4500,
    anterior: 4200,
    name: "revenue"
  },
  {
    date: "02/05",
    atual: 4800,
    anterior: 4100,
    name: "revenue"
  },
  {
    date: "03/05",
    atual: 5200,
    anterior: 4300,
    name: "revenue"
  },
  {
    date: "04/05",
    atual: 5000,
    anterior: 4700,
    name: "revenue"
  },
  {
    date: "05/05",
    atual: 6200,
    anterior: 5100,
    name: "revenue"
  },
  {
    date: "06/05",
    atual: 8500,
    anterior: 7200,
    name: "revenue"
  },
  {
    date: "07/05",
    atual: 8800,
    anterior: 7500,
    name: "revenue"
  }
];

const getMonthlyData = () => [
  {
    month: "Jan",
    atual: 85000,
    anterior: 78000,
    name: "revenue"
  },
  {
    month: "Fev",
    atual: 82000,
    anterior: 80000,
    name: "revenue"
  },
  {
    month: "Mar",
    atual: 91000,
    anterior: 84000,
    name: "revenue"
  },
  {
    month: "Abr",
    atual: 95000,
    anterior: 88000,
    name: "revenue"
  },
  {
    month: "Mai",
    atual: 101000,
    anterior: 90000,
    name: "revenue"
  }
];

// Componente para mostrar a comparação
interface ComparisonCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  percentageDiff: number;
  period: string;
}

// Componente personalizado para o tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        <div className="mt-2 space-y-1">
          {payload.map((entry: any, index: number) => (
            <p 
              key={`item-${index}`}
              className="text-xs flex items-center justify-between gap-4"
            >
              <span style={{ color: entry.color }}>{entry.name === "atual" ? "Período Atual" : "Período Anterior"}</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Componente personalizado para a legenda
const CustomLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <div className="flex items-center justify-center gap-4 pt-3">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs">
            {entry.dataKey === "atual" ? "Período Atual" : "Período Anterior"}
          </span>
        </div>
      ))}
    </div>
  );
};

const ComparisonCard = ({ title, currentValue, previousValue, percentageDiff, period }: ComparisonCardProps) => {
  const isPositive = percentageDiff > 0;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Atual ({period}):</span>
            <span className="font-medium">{formatCurrency(currentValue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Período anterior:</span>
            <span>{formatCurrency(previousValue)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-gray-600">Variação:</span>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">{isPositive ? '+' : ''}{percentageDiff.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function PerformanceCharts() {
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  
  // Dados para gráficos
  const dailyData = getDailyData();
  const monthlyData = getMonthlyData();
  
  // Calcular valores comparativos
  const calculateTotalAndDiff = (data: any[]) => {
    const currentTotal = data.reduce((sum, item) => sum + item.atual, 0);
    const previousTotal = data.reduce((sum, item) => sum + item.anterior, 0);
    const percentageDiff = ((currentTotal - previousTotal) / previousTotal) * 100;
    
    return {
      currentTotal,
      previousTotal,
      percentageDiff
    };
  };
  
  const dailyComparison = calculateTotalAndDiff(dailyData);
  const monthlyComparison = calculateTotalAndDiff(monthlyData);
  
  const chartConfig = {
    atual: {
      label: "Período Atual",
      theme: { light: "#3b82f6", dark: "#60a5fa" }
    },
    anterior: {
      label: "Período Anterior",
      theme: { light: "#9ca3af", dark: "#d1d5db" }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Análise de Desempenho</h2>
        <Tabs value={period} onValueChange={(value: any) => setPeriod(value)} className="w-[300px]">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="daily">Diário</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1 lg:col-span-3">
          {period === "daily" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Faturamento Últimos 7 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={dailyData}>
                    <XAxis 
                      dataKey="date"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                    <Line name="atual" dataKey="atual" type="monotone" strokeWidth={2} />
                    <Line name="anterior" dataKey="anterior" type="monotone" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Faturamento Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={monthlyData}>
                    <XAxis 
                      dataKey="month"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                    <Bar name="atual" dataKey="atual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar name="anterior" dataKey="anterior" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-1">
          {period === "daily" ? (
            <ComparisonCard
              title="Resumo Semanal"
              currentValue={dailyComparison.currentTotal}
              previousValue={dailyComparison.previousTotal}
              percentageDiff={dailyComparison.percentageDiff}
              period="última semana"
            />
          ) : (
            <ComparisonCard
              title="Resumo do Ano"
              currentValue={monthlyComparison.currentTotal}
              previousValue={monthlyComparison.previousTotal}
              percentageDiff={monthlyComparison.percentageDiff}
              period="ano atual"
            />
          )}
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Insights</h3>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Personalizar Período
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 border rounded-lg ${dailyComparison.percentageDiff > 0 ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
              <h4 className="font-medium">Tendência de Faturamento</h4>
              <p className="mt-2 text-sm">
                {dailyComparison.percentageDiff > 0 
                  ? `Crescimento de ${dailyComparison.percentageDiff.toFixed(1)}% em comparação ao período anterior. Continue com as estratégias atuais.`
                  : `Queda de ${Math.abs(dailyComparison.percentageDiff).toFixed(1)}% em comparação ao período anterior. Recomendamos revisar preços ou lançar promoções.`
                }
              </p>
            </div>
            <div className="p-4 border rounded-lg border-blue-200 bg-blue-50">
              <h4 className="font-medium">Produtos mais lucrativos</h4>
              <p className="mt-2 text-sm">
                Os produtos que mais contribuíram para o aumento do faturamento são: Filé à Parmegiana, Risoto Especial e Caipirinha Premium.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

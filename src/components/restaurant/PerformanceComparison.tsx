
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { ArrowUp, ArrowDown, ChevronUp, ChevronDown, TrendingUp, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

// Tipos para os dados de comparativo
type ComparisonData = {
  period: string;
  current: number;
  previous: number;
  target?: number;
};

type ComparisonMetric = {
  name: string;
  value: number;
  previous: number;
  target?: number;
  percentChange: number;
};

// Dados simulados para comparativo
const salesData: ComparisonData[] = [
  { period: "Seg", current: 2150, previous: 1900, target: 2100 },
  { period: "Ter", current: 1890, previous: 1750, target: 1950 },
  { period: "Qua", current: 2310, previous: 2050, target: 2200 },
  { period: "Qui", current: 2780, previous: 2450, target: 2500 },
  { period: "Sex", current: 3280, previous: 3050, target: 3100 },
  { period: "Sáb", current: 4120, previous: 3850, target: 4000 },
  { period: "Dom", current: 3450, previous: 3350, target: 3500 },
];

const ticketsData: ComparisonData[] = [
  { period: "Seg", current: 78, previous: 72 },
  { period: "Ter", current: 75, previous: 73 },
  { period: "Qua", current: 82, previous: 75 },
  { period: "Qui", current: 86, previous: 80 },
  { period: "Sex", current: 92, previous: 89 },
  { period: "Sáb", current: 110, previous: 105 },
  { period: "Dom", current: 95, previous: 90 },
];

const customersData: ComparisonData[] = [
  { period: "Seg", current: 85, previous: 78 },
  { period: "Ter", current: 75, previous: 72 },
  { period: "Qua", current: 95, previous: 88 },
  { period: "Qui", current: 105, previous: 95 },
  { period: "Sex", current: 135, previous: 125 },
  { period: "Sáb", current: 165, previous: 155 },
  { period: "Dom", current: 140, previous: 130 },
];

const dishesData: ComparisonData[] = [
  { period: "Seg", current: 210, previous: 190 },
  { period: "Ter", current: 195, previous: 185 },
  { period: "Qua", current: 242, previous: 215 },
  { period: "Qui", current: 268, previous: 240 },
  { period: "Sex", current: 320, previous: 298 },
  { period: "Sáb", current: 385, previous: 365 },
  { period: "Dom", current: 315, previous: 295 },
];

// Métricas principais
const metricsData: Record<string, ComparisonMetric[]> = {
  week: [
    { 
      name: "Faturamento", 
      value: 18980, 
      previous: 17400, 
      target: 18500,
      percentChange: 9.1
    },
    { 
      name: "Ticket Médio", 
      value: 88, 
      previous: 83,
      percentChange: 6.0
    },
    { 
      name: "Clientes", 
      value: 800, 
      previous: 743,
      percentChange: 7.7
    },
    { 
      name: "Pratos Vendidos", 
      value: 1935, 
      previous: 1788,
      percentChange: 8.2
    },
  ],
  month: [
    { 
      name: "Faturamento", 
      value: 78500, 
      previous: 70200, 
      target: 75000,
      percentChange: 11.8
    },
    { 
      name: "Ticket Médio", 
      value: 85, 
      previous: 80,
      percentChange: 6.3
    },
    { 
      name: "Clientes", 
      value: 3250, 
      previous: 3050,
      percentChange: 6.6
    },
    { 
      name: "Pratos Vendidos", 
      value: 7850, 
      previous: 7200,
      percentChange: 9.0
    },
  ],
  quarter: [
    { 
      name: "Faturamento", 
      value: 235000, 
      previous: 210000, 
      target: 225000,
      percentChange: 11.9
    },
    { 
      name: "Ticket Médio", 
      value: 83, 
      previous: 78,
      percentChange: 6.4
    },
    { 
      name: "Clientes", 
      value: 9800, 
      previous: 8950,
      percentChange: 9.5
    },
    { 
      name: "Pratos Vendidos", 
      value: 23500, 
      previous: 21000,
      percentChange: 11.9
    },
  ],
};

export const PerformanceComparison = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [comparisonType, setComparisonType] = useState<'previousPeriod' | 'lastYear' | 'target'>('previousPeriod');
  const [chartMetric, setChartMetric] = useState<'sales' | 'tickets' | 'customers' | 'dishes'>('sales');
  
  const getChartData = () => {
    switch(chartMetric) {
      case 'sales': return salesData;
      case 'tickets': return ticketsData;
      case 'customers': return customersData;
      case 'dishes': return dishesData;
      default: return salesData;
    }
  };
  
  const getPeriodName = () => {
    switch(period) {
      case 'week': return "Semana";
      case 'month': return "Mês";
      case 'quarter': return "Trimestre";
      default: return "Período";
    }
  };
  
  const getComparisonName = () => {
    switch(comparisonType) {
      case 'previousPeriod': return `${getPeriodName()} anterior`;
      case 'lastYear': return "Ano anterior";
      case 'target': return "Meta";
      default: return "Comparação";
    }
  };
  
  const getMetricName = () => {
    switch(chartMetric) {
      case 'sales': return "Vendas";
      case 'tickets': return "Ticket médio";
      case 'customers': return "Clientes";
      case 'dishes': return "Pratos vendidos";
      default: return "Métrica";
    }
  };
  
  // Formatar valores
  const formatValue = (value: number, metric: string) => {
    if (metric === 'sales') {
      return formatCurrency(value);
    } else if (metric === 'tickets') {
      return formatCurrency(value);
    } else {
      return value.toString();
    }
  };
  
  // Configurar cores do gráfico
  const chartConfig = {
    sales: {
      current: { theme: { light: "#3b82f6", dark: "#60a5fa" } },
      previous: { theme: { light: "#93c5fd", dark: "#bfdbfe" } },
      target: { theme: { light: "#fb923c", dark: "#fdba74" } },
    },
  };
  
  return (
    <Card className="mb-6 border-green-100">
      <CardHeader className="pb-3 bg-green-50/50">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <CardTitle className="text-lg text-green-700">
            Comparativo de Desempenho
          </CardTitle>
          
          <div className="flex items-center gap-3">
            <Select 
              value={period} 
              onValueChange={(value) => setPeriod(value as 'week' | 'month' | 'quarter')}
            >
              <SelectTrigger className="w-[120px] bg-white border-green-200">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={comparisonType} 
              onValueChange={(value) => setComparisonType(value as 'previousPeriod' | 'lastYear' | 'target')}
            >
              <SelectTrigger className="w-[150px] bg-white border-green-200">
                <SelectValue placeholder="Comparar com" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previousPeriod">Período anterior</SelectItem>
                <SelectItem value="lastYear">Ano anterior</SelectItem>
                <SelectItem value="target">Metas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {metricsData[period].map((metric, index) => {
            const isPositive = metric.percentChange > 0;
            
            return (
              <div 
                key={index}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all",
                  chartMetric === (index === 0 ? 'sales' : index === 1 ? 'tickets' : index === 2 ? 'customers' : 'dishes') 
                    ? "bg-green-50 border-green-300" 
                    : "bg-white border-green-100 hover:border-green-200"
                )}
                onClick={() => setChartMetric(
                  index === 0 ? 'sales' : index === 1 ? 'tickets' : index === 2 ? 'customers' : 'dishes'
                )}
              >
                <div className="text-sm text-muted-foreground">{metric.name}</div>
                <div className="text-2xl font-bold mt-1">
                  {index === 0 || index === 1 ? formatCurrency(metric.value) : metric.value}
                </div>
                
                <div className="mt-2 flex items-center text-xs">
                  <div 
                    className={cn(
                      "flex items-center rounded-full px-1.5 py-0.5 mr-1",
                      isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}
                  >
                    {isPositive ? (
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(metric.percentChange).toFixed(1)}%
                  </div>
                  <span className="text-muted-foreground">vs {getComparisonName()}</span>
                </div>
                
                {metric.target && (
                  <div className="mt-2 text-xs">
                    <span className={cn(
                      "font-medium",
                      metric.value >= metric.target ? "text-green-600" : "text-amber-600"
                    )}>
                      {metric.value >= metric.target ? (
                        <span className="flex items-center">
                          <ChevronUp className="h-3 w-3" />
                          {(((metric.value / metric.target) - 1) * 100).toFixed(1)}% acima da meta
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <ChevronDown className="h-3 w-3" />
                          {(((metric.target / metric.value) - 1) * 100).toFixed(1)}% abaixo da meta
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="border border-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-green-700">
              {getMetricName()} por {period === 'week' ? 'dia' : period === 'month' ? 'semana' : 'mês'}
            </h3>
            
            <Select
              value={chartMetric}
              onValueChange={(value) => setChartMetric(value as 'sales' | 'tickets' | 'customers' | 'dishes')}
            >
              <SelectTrigger className="w-[150px] bg-white border-green-200">
                <SelectValue placeholder="Métrica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Vendas</SelectItem>
                <SelectItem value="tickets">Ticket médio</SelectItem>
                <SelectItem value="customers">Clientes</SelectItem>
                <SelectItem value="dishes">Pratos vendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ChartContainer className="h-64" config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'sales' ? (
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="period" 
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatValue(value, chartMetric)}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value: number) => formatValue(value, chartMetric)}
                      />
                    }
                  />
                  <Line 
                    name="Atual" 
                    type="monotone" 
                    dataKey="current" 
                    stroke="var(--color-sales-current)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    name={getComparisonName()} 
                    type="monotone" 
                    dataKey="previous" 
                    stroke="var(--color-sales-previous)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                  />
                  {comparisonType === 'target' && (
                    <Line 
                      name="Meta" 
                      type="monotone" 
                      dataKey="target" 
                      stroke="var(--color-sales-target)" 
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      dot={{ r: 4 }}
                    />
                  )}
                  <Legend align="right" />
                </LineChart>
              ) : (
                <BarChart data={getChartData()} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="period" 
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatValue(value, chartMetric)}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value: number) => formatValue(value, chartMetric)}
                      />
                    }
                  />
                  <Bar 
                    name="Atual" 
                    dataKey="current" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    name={getComparisonName()} 
                    dataKey="previous" 
                    fill="#93c5fd" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Legend align="right" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
          
          <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground">
            <div className="flex items-center mr-4">
              <Calendar className="h-3 w-3 mr-1" />
              <span>
                {period === 'week' ? 'Última semana' : period === 'month' ? 'Último mês' : 'Último trimestre'}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Atualizado em 22/05/2025 às 10:34</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

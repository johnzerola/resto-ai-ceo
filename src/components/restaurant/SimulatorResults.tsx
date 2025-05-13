
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface SimulatorResultsProps {
  data: any;
  onBackToForm: () => void;
}

export function SimulatorResults({ data, onBackToForm }: SimulatorResultsProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  // Get color based on positive or negative value
  const getValueColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };
  
  // Get trend icon
  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };
  
  // Prepare comparison data for charts
  const revenueComparisonData = [
    {
      name: "Atual",
      value: data.current.revenue
    },
    {
      name: "Projeção",
      value: data.projected.revenue
    }
  ];
  
  const profitComparisonData = [
    {
      name: "Atual",
      value: data.current.profit
    },
    {
      name: "Projeção",
      value: data.projected.profit
    }
  ];
  
  // Data for costs breakdown chart
  const costsBreakdownData = [
    {
      name: "Alimentos e Bebidas",
      atual: data.current.foodCost,
      projecao: data.projected.foodCost
    },
    {
      name: "Mão de Obra",
      atual: data.current.laborCost,
      projecao: data.projected.laborCost
    },
    {
      name: "Aluguel",
      atual: data.current.rentCost,
      projecao: data.projected.rentCost
    },
    {
      name: "Utilidades",
      atual: data.current.utilitiesCost,
      projecao: data.projected.utilitiesCost
    },
    {
      name: "Marketing",
      atual: data.current.marketingCost,
      projecao: data.projected.marketingCost
    },
    {
      name: "Outros",
      atual: data.current.otherCosts,
      projecao: data.projected.otherCosts
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBackToForm}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar à Simulação
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>
      
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resultado da Simulação</CardTitle>
          <CardDescription>
            Comparativo entre cenário atual e projetado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 md:gap-y-0 md:gap-x-6">
            {/* Revenue Comparison */}
            <div className="space-y-2 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-4">
              <p className="text-sm text-muted-foreground">Faturamento</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold">{formatCurrency(data.projected.revenue)}</p>
                <div className={`flex items-center text-sm ${getValueColor(data.changes.revenueChangePercent)}`}>
                  {getTrendIcon(data.changes.revenueChangePercent)}
                  <span className="ml-1">{formatPercentage(data.changes.revenueChangePercent)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Atual: {formatCurrency(data.current.revenue)}
              </p>
            </div>
            
            {/* Profit Comparison */}
            <div className="space-y-2 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-4">
              <p className="text-sm text-muted-foreground">Lucro Operacional</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-2xl font-semibold ${getValueColor(data.projected.profit)}`}>
                  {formatCurrency(data.projected.profit)}
                </p>
                <div className={`flex items-center text-sm ${getValueColor(data.changes.profitChangePercent)}`}>
                  {getTrendIcon(data.changes.profitChangePercent)}
                  <span className="ml-1">{formatPercentage(data.changes.profitChangePercent)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Atual: {formatCurrency(data.current.profit)}
              </p>
            </div>
            
            {/* Margin Comparison */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Margem de Lucro</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-2xl font-semibold ${getValueColor(data.projected.profitMargin)}`}>
                  {data.projected.profitMargin.toFixed(1)}%
                </p>
                <div className={`flex items-center text-sm ${getValueColor(data.changes.marginChange)}`}>
                  {getTrendIcon(data.changes.marginChange)}
                  <span className="ml-1">{formatPercentage(data.changes.marginChange)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Atual: {data.current.profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comparativo de Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `R$${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                    {revenueComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#94a3b8" : "#4f46e5"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium">Variação: {formatCurrency(data.changes.revenueChange)}</p>
              <p className="text-xs text-muted-foreground">
                Projeção baseada nos ajustes de preço e crescimento de clientes
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Profit Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comparativo de Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `R$${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {profitComparisonData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 
                          ? (entry.value >= 0 ? "#86efac" : "#fca5a5") 
                          : (entry.value >= 0 ? "#16a34a" : "#dc2626")} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium">Variação: {formatCurrency(data.changes.profitChange)}</p>
              <p className="text-xs text-muted-foreground">
                Projeção considerando todos os ajustes em receitas e custos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Costs Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento de Custos</CardTitle>
          <CardDescription>
            Comparativo de custos por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={costsBreakdownData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `R$${value / 1000}k`} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="atual" name="Atual" fill="#94a3b8" />
                <Bar dataKey="projecao" name="Projeção" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Adjustments Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros da Simulação</CardTitle>
          <CardDescription>
            Ajustes aplicados para geração do cenário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price Adjustments */}
            <div className="space-y-4">
              <h4 className="text-base font-medium">Ajustes de Preço</h4>
              <div>
                <p className="text-sm text-muted-foreground">Ajuste de Preços no Cardápio</p>
                <p className={`text-base font-medium ${getValueColor(data.adjustments.menuPriceAdjustment)}`}>
                  {formatPercentage(data.adjustments.menuPriceAdjustment)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Variação do Ticket Médio</p>
                <p className={`text-base font-medium ${getValueColor(data.adjustments.averageTicketChange)}`}>
                  {formatPercentage(data.adjustments.averageTicketChange)}
                </p>
              </div>
            </div>
            
            {/* Cost Adjustments */}
            <div className="space-y-4">
              <h4 className="text-base font-medium">Ajustes de Custos</h4>
              <div>
                <p className="text-sm text-muted-foreground">Redução no Custo de Alimentos</p>
                <p className="text-base font-medium text-green-600">
                  {data.adjustments.foodCostReduction > 0 ? "-" : ""}
                  {formatPercentage(data.adjustments.foodCostReduction)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Variação no Custo de Mão de Obra</p>
                <p className={`text-base font-medium ${getValueColor(-data.adjustments.laborCostChange)}`}>
                  {formatPercentage(data.adjustments.laborCostChange)}
                </p>
              </div>
            </div>
            
            {/* Growth Adjustments */}
            <div className="space-y-4">
              <h4 className="text-base font-medium">Crescimento</h4>
              <div>
                <p className="text-sm text-muted-foreground">Investimento em Marketing</p>
                <p className={`text-base font-medium ${data.adjustments.marketingInvestment >= 0 ? "text-blue-600" : "text-green-600"}`}>
                  {formatPercentage(data.adjustments.marketingInvestment)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Crescimento de Clientes</p>
                <p className={`text-base font-medium ${getValueColor(data.adjustments.customerGrowth)}`}>
                  {formatPercentage(data.adjustments.customerGrowth)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

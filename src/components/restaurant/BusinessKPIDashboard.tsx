
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Users, 
  Clock,
  ArrowUp,
  ArrowDown 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { loadRestaurantConfig } from "@/utils/pricing-calculations";

interface KPI {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  status: "excellent" | "good" | "warning" | "critical";
  previousValue: number;
}

export function BusinessKPIDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const calculateKPIs = () => {
    const config = loadRestaurantConfig();
    
    // Simular dados reais (em produção, viria do banco de dados)
    const simulatedData = {
      monthlyRevenue: config.averageMonthlyRevenue || 50000,
      monthlyCosts: 35000,
      foodCost: 15000,
      customerCount: 1200,
      averageTicket: 41.67,
      operatingDays: 26
    };

    const kpiData: KPI[] = [
      {
        id: "revenue",
        label: "Receita Mensal",
        value: simulatedData.monthlyRevenue,
        target: 60000,
        unit: "currency",
        trend: simulatedData.monthlyRevenue > 45000 ? "up" : "down",
        status: simulatedData.monthlyRevenue >= 50000 ? "excellent" : 
                simulatedData.monthlyRevenue >= 40000 ? "good" : "warning",
        previousValue: 47000
      },
      {
        id: "profit_margin",
        label: "Margem de Lucro",
        value: ((simulatedData.monthlyRevenue - simulatedData.monthlyCosts) / simulatedData.monthlyRevenue) * 100,
        target: 25,
        unit: "percentage",
        trend: "up",
        status: "good",
        previousValue: 28
      },
      {
        id: "food_cost",
        label: "Food Cost %",
        value: (simulatedData.foodCost / simulatedData.monthlyRevenue) * 100,
        target: 30,
        unit: "percentage",
        trend: "down",
        status: "excellent",
        previousValue: 32
      },
      {
        id: "average_ticket",
        label: "Ticket Médio",
        value: simulatedData.averageTicket,
        target: 45,
        unit: "currency",
        trend: "up",
        status: "good",
        previousValue: 38.50
      },
      {
        id: "customer_count",
        label: "Clientes/Mês",
        value: simulatedData.customerCount,
        target: 1500,
        unit: "number",
        trend: "up",
        status: "good",
        previousValue: 1150
      },
      {
        id: "daily_revenue",
        label: "Receita/Dia",
        value: simulatedData.monthlyRevenue / simulatedData.operatingDays,
        target: 2500,
        unit: "currency",
        trend: "stable",
        status: "good",
        previousValue: 1800
      }
    ];

    setKpis(kpiData);
    setLastUpdate(new Date().toLocaleString());
  };

  useEffect(() => {
    calculateKPIs();
    
    // Atualizar a cada 5 minutos (em produção seria com dados reais)
    const interval = setInterval(calculateKPIs, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case "currency":
        return formatCurrency(value);
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "number":
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string, status: string) => {
    const colorClass = status === "excellent" || status === "good" ? "text-green-600" : "text-red-600";
    
    switch (trend) {
      case "up":
        return <ArrowUp className={`h-3 w-3 ${colorClass}`} />;
      case "down":
        return <ArrowDown className={`h-3 w-3 ${colorClass}`} />;
      default:
        return <div className="h-3 w-3" />;
    }
  };

  const getProgressPercentage = (value: number, target: number) => {
    return Math.min((value / target) * 100, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          KPIs do Negócio em Tempo Real
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Última atualização: {lastUpdate}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.id} className={`p-4 border ${getStatusColor(kpi.status)}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{kpi.label}</h4>
                  {getTrendIcon(kpi.trend, kpi.status)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatValue(kpi.value, kpi.unit)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Meta: {formatValue(kpi.target, kpi.unit)}
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={getProgressPercentage(kpi.value, kpi.target)} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {getProgressPercentage(kpi.value, kpi.target).toFixed(0)}% da meta
                    </span>
                    <span className="flex items-center gap-1">
                      Anterior: {formatValue(kpi.previousValue, kpi.unit)}
                    </span>
                  </div>
                </div>

                <div className="text-xs">
                  {kpi.status === "excellent" && (
                    <p className="text-green-700 font-medium">🎯 Excelente performance!</p>
                  )}
                  {kpi.status === "good" && (
                    <p className="text-blue-700 font-medium">👍 Dentro do esperado</p>
                  )}
                  {kpi.status === "warning" && (
                    <p className="text-yellow-700 font-medium">⚠️ Atenção necessária</p>
                  )}
                  {kpi.status === "critical" && (
                    <p className="text-red-700 font-medium">🚨 Ação urgente!</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Insights Automáticos</h4>
          <div className="text-sm text-blue-800 space-y-1">
            {kpis.some(k => k.status === "excellent") && (
              <p>• Seu food cost está excelente - mantenha o fornecedor atual</p>
            )}
            {kpis.some(k => k.status === "warning") && (
              <p>• Algumas métricas precisam de atenção - foque na receita diária</p>
            )}
            <p>• Tendência geral: {kpis.filter(k => k.trend === "up").length > kpis.filter(k => k.trend === "down").length ? "📈 Crescimento" : "📉 Precisa melhorar"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

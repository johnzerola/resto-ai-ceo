
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { EducationalTooltip } from "@/components/ui/educational-tooltip";
import { useSystemAudit } from "@/hooks/useSystemAudit";
import { useAuth } from "@/contexts/AuthContext";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  PieChart,
  BarChart3,
  Calculator,
  Lightbulb
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardMetrics {
  receita_bruta: number;
  cmv: number;
  lucro_bruto: number;
  despesas_operacionais: number;
  resultado_liquido: number;
  margem_bruta: number;
  margem_liquida: number;
  entries_count: number;
}

interface Insight {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action?: string;
  priority: number;
}

export function EnhancedDashboard() {
  const { currentRestaurant } = useAuth();
  const { getSystemStatus, getCriticalIssues, getWarnings } = useSystemAudit();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadDashboardData();
    }
  }, [currentRestaurant?.id]);

  const loadDashboardData = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      // Carregar métricas financeiras usando a função existente
      const { data, error } = await supabase.rpc('calcular_dre_mensal', {
        restaurant_uuid: currentRestaurant.id,
        mes_param: new Date().getMonth() + 1,
        ano_param: new Date().getFullYear()
      });

      if (error) throw error;

      // Usar a função melhorada do FinancialStorageService
      const { calculateEnhancedDRE } = await import('@/services/FinancialStorageService');
      const enhancedMetrics = await calculateEnhancedDRE(currentRestaurant.id);
      
      setMetrics(enhancedMetrics);
      generateInsights(enhancedMetrics);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = (metrics: DashboardMetrics) => {
    const newInsights: Insight[] = [];

    // Insight sobre CMV
    if (metrics.receita_bruta > 0) {
      const cmvPercentual = (metrics.cmv / metrics.receita_bruta) * 100;
      if (cmvPercentual > 35) {
        newInsights.push({
          type: 'error',
          title: 'CMV Alto',
          message: `Seu CMV está em ${cmvPercentual.toFixed(1)}%, acima do recomendado (30-35%). Considere renegociar com fornecedores ou revisar receitas.`,
          action: 'Revisar Custos',
          priority: 1
        });
      } else if (cmvPercentual < 25) {
        newInsights.push({
          type: 'success',
          title: 'CMV Excelente',
          message: `Seu CMV está em ${cmvPercentual.toFixed(1)}%, dentro da faixa ideal. Continue o bom trabalho!`,
          priority: 3
        });
      }
    }

    // Insight sobre margem líquida
    if (metrics.margem_liquida < 5) {
      newInsights.push({
        type: 'warning',
        title: 'Margem Baixa',
        message: `Margem líquida de ${metrics.margem_liquida.toFixed(1)}% está baixa. Foque em reduzir custos ou aumentar preços.`,
        action: 'Revisar Precificação',
        priority: 2
      });
    } else if (metrics.margem_liquida > 20) {
      newInsights.push({
        type: 'success',
        title: 'Margem Saudável',
        message: `Margem líquida de ${metrics.margem_liquida.toFixed(1)}% está excelente!`,
        priority: 4
      });
    }

    // Insight sobre dados insuficientes
    if (metrics.entries_count < 10) {
      newInsights.push({
        type: 'info',
        title: 'Poucos Dados',
        message: 'Registre mais transações para análises mais precisas.',
        action: 'Adicionar Transações',
        priority: 2
      });
    }

    // Insight sobre resultado líquido
    if (metrics.resultado_liquido < 0) {
      newInsights.push({
        type: 'error',
        title: 'Prejuízo Detectado',
        message: `Resultado líquido negativo de R$ ${Math.abs(metrics.resultado_liquido).toFixed(2)}. Ação urgente necessária.`,
        action: 'Plano de Ação',
        priority: 1
      });
    }

    // Ordenar por prioridade
    newInsights.sort((a, b) => a.priority - b.priority);
    setInsights(newInsights.slice(0, 5)); // Mostrar apenas os 5 mais importantes
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="animate-pulse h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do desempenho do seu restaurante
        </p>
      </div>

      {/* Insights Automáticos */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Insights Inteligentes
            </CardTitle>
            <CardDescription>
              Análises automáticas baseadas nos seus dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, index) => (
              <Alert key={index}>
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{insight.title}</h4>
                      {insight.action && (
                        <Button variant="outline" size="sm">
                          {insight.action}
                        </Button>
                      )}
                    </div>
                    <AlertDescription className="mt-1">
                      {insight.message}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Métricas Principais */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <EducationalTooltip
                title="Receita Bruta"
                content="Total de vendas antes de descontar custos e despesas"
                example="Se você vendeu R$ 10.000 no mês, essa é sua receita bruta"
              >
                <CardTitle className="text-sm font-medium">Receita Bruta</CardTitle>
              </EducationalTooltip>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.receita_bruta)}</div>
              <p className="text-xs text-muted-foreground">
                Base para todos os cálculos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <EducationalTooltip
                title="CMV (Custo de Mercadoria Vendida)"
                content="Custo dos ingredientes e produtos vendidos"
                example="Se gastou R$ 3.000 em ingredientes para vender R$ 10.000, seu CMV é 30%"
              >
                <CardTitle className="text-sm font-medium">CMV</CardTitle>
              </EducationalTooltip>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.cmv)}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{metrics.receita_bruta > 0 ? ((metrics.cmv / metrics.receita_bruta) * 100).toFixed(1) : 0}% da receita</span>
                <Badge variant={metrics.receita_bruta > 0 && (metrics.cmv / metrics.receita_bruta) * 100 > 35 ? "destructive" : "secondary"}>
                  {metrics.receita_bruta > 0 && (metrics.cmv / metrics.receita_bruta) * 100 > 35 ? "Alto" : "OK"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <EducationalTooltip
                title="Lucro Bruto"
                content="Receita menos CMV. Mostra quanto sobra após pagar os ingredientes"
                example="R$ 10.000 (receita) - R$ 3.000 (CMV) = R$ 7.000 de lucro bruto"
              >
                <CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle>
              </EducationalTooltip>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.lucro_bruto)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.margem_bruta > 0 ? `${metrics.margem_bruta.toFixed(1)}% de margem` : 'Margem negativa'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <EducationalTooltip
                title="Resultado Líquido"
                content="Lucro final após todos os custos e despesas"
                example="O que realmente sobra no final do mês para reinvestir ou retirar"
              >
                <CardTitle className="text-sm font-medium">Resultado Líquido</CardTitle>
              </EducationalTooltip>
              {metrics.resultado_liquido >= 0 ? 
                <TrendingUp className="h-4 w-4 text-green-500" /> : 
                <TrendingDown className="h-4 w-4 text-red-500" />
              }
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.resultado_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.resultado_liquido)}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.margem_liquida.toFixed(1)}% de margem líquida
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de Progressão das Metas */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Metas de Performance</CardTitle>
            <CardDescription>
              Acompanhe o progresso das suas metas mensais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Meta CMV (≤ 35%)</span>
                <span>{metrics.receita_bruta > 0 ? ((metrics.cmv / metrics.receita_bruta) * 100).toFixed(1) : 0}%</span>
              </div>
              <Progress 
                value={Math.min(100, metrics.receita_bruta > 0 ? ((metrics.cmv / metrics.receita_bruta) * 100) : 0)} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Meta Margem Líquida (≥ 15%)</span>
                <span>{metrics.margem_liquida.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(100, Math.max(0, metrics.margem_liquida * (100/15)))} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de Ação Rápida */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5" />
              Precificação
            </CardTitle>
            <CardDescription>
              Calcule preços ideais com base em custos e margens
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              DRE & CMV
            </CardTitle>
            <CardDescription>
              Análise detalhada de resultados e custos
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Metas
            </CardTitle>
            <CardDescription>
              Defina e acompanhe suas metas de negócio
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

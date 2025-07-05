
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingDown, TrendingUp, AlertTriangle, DollarSign, Target, Activity } from "lucide-react";
import { toast } from "sonner";
import { useAccountsPayable } from "@/hooks/useAccountsPayable";
import { useAccountsReceivable } from "@/hooks/useAccountsReceivable";

interface FinancialData {
  categoria: string;
  valor: number;
  percentual: number;
  tipo: 'receita' | 'despesa';
  cor: string;
}

interface GargaloOperacional {
  area: string;
  custo: number;
  retorno: number;
  eficiencia: number;
  status: 'critico' | 'atencao' | 'bom';
}

export function FinancialInsights() {
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [gargalos, setGargalos] = useState<GargaloOperacional[]>([]);
  const [kpis, setKpis] = useState({
    cmvReal: 0,
    cmvIdeal: 30,
    margemAtual: 0,
    margemIdeal: 25,
    despesasFixas: 0,
    despesasVariaveis: 0
  });

  const { getTotalPendente: getTotalPagar } = useAccountsPayable();
  const { getTotalPendente: getTotalReceber } = useAccountsReceivable();

  useEffect(() => {
    loadFinancialInsights();
  }, []);

  const loadFinancialInsights = async () => {
    setIsLoading(true);
    try {
      // Simular dados financeiros baseados no sistema atual
      const mockFinancialData: FinancialData[] = [
        { categoria: 'Aluguel', valor: 4500, percentual: 35, tipo: 'despesa', cor: '#ef4444' },
        { categoria: 'Pessoal', valor: 6200, percentual: 48, tipo: 'despesa', cor: '#f97316' },
        { categoria: 'Ingredientes', valor: 3800, percentual: 29, tipo: 'despesa', cor: '#eab308' },
        { categoria: 'Marketing', valor: 800, percentual: 6, tipo: 'despesa', cor: '#84cc16' },
        { categoria: 'Utilities', valor: 650, percentual: 5, tipo: 'despesa', cor: '#06b6d4' },
      ];

      const mockGargalos: GargaloOperacional[] = [
        {
          area: 'Cozinha',
          custo: 8500,
          retorno: 15000,
          eficiencia: 76,
          status: 'bom'
        },
        {
          area: 'Atendimento',
          custo: 4200,
          retorno: 5500,
          eficiencia: 31,
          status: 'critico'
        },
        {
          area: 'Delivery',
          custo: 2800,
          retorno: 7200,
          eficiencia: 157,
          status: 'bom'
        },
        {
          area: 'Marketing Digital',
          custo: 1200,
          retorno: 2100,
          eficiencia: 75,
          status: 'atencao'
        }
      ];

      // Simular KPIs baseados nos dados do cash flow
      const mockKpis = {
        cmvReal: 32.5,
        cmvIdeal: 30,
        margemAtual: 18.2,
        margemIdeal: 25,
        despesasFixas: 12850,
        despesasVariaveis: 4650
      };

      setFinancialData(mockFinancialData);
      setGargalos(mockGargalos);
      setKpis(mockKpis);

    } catch (error) {
      console.error('Erro ao carregar insights financeiros:', error);
      toast.error('Erro ao carregar insights financeiros');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getGargaloColor = (status: GargaloOperacional['status']) => {
    switch (status) {
      case 'critico': return '#ef4444';
      case 'atencao': return '#f97316';
      case 'bom': return '#10b981';
      default: return '#64748b';
    }
  };

  const getStatusBadgeVariant = (status: GargaloOperacional['status']) => {
    switch (status) {
      case 'critico': return 'destructive';
      case 'atencao': return 'secondary';
      case 'bom': return 'default';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <div className="h-64 bg-muted rounded animate-pulse"></div>
          <div className="h-64 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de KPIs Críticos */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CMV Real vs Ideal</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.cmvReal}% vs {kpis.cmvIdeal}%
            </div>
            <p className={`text-xs ${kpis.cmvReal > kpis.cmvIdeal ? 'text-red-600' : 'text-green-600'}`}>
              {kpis.cmvReal > kpis.cmvIdeal ? 
                `+${(kpis.cmvReal - kpis.cmvIdeal).toFixed(1)}% acima do ideal` : 
                `${(kpis.cmvIdeal - kpis.cmvReal).toFixed(1)}% dentro da meta`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Atual</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.margemAtual}%
            </div>
            <p className={`text-xs ${kpis.margemAtual < kpis.margemIdeal ? 'text-red-600' : 'text-green-600'}`}>
              Meta: {kpis.margemIdeal}%
              {kpis.margemAtual < kpis.margemIdeal && 
                ` (${(kpis.margemIdeal - kpis.margemAtual).toFixed(1)}% abaixo)`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(kpis.despesasFixas + kpis.despesasVariaveis)}
            </div>
            <p className="text-xs text-muted-foreground">
              Fixas: {formatCurrency(kpis.despesasFixas)} | Variáveis: {formatCurrency(kpis.despesasVariaveis)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Automáticos */}
      {(kpis.cmvReal > kpis.cmvIdeal || kpis.margemAtual < kpis.margemIdeal) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-red-800">
                ⚠️ Atenção: Indicadores financeiros críticos detectados
              </span>
              <div className="text-sm space-y-1">
                {kpis.cmvReal > kpis.cmvIdeal && (
                  <div>• CMV acima do ideal ({kpis.cmvReal}% vs {kpis.cmvIdeal}%) - Revise custos dos ingredientes</div>
                )}
                {kpis.margemAtual < kpis.margemIdeal && (
                  <div>• Margem abaixo da meta ({kpis.margemAtual}% vs {kpis.margemIdeal}%) - Ajuste preços ou reduza custos</div>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Gráficos lado a lado */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Gráfico de Maiores Despesas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Maiores Despesas
            </CardTitle>
            <CardDescription>
              Breakdown das principais categorias de gastos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financialData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ categoria, percentual }) => `${categoria}: ${percentual}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {financialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), "Valor"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {financialData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.cor }}
                    ></div>
                    <span>{item.categoria}</span>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(item.valor)} ({item.percentual}%)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Gargalos Operacionais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Gargalos Operacionais
            </CardTitle>
            <CardDescription>
              Eficiência por área (retorno vs custo)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gargalos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="area" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Custo' || name === 'Retorno') {
                        return [formatCurrency(Number(value)), name];
                      }
                      return [`${value}%`, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="custo" name="Custo" fill="#ef4444" />
                  <Bar dataKey="retorno" name="Retorno" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {gargalos.map((gargalo, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(gargalo.status)}>
                      {gargalo.area}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      Eficiência: {gargalo.eficiencia}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ROI: {((gargalo.retorno / gargalo.custo - 1) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Contas a Pagar/Receber */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">💸 Total a Pagar</CardTitle>
            <CardDescription>Contas em aberto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(getTotalPagar())}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Pagamentos pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">💰 Total a Receber</CardTitle>
            <CardDescription>Valores em aberto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalReceber())}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Recebimentos pendentes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

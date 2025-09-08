import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Package, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StockTrend {
  id: string;
  insumo_nome: string;
  estoque_atual: number;
  consumo_medio_diario: number;
  estoque_minimo: number;
  tendencia: 'acumulando' | 'normal' | 'risco_ruptura' | 'critico';
  dias_para_ruptura: number | null;
  categoria: string;
}

interface Ruptura {
  produto: string;
  data_ruptura: string;
  dias_sem_estoque: number;
  impacto_vendas: number;
}

export function StockTrendsDashboard() {
  const { currentRestaurant } = useAuth();
  const [trends, setTrends] = useState<StockTrend[]>([]);
  const [rupturas, setRupturas] = useState<Ruptura[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadStockTrends();
      loadRupturaHistory();
    }
  }, [currentRestaurant]);

  const loadStockTrends = async () => {
    try {
      // Primeiro executar a função de detecção de tendências
      const { error: detectError } = await supabase.rpc('detectar_tendencias_estoque', {
        restaurant_uuid: currentRestaurant?.id
      });

      if (detectError) {
        console.error('Erro ao detectar tendências:', detectError);
      }

      // Buscar dados das tendências com informações dos insumos
      const { data, error } = await supabase
        .from('tendencias_estoque')
        .select(`
          *,
          insumos (
            nome,
            categoria,
            estoque_atual,
            estoque_minimo,
            consumo_medio_diario
          )
        `)
        .eq('restaurant_id', currentRestaurant?.id)
        .eq('data_analise', new Date().toISOString().split('T')[0])
        .order('dias_para_ruptura', { ascending: true, nullsFirst: false });

      if (error) throw error;

      const trendsData = data?.map(item => ({
        id: item.id,
        insumo_nome: item.insumos?.nome || 'Produto',
        estoque_atual: item.insumos?.estoque_atual || 0,
        consumo_medio_diario: item.insumos?.consumo_medio_diario || 0,
        estoque_minimo: item.insumos?.estoque_minimo || 0,
        tendencia: item.tendencia as 'acumulando' | 'normal' | 'risco_ruptura' | 'critico',
        dias_para_ruptura: item.dias_para_ruptura,
        categoria: item.insumos?.categoria || 'Geral'
      })) || [];

      setTrends(trendsData);
    } catch (error) {
      console.error('Erro ao carregar tendências:', error);
      toast.error('Erro ao carregar análise de tendências');
    }
  };

  const loadRupturaHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('historico_rupturas')
        .select(`
          *,
          insumos (nome)
        `)
        .eq('restaurant_id', currentRestaurant?.id)
        .gte('data_ruptura', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('data_ruptura', { ascending: false });

      if (error) throw error;

      const rupturasData = data?.map(item => ({
        produto: item.insumos?.nome || 'Produto',
        data_ruptura: item.data_ruptura,
        dias_sem_estoque: item.dias_sem_estoque,
        impacto_vendas: item.impacto_vendas || 0
      })) || [];

      setRupturas(rupturasData);
    } catch (error) {
      console.error('Erro ao carregar histórico de rupturas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendColor = (tendencia: string) => {
    switch (tendencia) {
      case 'critico': return '#ef4444';
      case 'risco_ruptura': return '#f59e0b';
      case 'acumulando': return '#3b82f6';
      case 'normal': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTrendBadge = (tendencia: string) => {
    const variants = {
      critico: 'destructive',
      risco_ruptura: 'secondary',
      acumulando: 'default',
      normal: 'outline'
    } as const;

    const labels = {
      critico: '🔴 Crítico',
      risco_ruptura: '🟡 Risco',
      acumulando: '🔵 Acumulando',
      normal: '🟢 Normal'
    };

    return (
      <Badge variant={variants[tendencia as keyof typeof variants] || 'outline'}>
        {labels[tendencia as keyof typeof labels] || tendencia}
      </Badge>
    );
  };

  const criticalItems = trends.filter(t => t.tendencia === 'critico').length;
  const riskItems = trends.filter(t => t.tendencia === 'risco_ruptura').length;
  const accumulatingItems = trends.filter(t => t.tendencia === 'acumulando').length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas Críticos */}
      {criticalItems > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-red-800">
                ⚠️ {criticalItems} produto(s) em situação crítica de estoque!
              </span>
              <div className="text-sm text-red-700">
                Estes produtos podem causar ruptura nas próximas 48h.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Resumo */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
            <p className="text-xs text-muted-foreground">produtos zerados/críticos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{riskItems}</div>
            <p className="text-xs text-muted-foreground">risco próx. 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acumulando</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{accumulatingItems}</div>
            <p className="text-xs text-muted-foreground">estoque excessivo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rupturas (30d)</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{rupturas.length}</div>
            <p className="text-xs text-muted-foreground">produtos sem estoque</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tendências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Análise de Tendências por Produto
          </CardTitle>
          <CardDescription>
            Dias restantes para ruptura baseado no consumo atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="insumo_nome" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis label={{ value: 'Dias', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      value === null ? 'Sem dados' : `${value} dias`,
                      'Dias para ruptura'
                    ]}
                    labelFormatter={(label) => `Produto: ${label}`}
                  />
                  <Bar dataKey="dias_para_ruptura" name="Dias para ruptura">
                    {trends.slice(0, 15).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getTrendColor(entry.tendencia)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Situação Detalhada do Estoque</CardTitle>
          <CardDescription>
            Análise completa de todos os produtos por tendência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Produto</th>
                  <th className="text-right p-2">Estoque Atual</th>
                  <th className="text-right p-2">Mínimo</th>
                  <th className="text-right p-2">Consumo/dia</th>
                  <th className="text-right p-2">Dias p/ ruptura</th>
                  <th className="text-center p-2">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((trend, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{trend.insumo_nome}</td>
                    <td className="text-right p-2">{trend.estoque_atual}</td>
                    <td className="text-right p-2">{trend.estoque_minimo}</td>
                    <td className="text-right p-2">{trend.consumo_medio_diario.toFixed(1)}</td>
                    <td className="text-right p-2">
                      {trend.dias_para_ruptura !== null ? (
                        <span className={trend.dias_para_ruptura <= 7 ? 'text-red-600 font-bold' : ''}>
                          {trend.dias_para_ruptura}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </td>
                    <td className="text-center p-2">
                      {getTrendBadge(trend.tendencia)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Rupturas */}
      {rupturas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Histórico de Rupturas (Últimos 30 dias)
            </CardTitle>
            <CardDescription>
              Produtos que ficaram sem estoque recentemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rupturas.map((ruptura, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <div>
                    <p className="font-medium text-red-900">{ruptura.produto}</p>
                    <p className="text-sm text-red-700">
                      {new Date(ruptura.data_ruptura).toLocaleDateString('pt-BR')} - 
                      {ruptura.dias_sem_estoque} dia(s) sem estoque
                    </p>
                  </div>
                  {ruptura.impacto_vendas > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-red-800">Impacto estimado:</p>
                      <p className="font-bold text-red-900">
                        -R$ {ruptura.impacto_vendas.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
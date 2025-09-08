import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { Target, TrendingUp, DollarSign, AlertTriangle, Calendar, Calculator, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BreakEvenData {
  produto: string;
  custo_total: number;
  preco_sugerido: number;
  preco_praticado: number;
  ponto_equilibrio_unidades: number;
  margem_contribuicao: number;
  margem_contribuicao_percentual: number;
  status_viabilidade: string;
  vendas_necessarias_mes: number;
  categoria: string;
}

interface FinancialSummary {
  custos_fixos_mes: number;
  receita_necessaria_equilibrio: number;
  margem_contribuicao_media: number;
  produtos_viavel: number;
  produtos_critico: number;
  total_produtos: number;
}

export function EnhancedBreakEvenDashboard() {
  const { currentRestaurant } = useAuth();
  const [breakEvenData, setBreakEvenData] = useState<BreakEvenData[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    custos_fixos_mes: 0,
    receita_necessaria_equilibrio: 0,
    margem_contribuicao_media: 0,
    produtos_viavel: 0,
    produtos_critico: 0,
    total_produtos: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadBreakEvenData();
    }
  }, [currentRestaurant]);

  const loadBreakEvenData = async () => {
    try {
      // Buscar configurações do restaurante
      const { data: config, error: configError } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant?.id)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      // Buscar dados dos pratos
      const { data: pratos, error: pratosError } = await supabase
        .from('pratos')
        .select('*')
        .eq('restaurant_id', currentRestaurant?.id)
        .eq('ativo', true);

      if (pratosError) throw pratosError;

      const custosFixosMes = config?.despesas_fixas_mensais || 8000;
      
      const breakEvenCalcs: BreakEvenData[] = [];
      let produtosViavel = 0;
      let produtosCritico = 0;
      let somaMargemContribuicao = 0;

      pratos?.forEach(prato => {
        const custoTotal = prato.custo_total || 0;
        const precoSugerido = prato.preco_sugerido || 0;
        const precoPraticado = prato.preco_praticado || precoSugerido;
        
        const margemContribuicao = precoPraticado - custoTotal;
        const margemContribuicaoPercentual = precoPraticado > 0 ? (margemContribuicao / precoPraticado) * 100 : 0;
        
        // Ponto de equilíbrio individual (considerando apenas este produto)
        const pontoEquilibrioUnidades = margemContribuicao > 0 ? Math.ceil(custosFixosMes / margemContribuicao) : 0;
        const vendasNecessariasMes = pontoEquilibrioUnidades * precoPraticado;
        
        // Status de viabilidade
        let statusViabilidade = 'saudavel';
        if (margemContribuicaoPercentual < 0) {
          statusViabilidade = 'prejuizo';
          produtosCritico++;
        } else if (margemContribuicaoPercentual < 20) {
          statusViabilidade = 'margem_baixa';
          produtosCritico++;
        } else {
          produtosViavel++;
        }

        somaMargemContribuicao += margemContribuicaoPercentual;

        breakEvenCalcs.push({
          produto: prato.nome_prato,
          custo_total: custoTotal,
          preco_sugerido: precoSugerido,
          preco_praticado: precoPraticado,
          ponto_equilibrio_unidades: pontoEquilibrioUnidades,
          margem_contribuicao: margemContribuicao,
          margem_contribuicao_percentual: margemContribuicaoPercentual,
          status_viabilidade: statusViabilidade,
          vendas_necessarias_mes: vendasNecessariasMes,
          categoria: prato.categoria || 'Geral'
        });
      });

      // Calcular receita total necessária para equilíbrio
      const receitaNecessariaEquilibrio = breakEvenCalcs.reduce((acc, item) => acc + item.vendas_necessarias_mes, 0);
      const margemContribuicaoMedia = breakEvenCalcs.length > 0 ? somaMargemContribuicao / breakEvenCalcs.length : 0;

      setBreakEvenData(breakEvenCalcs.sort((a, b) => a.margem_contribuicao_percentual - b.margem_contribuicao_percentual));
      setFinancialSummary({
        custos_fixos_mes: custosFixosMes,
        receita_necessaria_equilibrio: receitaNecessariaEquilibrio,
        margem_contribuicao_media: margemContribuicaoMedia,
        produtos_viavel: produtosViavel,
        produtos_critico: produtosCritico,
        total_produtos: breakEvenCalcs.length
      });

    } catch (error) {
      console.error('Erro ao carregar dados de break-even:', error);
      toast.error('Erro ao carregar análise de ponto de equilíbrio');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prejuizo': return '#ef4444';
      case 'margem_baixa': return '#f59e0b';
      case 'saudavel': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      prejuizo: 'destructive',
      margem_baixa: 'secondary',
      saudavel: 'default'
    } as const;

    const labels = {
      prejuizo: '🔴 Prejuízo',
      margem_baixa: '🟡 Margem Baixa',
      saudavel: '🟢 Saudável'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const pieData = [
    { name: 'Saudáveis', value: financialSummary.produtos_viavel, color: '#10b981' },
    { name: 'Críticos', value: financialSummary.produtos_critico, color: '#ef4444' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
      {financialSummary.produtos_critico > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-red-800">
                ⚠️ {financialSummary.produtos_critico} produto(s) com viabilidade crítica!
              </span>
              <div className="text-sm text-red-700">
                Estes produtos podem estar gerando prejuízo ou margem muito baixa.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Resumo */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Fixos/Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(financialSummary.custos_fixos_mes)}
            </div>
            <p className="text-xs text-muted-foreground">despesas mensais fixas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita p/ Equilíbrio</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(financialSummary.receita_necessaria_equilibrio)}
            </div>
            <p className="text-xs text-muted-foreground">meta mensal mínima</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {financialSummary.margem_contribuicao_media.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">contribuição média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Viáveis</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {financialSummary.produtos_viavel}/{financialSummary.total_produtos}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((financialSummary.produtos_viavel / Math.max(financialSummary.total_produtos, 1)) * 100)}% saudáveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Gráfico de Margem de Contribuição */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Margem de Contribuição por Produto
            </CardTitle>
            <CardDescription>
              Margem de contribuição percentual de cada produto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[400px] h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakEvenData.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="produto" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={10}
                    />
                    <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Margem de Contribuição']}
                    />
                    <Bar dataKey="margem_contribuicao_percentual" name="Margem %">
                      {breakEvenData.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStatusColor(entry.status_viabilidade)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Status dos Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Status de Viabilidade
            </CardTitle>
            <CardDescription>
              Distribuição dos produtos por status financeiro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm">Saudáveis ({financialSummary.produtos_viavel})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm">Críticos ({financialSummary.produtos_critico})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada de Break-Even</CardTitle>
          <CardDescription>
            Ponto de equilíbrio e margem de contribuição por produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Produto</th>
                  <th className="text-right p-2">Custo</th>
                  <th className="text-right p-2">Preço Atual</th>
                  <th className="text-right p-2">Margem R$</th>
                  <th className="text-right p-2">Margem %</th>
                  <th className="text-right p-2">Break-Even (un/mês)</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {breakEvenData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{item.produto}</td>
                    <td className="text-right p-2">{formatCurrency(item.custo_total)}</td>
                    <td className="text-right p-2">{formatCurrency(item.preco_praticado)}</td>
                    <td className="text-right p-2">
                      <span className={item.margem_contribuicao < 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                        {formatCurrency(item.margem_contribuicao)}
                      </span>
                    </td>
                    <td className="text-right p-2">
                      <span className={item.margem_contribuicao_percentual < 20 ? 'text-red-600 font-bold' : 'text-green-600'}>
                        {item.margem_contribuicao_percentual.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right p-2">
                      {item.ponto_equilibrio_unidades.toLocaleString()}
                    </td>
                    <td className="text-center p-2">
                      {getStatusBadge(item.status_viabilidade)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-800">
            {financialSummary.margem_contribuicao_media < 25 && (
              <p>• <strong>Margem baixa:</strong> Considere aumentar preços ou reduzir custos dos ingredientes</p>
            )}
            {financialSummary.produtos_critico > 0 && (
              <p>• <strong>Produtos críticos:</strong> {financialSummary.produtos_critico} produto(s) precisam de revisão urgente de preços</p>
            )}
            {financialSummary.receita_necessaria_equilibrio > 0 && (
              <p>• <strong>Meta mensal:</strong> Você precisa faturar pelo menos {formatCurrency(financialSummary.receita_necessaria_equilibrio)} para cobrir custos fixos</p>
            )}
            <p>• <strong>Foco:</strong> Priorise venda dos produtos com maior margem de contribuição</p>
            <p>• <strong>Controle:</strong> Monitore custos fixos mensalmente - eles impactam diretamente o ponto de equilíbrio</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
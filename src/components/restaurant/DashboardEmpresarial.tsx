
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface DashboardData {
  receitaHoje: number;
  metaHoje: number;
  pratosVendidosHoje: number;
  metaPratosHoje: number;
  ticketMedio: number;
  margemLucro: number;
  pontoEquilibrio: number;
  diasParaEquilibrio: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function DashboardEmpresarial() {
  const { currentRestaurant } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    receitaHoje: 0,
    metaHoje: 0,
    pratosVendidosHoje: 0,
    metaPratosHoje: 0,
    ticketMedio: 0,
    margemLucro: 0,
    pontoEquilibrio: 0,
    diasParaEquilibrio: 0
  });
  
  const [tendenciaVendas, setTendenciaVendas] = useState<any[]>([]);
  const [distribuicaoCustos, setDistribuicaoCustos] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarDashboard();
    }
  }, [currentRestaurant]);

  const carregarDashboard = async () => {
    if (!currentRestaurant?.id) return;

    try {
      setIsLoading(true);
      
      // Carregar configurações
      const { data: config } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      // Carregar meta de hoje
      const hoje = new Date().toISOString().split('T')[0];
      const { data: metaHoje } = await supabase
        .from('metas_vendas')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .eq('data_meta', hoje)
        .single();

      // Carregar vendas dos últimos 7 dias
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      
      const { data: vendasSemana } = await supabase
        .from('metas_vendas')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .gte('data_meta', seteDiasAtras.toISOString().split('T')[0])
        .order('data_meta', { ascending: true });

      // Processar dados
      if (config && metaHoje) {
        const ticketMedio = config.custo_medio_por_prato * (config.markup_padrao / 100);
        const margemContribuicao = ticketMedio * (config.margem_lucro_esperada / 100);
        const pontoEquilibrio = margemContribuicao > 0 ? 
          Math.ceil(config.despesas_fixas_mensais / margemContribuicao) : 0;

        setDashboardData({
          receitaHoje: metaHoje.receita_real_dia,
          metaHoje: metaHoje.meta_receita_dia,
          pratosVendidosHoje: metaHoje.pratos_vendidos_dia,
          metaPratosHoje: metaHoje.meta_pratos_dia,
          ticketMedio,
          margemLucro: config.margem_lucro_esperada,
          pontoEquilibrio,
          diasParaEquilibrio: Math.ceil(pontoEquilibrio / (metaHoje.meta_pratos_dia || 1))
        });

        // Preparar dados para gráficos
        if (vendasSemana) {
          const dadosGrafico = vendasSemana.map(venda => ({
            dia: new Date(venda.data_meta).toLocaleDateString('pt-BR', { weekday: 'short' }),
            meta: venda.meta_receita_dia,
            real: venda.receita_real_dia,
            percentual: venda.percentual_atingido
          }));
          setTendenciaVendas(dadosGrafico);
        }

        // Distribuição de custos
        const totalCustos = config.despesas_fixas_mensais + config.despesas_variaveis_mensais;
        const custosDistribuicao = [
          { name: 'Custos Fixos', value: config.despesas_fixas_mensais, percentage: (config.despesas_fixas_mensais / totalCustos * 100) },
          { name: 'Custos Variáveis', value: config.despesas_variaveis_mensais, percentage: (config.despesas_variaveis_mensais / totalCustos * 100) },
          { name: 'Impostos', value: config.receita_mensal_esperada * (config.taxa_impostos / 100), percentage: config.taxa_impostos },
          { name: 'Taxas Delivery', value: config.receita_mensal_esperada * ((config.taxa_ifood + config.taxa_entrega) / 100), percentage: config.taxa_ifood + config.taxa_entrega }
        ];
        setDistribuicaoCustos(custosDistribuicao);

        // Gerar alertas
        const novosAlertas: string[] = [];
        
        if (metaHoje.percentual_atingido < 50) {
          novosAlertas.push("🚨 Meta do dia muito abaixo do esperado");
        }
        
        if (config.despesas_fixas_mensais > config.receita_mensal_esperada * 0.6) {
          novosAlertas.push("⚠️ Custos fixos muito altos para a receita esperada");
        }
        
        if (pontoEquilibrio > config.pratos_vendidos_dia_meta * 30) {
          novosAlertas.push("⚠️ Ponto de equilíbrio alto - revisar custos ou preços");
        }

        setAlertas(novosAlertas);
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const percentualMetaHoje = dashboardData.metaHoje > 0 ? 
    (dashboardData.receitaHoje / dashboardData.metaHoje) * 100 : 0;

  const percentualPratosHoje = dashboardData.metaPratosHoje > 0 ? 
    (dashboardData.pratosVendidosHoje / dashboardData.metaPratosHoje) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {alertas.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {alertas.map((alerta, index) => (
                <div key={index}>{alerta}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Hoje</p>
                <p className="text-2xl font-bold">
                  R$ {dashboardData.receitaHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Meta: R$ {dashboardData.metaHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex flex-col items-center">
                {percentualMetaHoje >= 100 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
                <Badge variant={percentualMetaHoje >= 100 ? "default" : "destructive"}>
                  {percentualMetaHoje.toFixed(0)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pratos Vendidos</p>
                <p className="text-2xl font-bold">{dashboardData.pratosVendidosHoje}</p>
                <p className="text-xs text-muted-foreground">
                  Meta: {dashboardData.metaPratosHoje}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <Badge variant={percentualPratosHoje >= 100 ? "default" : "secondary"}>
                  {percentualPratosHoje.toFixed(0)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">
                  R$ {dashboardData.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Margem: {dashboardData.margemLucro}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ponto Equilíbrio</p>
                <p className="text-2xl font-bold">{dashboardData.pontoEquilibrio}</p>
                <p className="text-xs text-muted-foreground">
                  pratos/mês ({dashboardData.diasParaEquilibrio} dias)
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tendencia" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tendencia">Tendência de Vendas</TabsTrigger>
          <TabsTrigger value="custos">Distribuição de Custos</TabsTrigger>
        </TabsList>

        <TabsContent value="tendencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendas dos Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tendenciaVendas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        name === 'meta' ? 'Meta' : 'Realizado'
                      ]}
                    />
                    <Line type="monotone" dataKey="meta" stroke="#8884d8" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="real" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Custos e Taxas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={distribuicaoCustos}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percentage}) => `${name}: ${percentage.toFixed(1)}%`}
                      >
                        {distribuicaoCustos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  {distribuicaoCustos.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

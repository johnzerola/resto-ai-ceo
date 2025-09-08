import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  TrendingUp, 
  Calculator, 
  Target, 
  Calendar, 
  DollarSign, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProjecaoData {
  month: string;
  receita: number;
  despesas: number;
  lucro: number;
  margem: number;
  mesNumero: number;
}

interface ProjecaoSalva {
  id: string;
  nome_projecao: string;
  receita_mensal_atual: number;
  despesas_mensais_atuais: number;
  taxa_crescimento_anual: number;
  periodo_meses: number;
  receita_projetada_final: number;
  lucro_projetado_final: number;
  margem_final_percentual: number;
  dados_mensais: any;
  cenario_selecionado: string;
  observacoes?: string;
  created_at: string;
}

export function ProjecoesInteligentes() {
  const { currentRestaurant } = useAuth();
  
  // Estados dos parâmetros
  const [parameters, setParameters] = useState({
    currentRevenue: 0,
    currentExpenses: 0,
    growthRate: 5,
    targetMargin: 20,
    forecastMonths: 12
  });

  // Estados dos dados
  const [forecastData, setForecastData] = useState<ProjecaoData[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [projecoesSalvas, setProjecoesSalvas] = useState<ProjecaoSalva[]>([]);
  
  // Estados de interface
  const [nomeProjecao, setNomeProjecao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  useEffect(() => {
    if (currentRestaurant?.id) {
      loadCurrentDataFromSupabase();
      loadProjecoesSalvas();
    }
  }, [currentRestaurant]);

  useEffect(() => {
    generateForecast();
    generateScenarios();
  }, [parameters]);

  const loadCurrentDataFromSupabase = async () => {
    if (!currentRestaurant?.id) return;
    
    setCarregando(true);
    try {
      // Buscar dados do fluxo de caixa dos últimos 3 meses
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const { data: cashFlowData, error } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .gte('date', threeMonthsAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      if (cashFlowData && cashFlowData.length > 0) {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        // Calcular médias dos últimos 3 meses
        const revenue = cashFlowData
          .filter(entry => entry.type === 'income')
          .reduce((sum, entry) => sum + entry.amount, 0) / 3;

        const expenses = cashFlowData
          .filter(entry => entry.type === 'expense')
          .reduce((sum, entry) => sum + entry.amount, 0) / 3;

        setParameters(prev => ({
          ...prev,
          currentRevenue: Math.round(revenue),
          currentExpenses: Math.round(expenses)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do Supabase:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setCarregando(false);
    }
  };

  const loadProjecoesSalvas = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('projecoes_financeiras')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjecoesSalvas((data || []).map(item => ({
        ...item,
        dados_mensais: Array.isArray(item.dados_mensais) ? item.dados_mensais : []
      })));
    } catch (error) {
      console.error('Erro ao carregar projeções salvas:', error);
    }
  };

  const generateForecast = () => {
    const data: ProjecaoData[] = [];
    const monthlyGrowthRate = parameters.growthRate / 100 / 12;
    
    for (let i = 0; i <= parameters.forecastMonths; i++) {
      const projectedRevenue = parameters.currentRevenue * Math.pow(1 + monthlyGrowthRate, i);
      const projectedExpenses = parameters.currentExpenses * Math.pow(1 + (monthlyGrowthRate * 0.8), i);
      const projectedProfit = projectedRevenue - projectedExpenses;
      
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      data.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        receita: Math.round(projectedRevenue),
        despesas: Math.round(projectedExpenses),
        lucro: Math.round(projectedProfit),
        margem: projectedRevenue > 0 ? Number(((projectedProfit / projectedRevenue) * 100).toFixed(1)) : 0,
        mesNumero: i + 1
      });
    }
    
    setForecastData(data);
  };

  const generateScenarios = () => {
    const baseRevenue = parameters.currentRevenue;
    const baseExpenses = parameters.currentExpenses;
    
    const scenarioList = [
      {
        name: "Conservador",
        description: "Crescimento de 2% a.a.",
        growthRate: 2,
        color: "bg-blue-100 text-blue-800",
        revenue: baseRevenue * Math.pow(1.02, parameters.forecastMonths / 12),
        expenses: baseExpenses * Math.pow(1.01, parameters.forecastMonths / 12),
      },
      {
        name: "Moderado",
        description: "Crescimento de 5% a.a.",
        growthRate: 5,
        color: "bg-green-100 text-green-800",
        revenue: baseRevenue * Math.pow(1.05, parameters.forecastMonths / 12),
        expenses: baseExpenses * Math.pow(1.03, parameters.forecastMonths / 12),
      },
      {
        name: "Otimista",
        description: "Crescimento de 10% a.a.",
        growthRate: 10,
        color: "bg-purple-100 text-purple-800",
        revenue: baseRevenue * Math.pow(1.10, parameters.forecastMonths / 12),
        expenses: baseExpenses * Math.pow(1.05, parameters.forecastMonths / 12),
      }
    ];

    const calculatedScenarios = scenarioList.map(scenario => ({
      ...scenario,
      profit: scenario.revenue - scenario.expenses,
      margin: scenario.revenue > 0 ? ((scenario.revenue - scenario.expenses) / scenario.revenue * 100).toFixed(1) : 0,
      totalProfitYear: (scenario.revenue - scenario.expenses) * 12
    }));

    setScenarios(calculatedScenarios);
  };

  const salvarProjecao = async () => {
    if (!currentRestaurant?.id || !nomeProjecao.trim()) {
      toast.error('Preencha o nome da projeção');
      return;
    }

    if (forecastData.length === 0) {
      toast.error('Gere as projeções antes de salvar');
      return;
    }

    setSalvando(true);
    try {
      const finalData = forecastData[forecastData.length - 1];
      
      const projecaoData = {
        restaurant_id: currentRestaurant.id,
        nome_projecao: nomeProjecao,
        receita_mensal_atual: parameters.currentRevenue,
        despesas_mensais_atuais: parameters.currentExpenses,
        taxa_crescimento_anual: parameters.growthRate,
        periodo_meses: parameters.forecastMonths,
        receita_projetada_final: finalData.receita,
        lucro_projetado_final: finalData.lucro,
        margem_final_percentual: finalData.margem,
        dados_mensais: JSON.parse(JSON.stringify(forecastData)),
        cenario_selecionado: 'moderado',
        observacoes: observacoes || null
      };

      const { error } = await supabase
        .from('projecoes_financeiras')
        .insert(projecaoData);

      if (error) throw error;

      toast.success('✅ Projeção salva com sucesso!', {
        description: `${nomeProjecao} - Receita final: R$${finalData.receita.toLocaleString()} | Lucro: R$${finalData.lucro.toLocaleString()}`
      });

      // Reset e fechar dialog
      setNomeProjecao('');
      setObservacoes('');
      setShowSaveDialog(false);
      
      // Recarregar projeções salvas
      await loadProjecoesSalvas();

    } catch (error) {
      console.error('Erro ao salvar projeção:', error);
      toast.error('❌ Erro ao salvar projeção');
    } finally {
      setSalvando(false);
    }
  };

  const excluirProjecao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projecoes_financeiras')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Projeção excluída com sucesso');
      await loadProjecoesSalvas();
    } catch (error) {
      console.error('Erro ao excluir projeção:', error);
      toast.error('Erro ao excluir projeção');
    }
  };

  const carregarProjecao = (projecao: ProjecaoSalva) => {
    setParameters({
      currentRevenue: projecao.receita_mensal_atual,
      currentExpenses: projecao.despesas_mensais_atuais,
      growthRate: projecao.taxa_crescimento_anual,
      targetMargin: projecao.margem_final_percentual,
      forecastMonths: projecao.periodo_meses
    });
    
    setForecastData(projecao.dados_mensais);
    toast.success(`Projeção "${projecao.nome_projecao}" carregada`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calcular totais anuais
  const totaisAnuais = {
    receitaTotal: forecastData.reduce((sum, item) => sum + item.receita, 0),
    despesasTotal: forecastData.reduce((sum, item) => sum + item.despesas, 0),
    lucroTotal: forecastData.reduce((sum, item) => sum + item.lucro, 0),
    margemMedia: forecastData.length > 0 ? 
      forecastData.reduce((sum, item) => sum + item.margem, 0) / forecastData.length : 0
  };

  return (
    <div className="w-full space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Projeções Inteligentes
          </h2>
          <p className="text-muted-foreground">
            Baseado nos dados reais do seu fluxo de caixa
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCurrentDataFromSupabase} disabled={carregando}>
            <RefreshCw className={`h-4 w-4 mr-2 ${carregando ? 'animate-spin' : ''}`} />
            Atualizar Dados
          </Button>
          
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button disabled={forecastData.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Projeção
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Salvar Projeção Financeira</DialogTitle>
                <DialogDescription>
                  Salve esta projeção para consultar posteriormente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeProjecao">Nome da Projeção *</Label>
                  <Input
                    id="nomeProjecao"
                    value={nomeProjecao}
                    onChange={(e) => setNomeProjecao(e.target.value)}
                    placeholder="Ex: Projeção Janeiro 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Observações opcionais"
                  />
                </div>
                
                {/* Resumo da projeção */}
                {forecastData.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <h4 className="font-medium">Resumo da Projeção:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Receita Final: {formatCurrency(forecastData[forecastData.length - 1]?.receita || 0)}</div>
                      <div>Lucro Final: {formatCurrency(forecastData[forecastData.length - 1]?.lucro || 0)}</div>
                      <div>Período: {parameters.forecastMonths} meses</div>
                      <div>Taxa: {parameters.growthRate}% a.a.</div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={salvarProjecao} disabled={salvando || !nomeProjecao.trim()}>
                  {salvando ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alertas */}
      {carregando && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertTitle>Carregando dados</AlertTitle>
          <AlertDescription>
            Buscando dados do fluxo de caixa para calcular projeções...
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="parametros" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="parametros">Parâmetros</TabsTrigger>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
          <TabsTrigger value="projecoes">Projeções</TabsTrigger>
          <TabsTrigger value="salvas">Projeções Salvas</TabsTrigger>
        </TabsList>

        <TabsContent value="parametros" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros da Projeção</CardTitle>
              <CardDescription>
                Configure os parâmetros para gerar projeções personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentRevenue">Receita Mensal Atual (R$)</Label>
                  <Input
                    id="currentRevenue"
                    type="number"
                    value={parameters.currentRevenue}
                    onChange={(e) => setParameters(prev => ({ ...prev, currentRevenue: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentExpenses">Despesas Mensais Atuais (R$)</Label>
                  <Input
                    id="currentExpenses"
                    type="number"
                    value={parameters.currentExpenses}
                    onChange={(e) => setParameters(prev => ({ ...prev, currentExpenses: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="growthRate">Taxa de Crescimento Anual (%)</Label>
                  <Input
                    id="growthRate"
                    type="number"
                    value={parameters.growthRate}
                    onChange={(e) => setParameters(prev => ({ ...prev, growthRate: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forecastMonths">Período de Projeção (meses)</Label>
                  <Input
                    id="forecastMonths"
                    type="number"
                    min="3"
                    max="24"
                    value={parameters.forecastMonths}
                    onChange={(e) => setParameters(prev => ({ ...prev, forecastMonths: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resultados" className="space-y-4">
          {/* Cenários */}
          <div className="grid gap-4 md:grid-cols-3">
            {scenarios.map((scenario, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <Badge className={scenario.color}>
                      {scenario.growthRate}% a.a.
                    </Badge>
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receita Final:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(scenario.revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lucro Final:</span>
                      <span className="font-medium">
                        {formatCurrency(scenario.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Margem:</span>
                      <span className="font-medium">{scenario.margin}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lucro Anual:</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(scenario.totalProfitYear)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Totais Consolidados Anuais */}
          <Card>
            <CardHeader>
              <CardTitle>Resultado Anual Consolidado</CardTitle>
              <CardDescription>
                Totais projetados para {parameters.forecastMonths} meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totaisAnuais.receitaTotal)}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Despesas Total</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totaisAnuais.despesasTotal)}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Lucro Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totaisAnuais.lucroTotal)}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Margem Média</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totaisAnuais.margemMedia.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projecoes" className="space-y-4">
          {/* Gráfico */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal Projetada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="receita" 
                      stroke="#10b981" 
                      name="Receita" 
                      strokeWidth={3} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="despesas" 
                      stroke="#ef4444" 
                      name="Despesas" 
                      strokeWidth={3} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lucro" 
                      stroke="#3b82f6" 
                      name="Lucro" 
                      strokeWidth={3} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de projeções mensais */}
          <Card>
            <CardHeader>
              <CardTitle>Tabela de Projeções Mensais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Mês</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Receita</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Despesas</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Lucro</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-200 px-4 py-2 font-medium">
                          {item.month}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-right text-green-600">
                          {formatCurrency(item.receita)}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-right text-red-600">
                          {formatCurrency(item.despesas)}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-right text-blue-600 font-medium">
                          {formatCurrency(item.lucro)}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-right">
                          {item.margem.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salvas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Projeções Salvas</span>
                <Badge variant="secondary">{projecoesSalvas.length} projeções</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projecoesSalvas.length > 0 ? (
                <div className="space-y-4">
                  {projecoesSalvas.map((projecao) => (
                    <div key={projecao.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{projecao.nome_projecao}</h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => carregarProjecao(projecao)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Carregar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => excluirProjecao(projecao.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid gap-2 text-sm md:grid-cols-4">
                        <div>
                          <span className="text-muted-foreground">Receita Final:</span><br />
                          <span className="font-medium text-green-600">
                            {formatCurrency(projecao.receita_projetada_final)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lucro Final:</span><br />
                          <span className="font-medium text-blue-600">
                            {formatCurrency(projecao.lucro_projetado_final)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Período:</span><br />
                          <span className="font-medium">{projecao.periodo_meses} meses</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Taxa:</span><br />
                          <span className="font-medium">{projecao.taxa_crescimento_anual}% a.a.</span>
                        </div>
                      </div>
                      
                      {projecao.observacoes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <strong>Observações:</strong> {projecao.observacoes}
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        Criado em: {new Date(projecao.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma projeção salva</h3>
                  <p>Configure os parâmetros e salve sua primeira projeção</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calculator, Package, FileDown, AlertTriangle, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import jsPDF from 'jspdf';

interface CMVData {
  cmv_total: number;
  cmv_percentual: number;
  custo_alimentos: number;
  custo_bebidas: number;
  custo_embalagens: number;
  vendas_totais: number;
  margem_contribuicao: number;
  ponto_equilibrio: number;
  categorias: CMVCategoria[];
  evolucao_mensal: any[];
  alertas: string[];
}

interface CMVCategoria {
  nome: string;
  custo: number;
  vendas: number;
  percentual_cmv: number;
  meta: number;
  status: 'saudavel' | 'atencao' | 'critico';
}

export function IntegratedCMVAnalysis() {
  const { currentRestaurant } = useAuth();
  const [cmvData, setCmvData] = useState<CMVData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadIntegratedCMVData();
    }
  }, [currentRestaurant]);

  const loadIntegratedCMVData = async () => {
    if (!currentRestaurant?.id) return;
    
    setIsLoading(true);
    try {
      // Buscar dados do fluxo de caixa
      const { data: cashFlowData, error: cashFlowError } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('date', { ascending: false });

      if (cashFlowError) throw cashFlowError;

      // Buscar fichas técnicas com ingredientes
      const { data: fichasTecnicas, error: fichasError } = await supabase
        .from('pratos')
        .select(`
          *,
          ingredientes_por_prato (
            *,
            insumos (nome, preco_unitario, categoria)
          )
        `)
        .eq('restaurant_id', currentRestaurant.id);

      if (fichasError) throw fichasError;

      // Buscar movimentações de estoque
      const { data: movimentacoes, error: movError } = await supabase
        .from('movimentacao_estoque')
        .select(`
          *,
          insumos (nome, categoria, preco_unitario)
        `)
        .eq('restaurant_id', currentRestaurant.id)
        .order('data_movimento', { ascending: false });

      if (movError) throw movError;

      // Buscar configurações do restaurante
      const { data: config, error: configError } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (configError && configError.code !== 'PGRST116') throw configError;

      // Processar dados
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Filtrar dados do mês atual
      const currentMonthData = cashFlowData?.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() + 1 === currentMonth && entryDate.getFullYear() === currentYear;
      }) || [];

      // Calcular vendas totais
      const vendas_totais = currentMonthData
        .filter(entry => entry.type === 'income')
        .reduce((sum, entry) => sum + entry.amount, 0);

      // Calcular custos por categoria
      const custo_alimentos = currentMonthData
        .filter(entry => entry.type === 'expense' && ['food_supplies', 'ingredients'].includes(entry.category))
        .reduce((sum, entry) => sum + entry.amount, 0);

      const custo_bebidas = currentMonthData
        .filter(entry => entry.type === 'expense' && entry.category === 'beverage_supplies')
        .reduce((sum, entry) => sum + entry.amount, 0);

      const custo_embalagens = currentMonthData
        .filter(entry => entry.type === 'expense' && entry.category === 'packaging')
        .reduce((sum, entry) => sum + entry.amount, 0);

      // CMV total
      const cmv_total = custo_alimentos + custo_bebidas + custo_embalagens;
      const cmv_percentual = vendas_totais > 0 ? (cmv_total / vendas_totais) * 100 : 0;

      // Margem de contribuição
      const margem_contribuicao = vendas_totais - cmv_total;

      // Ponto de equilíbrio (simplificado)
      const despesas_fixas = config?.despesas_fixas_mensais || 0;
      const margem_contribuicao_percentual = vendas_totais > 0 ? (margem_contribuicao / vendas_totais) * 100 : 0;
      const ponto_equilibrio = margem_contribuicao_percentual > 0 ? despesas_fixas / (margem_contribuicao_percentual / 100) : 0;

      // Categorias com análise
      const categorias: CMVCategoria[] = [
        {
          nome: 'Alimentos',
          custo: custo_alimentos,
          vendas: vendas_totais,
          percentual_cmv: vendas_totais > 0 ? (custo_alimentos / vendas_totais) * 100 : 0,
          meta: 30,
          status: vendas_totais > 0 && (custo_alimentos / vendas_totais) * 100 <= 30 ? 'saudavel' : 
                  vendas_totais > 0 && (custo_alimentos / vendas_totais) * 100 <= 35 ? 'atencao' : 'critico'
        },
        {
          nome: 'Bebidas',
          custo: custo_bebidas,
          vendas: vendas_totais,
          percentual_cmv: vendas_totais > 0 ? (custo_bebidas / vendas_totais) * 100 : 0,
          meta: 25,
          status: vendas_totais > 0 && (custo_bebidas / vendas_totais) * 100 <= 25 ? 'saudavel' : 
                  vendas_totais > 0 && (custo_bebidas / vendas_totais) * 100 <= 30 ? 'atencao' : 'critico'
        },
        {
          nome: 'Embalagens',
          custo: custo_embalagens,
          vendas: vendas_totais,
          percentual_cmv: vendas_totais > 0 ? (custo_embalagens / vendas_totais) * 100 : 0,
          meta: 5,
          status: vendas_totais > 0 && (custo_embalagens / vendas_totais) * 100 <= 5 ? 'saudavel' : 
                  vendas_totais > 0 && (custo_embalagens / vendas_totais) * 100 <= 8 ? 'atencao' : 'critico'
        }
      ];

      // Evolução mensal
      const evolucao_mensal = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const monthEntries = cashFlowData?.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() + 1 === month && entryDate.getFullYear() === year;
        }) || [];

        const monthVendas = monthEntries
          .filter(entry => entry.type === 'income')
          .reduce((sum, entry) => sum + entry.amount, 0);

        const monthCMV = monthEntries
          .filter(entry => entry.type === 'expense' && ['food_supplies', 'beverage_supplies', 'ingredients', 'packaging'].includes(entry.category))
          .reduce((sum, entry) => sum + entry.amount, 0);

        const monthCMVPercentual = monthVendas > 0 ? (monthCMV / monthVendas) * 100 : 0;

        evolucao_mensal.push({
          mes: date.toLocaleDateString('pt-BR', { month: 'short' }),
          vendas: monthVendas,
          cmv: monthCMV,
          cmv_percentual: monthCMVPercentual,
          margem_contribuicao: monthVendas - monthCMV
        });
      }

      // Gerar alertas
      const alertas: string[] = [];
      if (cmv_percentual > 35) alertas.push('🚨 CMV total acima de 35% - CRÍTICO');
      if (custo_alimentos / vendas_totais * 100 > 30) alertas.push('⚠️ Custo de alimentos acima da meta (30%)');
      if (custo_bebidas / vendas_totais * 100 > 25) alertas.push('⚠️ Custo de bebidas acima da meta (25%)');
      if (margem_contribuicao < 0) alertas.push('🚨 Margem de contribuição NEGATIVA');
      if (vendas_totais === 0) alertas.push('📊 Nenhuma venda registrada no período');

      const processedCMVData: CMVData = {
        cmv_total,
        cmv_percentual,
        custo_alimentos,
        custo_bebidas,
        custo_embalagens,
        vendas_totais,
        margem_contribuicao,
        ponto_equilibrio,
        categorias,
        evolucao_mensal,
        alertas
      };

      setCmvData(processedCMVData);

    } catch (error) {
      console.error('Erro ao carregar dados CMV:', error);
      toast.error('Erro ao carregar dados de CMV');
      setCmvData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!cmvData) {
      toast.error("Nenhum dado disponível para exportar");
      return;
    }

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 30;
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ANÁLISE CMV INTEGRADA', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(12);
      const currentDate = new Date().toLocaleDateString('pt-BR');
      pdf.text(`Gerado em: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Resumo CMV
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMO CMV', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text(`CMV Total: R$ ${cmvData.cmv_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`CMV Percentual: ${cmvData.cmv_percentual.toFixed(2)}%`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Vendas Totais: R$ ${cmvData.vendas_totais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Margem de Contribuição: R$ ${cmvData.margem_contribuicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 15;
      
      // Análise por categoria
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ANÁLISE POR CATEGORIA', 20, yPosition);
      yPosition += 15;
      
      cmvData.categorias.forEach(categoria => {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${categoria.nome}:`, 20, yPosition);
        yPosition += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`  Custo: R$ ${categoria.custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 25, yPosition);
        yPosition += 6;
        pdf.text(`  Percentual: ${categoria.percentual_cmv.toFixed(2)}% (Meta: ${categoria.meta}%)`, 25, yPosition);
        yPosition += 6;
        
        const statusColor: [number, number, number] = categoria.status === 'saudavel' ? [0, 128, 0] : 
                                                     categoria.status === 'atencao' ? [255, 165, 0] : [255, 0, 0];
        pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        pdf.text(`  Status: ${categoria.status.toUpperCase()}`, 25, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 12;
      });
      
      // Alertas
      if (cmvData.alertas.length > 0) {
        yPosition += 10;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ALERTAS', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        cmvData.alertas.forEach(alerta => {
          pdf.text(`• ${alerta}`, 20, yPosition);
          yPosition += 8;
        });
      }
      
      const fileName = `cmv-integrado-${currentDate.replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      
      toast.success("Relatório CMV exportado com sucesso!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cmvData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum dado de CMV encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">Adicione movimentações de compras e vendas</p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 w-full overflow-hidden">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            CMV Integrado & Análise Contábil
          </h2>
          <p className="text-muted-foreground text-sm">
            Análise completa baseada em dados reais do sistema
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportToPDF}>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Alertas */}
      {cmvData.alertas.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Alertas CMV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cmvData.alertas.map((alerta, index) => (
                <div key={index} className="text-sm text-orange-800">
                  {alerta}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indicadores Principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CMV Total</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(cmvData.cmv_total)}
            </div>
            <p className="text-xs text-muted-foreground">
              {cmvData.cmv_percentual.toFixed(1)}% das vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(cmvData.vendas_totais)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita do período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Contribuição</CardTitle>
            <TrendingUp className={`h-4 w-4 ${cmvData.margem_contribuicao >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cmvData.margem_contribuicao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(cmvData.margem_contribuicao)}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendas - CMV
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ponto Equilíbrio</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(cmvData.ponto_equilibrio)}
            </div>
            <p className="text-xs text-muted-foreground">
              Para cobrir custos fixos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com análises */}
      <Tabs defaultValue="categorias" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="analise">Análise Detalhada</TabsTrigger>
        </TabsList>

        <TabsContent value="categorias" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>CMV por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cmvData.categorias}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="custo" fill="#3b82f6" name="Custo" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status das Metas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cmvData.categorias.map((categoria, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{categoria.nome}</span>
                        <Badge variant={
                          categoria.status === 'saudavel' ? "default" : 
                          categoria.status === 'atencao' ? "secondary" : "destructive"
                        }>
                          {categoria.percentual_cmv.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            categoria.status === 'saudavel' ? 'bg-green-500' : 
                            categoria.status === 'atencao' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min((categoria.percentual_cmv / categoria.meta) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Meta: {categoria.meta}% | Atual: {categoria.percentual_cmv.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="evolucao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução CMV - Últimos 6 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cmvData.evolucao_mensal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cmv_percentual" stroke="#ef4444" name="CMV %" strokeWidth={2} />
                    <Line type="monotone" dataKey="vendas" stroke="#10b981" name="Vendas" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analise" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {cmvData.categorias.map((categoria, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{categoria.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Custo:</span>
                      <span className="font-semibold">{formatCurrency(categoria.custo)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">% das Vendas:</span>
                      <span className="font-semibold">{categoria.percentual_cmv.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Meta:</span>
                      <span className="font-semibold">{categoria.meta}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={
                        categoria.status === 'saudavel' ? "default" : 
                        categoria.status === 'atencao' ? "secondary" : "destructive"
                      }>
                        {categoria.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
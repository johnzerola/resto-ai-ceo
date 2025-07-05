import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, FileDown, AlertTriangle, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import jsPDF from 'jspdf';

interface DREData {
  periodo: string;
  receita_bruta: number;
  deducoes_vendas: number;
  receita_liquida: number;
  cmv_total: number;
  lucro_bruto: number;
  despesas_operacionais: number;
  ebit: number;
  resultado_liquido: number;
  margem_bruta_percentual: number;
  margem_liquida_percentual: number;
  despesas_por_categoria: { [key: string]: number };
  evolucao_mensal: any[];
}

export function IntegratedDREOverview() {
  const { currentRestaurant } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [dreData, setDreData] = useState<DREData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadIntegratedDREData();
    }
  }, [selectedPeriod, currentRestaurant]);

  const loadIntegratedDREData = async () => {
    if (!currentRestaurant?.id) return;
    
    setIsLoading(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Buscar dados do fluxo de caixa
      const { data: cashFlowData, error: cashFlowError } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('date', { ascending: false });

      if (cashFlowError) throw cashFlowError;

      // Buscar dados de CMV das fichas técnicas
      const { data: fichasTecnicas, error: fichasError } = await supabase
        .from('pratos')
        .select(`
          *,
          ingredientes_por_prato (
            *,
            insumos (preco_unitario)
          )
        `)
        .eq('restaurant_id', currentRestaurant.id);

      if (fichasError) throw fichasError;

      // Buscar contas a pagar e receber
      const { data: contasPagar, error: contasPagarError } = await supabase
        .from('contas_a_pagar')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id);

      const { data: contasReceber, error: contasReceberError } = await supabase
        .from('contas_a_receber')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id);

      if (contasPagarError) throw contasPagarError;
      if (contasReceberError) throw contasReceberError;

      // Filtrar dados por período
      const filteredCashFlow = cashFlowData?.filter(entry => {
        const entryDate = new Date(entry.date);
        const entryMonth = entryDate.getMonth() + 1;
        const entryYear = entryDate.getFullYear();
        
        if (selectedPeriod === "month") {
          return entryMonth === currentMonth && entryYear === currentYear;
        } else if (selectedPeriod === "year") {
          return entryYear === currentYear;
        }
        return true;
      }) || [];

      // Calcular DRE clássico
      const receitas = filteredCashFlow.filter(entry => entry.type === 'income');
      const despesas = filteredCashFlow.filter(entry => entry.type === 'expense');

      // Receita Bruta
      const receita_bruta = receitas.reduce((sum, entry) => sum + entry.amount, 0);

      // Deduções (taxas de plataforma, impostos sobre vendas)
      const deducoes_vendas = despesas
        .filter(entry => ['taxes', 'platform_fees', 'delivery_tax'].includes(entry.category))
        .reduce((sum, entry) => sum + entry.amount, 0);

      // Receita Líquida
      const receita_liquida = receita_bruta - deducoes_vendas;

      // CMV (Custo das Mercadorias Vendidas)
      const cmv_total = despesas
        .filter(entry => ['food_supplies', 'beverage_supplies', 'ingredients', 'packaging'].includes(entry.category))
        .reduce((sum, entry) => sum + entry.amount, 0);

      // Lucro Bruto
      const lucro_bruto = receita_liquida - cmv_total;

      // Despesas Operacionais
      const despesas_operacionais = despesas
        .filter(entry => !['food_supplies', 'beverage_supplies', 'ingredients', 'packaging', 'taxes', 'platform_fees', 'delivery_tax'].includes(entry.category))
        .reduce((sum, entry) => sum + entry.amount, 0);

      // EBIT (Resultado Operacional)
      const ebit = lucro_bruto - despesas_operacionais;

      // Resultado Líquido (simplificado - sem despesas financeiras e IR)
      const resultado_liquido = ebit;

      // Margens percentuais
      const margem_bruta_percentual = receita_liquida > 0 ? (lucro_bruto / receita_liquida) * 100 : 0;
      const margem_liquida_percentual = receita_liquida > 0 ? (resultado_liquido / receita_liquida) * 100 : 0;

      // Despesas por categoria
      const despesas_por_categoria = despesas.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
        return acc;
      }, {} as { [key: string]: number });

      // Evolução mensal (últimos 6 meses)
      const evolucao_mensal = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const monthEntries = cashFlowData?.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() + 1 === month && entryDate.getFullYear() === year;
        }) || [];

        const monthReceitas = monthEntries
          .filter(entry => entry.type === 'income')
          .reduce((sum, entry) => sum + entry.amount, 0);

        const monthDespesas = monthEntries
          .filter(entry => entry.type === 'expense')
          .reduce((sum, entry) => sum + entry.amount, 0);

        const monthCMV = monthEntries
          .filter(entry => entry.type === 'expense' && ['food_supplies', 'beverage_supplies', 'ingredients'].includes(entry.category))
          .reduce((sum, entry) => sum + entry.amount, 0);

        evolucao_mensal.push({
          mes: date.toLocaleDateString('pt-BR', { month: 'short' }),
          receita_bruta: monthReceitas,
          receita_liquida: monthReceitas,
          cmv: monthCMV,
          lucro_bruto: monthReceitas - monthCMV,
          resultado_liquido: monthReceitas - monthDespesas
        });
      }

      const processedDREData: DREData = {
        periodo: selectedPeriod === "month" ? `${currentMonth}/${currentYear}` : currentYear.toString(),
        receita_bruta,
        deducoes_vendas,
        receita_liquida,
        cmv_total,
        lucro_bruto,
        despesas_operacionais,
        ebit,
        resultado_liquido,
        margem_bruta_percentual,
        margem_liquida_percentual,
        despesas_por_categoria,
        evolucao_mensal
      };

      setDreData(processedDREData);

      // Salvar DRE calculado no banco
      await saveDREToDatabase(processedDREData, currentMonth, currentYear);

    } catch (error) {
      console.error('Erro ao carregar dados DRE:', error);
      toast.error('Erro ao carregar dados financeiros');
      setDreData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDREToDatabase = async (dreData: DREData, month: number, year: number) => {
    if (!currentRestaurant?.id) return;

    try {
      const { error } = await supabase
        .from('dre_mensal')
        .upsert({
          restaurant_id: currentRestaurant.id,
          mes: month,
          ano: year,
          receita_bruta: dreData.receita_bruta,
          deducoes_vendas: dreData.deducoes_vendas,
          receita_liquida: dreData.receita_liquida,
          cmv_total: dreData.cmv_total,
          lucro_bruto: dreData.lucro_bruto,
          despesas_outras: dreData.despesas_operacionais,
          ebitda: dreData.ebit,
          resultado_liquido: dreData.resultado_liquido,
          margem_bruta_percentual: dreData.margem_bruta_percentual,
          margem_liquida_percentual: dreData.margem_liquida_percentual
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar DRE no banco:', error);
    }
  };

  const exportToPDF = () => {
    if (!dreData) {
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
      pdf.text('DEMONSTRATIVO DE RESULTADOS (DRE)', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.text(`Período: ${dreData.periodo}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // DRE Clássico
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DEMONSTRATIVO DE RESULTADOS', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Receita Bruta
      pdf.text(`RECEITA BRUTA`, 20, yPosition);
      pdf.text(`R$ ${dreData.receita_bruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 120, yPosition);
      yPosition += 8;
      
      // (-) Deduções
      pdf.text(`(-) Deduções (Taxas/Impostos s/ Vendas)`, 20, yPosition);
      pdf.text(`R$ ${dreData.deducoes_vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 120, yPosition);
      yPosition += 8;
      
      // = Receita Líquida
      pdf.setFont('helvetica', 'bold');
      pdf.text(`= RECEITA LÍQUIDA`, 20, yPosition);
      pdf.text(`R$ ${dreData.receita_liquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 120, yPosition);
      yPosition += 12;
      
      pdf.setFont('helvetica', 'normal');
      // (-) CMV
      pdf.text(`(-) CMV - Custo das Mercadorias Vendidas`, 20, yPosition);
      pdf.text(`R$ ${dreData.cmv_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 120, yPosition);
      yPosition += 8;
      
      // = Lucro Bruto
      pdf.setFont('helvetica', 'bold');
      pdf.text(`= LUCRO BRUTO`, 20, yPosition);
      pdf.text(`R$ ${dreData.lucro_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 120, yPosition);
      pdf.text(`(${dreData.margem_bruta_percentual.toFixed(1)}%)`, 170, yPosition);
      yPosition += 12;
      
      pdf.setFont('helvetica', 'normal');
      // (-) Despesas Operacionais
      pdf.text(`(-) Despesas Operacionais`, 20, yPosition);
      pdf.text(`R$ ${dreData.despesas_operacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 120, yPosition);
      yPosition += 8;
      
      // = Resultado Operacional (EBIT)
      pdf.setFont('helvetica', 'bold');
      pdf.text(`= RESULTADO OPERACIONAL (EBIT)`, 20, yPosition);
      pdf.text(`R$ ${dreData.ebit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 120, yPosition);
      yPosition += 12;
      
      // = Resultado Líquido
      pdf.setTextColor(dreData.resultado_liquido >= 0 ? 0 : 255, dreData.resultado_liquido >= 0 ? 128 : 0, 0);
      pdf.text(`= RESULTADO LÍQUIDO`, 20, yPosition);
      pdf.text(`R$ ${dreData.resultado_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 120, yPosition);
      pdf.text(`(${dreData.margem_liquida_percentual.toFixed(1)}%)`, 170, yPosition);
      
      const fileName = `dre-completo-${dreData.periodo.replace('/', '-')}.pdf`;
      pdf.save(fileName);
      
      toast.success("DRE exportado com sucesso!");
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

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dreData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum dado financeiro encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">Adicione movimentações no fluxo de caixa para gerar o DRE</p>
        </CardContent>
      </Card>
    );
  }

  const expensePieData = Object.entries(dreData.despesas_por_categoria).map(([name, value], index) => ({
    name,
    value: value as number,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-hidden">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            DRE Integrado - {dreData.periodo}
          </h2>
          <p className="text-muted-foreground text-sm">
            Demonstrativo atualizado em tempo real com dados do sistema
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setSelectedPeriod("month")} 
                  className={selectedPeriod === "month" ? "bg-primary text-primary-foreground" : ""}>
            Mês Atual
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedPeriod("year")}
                  className={selectedPeriod === "year" ? "bg-primary text-primary-foreground" : ""}>
            Ano Atual
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Indicadores Principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Bruta</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {formatCurrency(dreData.receita_bruta)}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendas totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CMV</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {formatCurrency(dreData.cmv_total)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dreData.receita_liquida > 0 ? ((dreData.cmv_total / dreData.receita_liquida) * 100).toFixed(1) : 0}% da receita
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle>
            <TrendingUp className={`h-4 w-4 ${dreData.lucro_bruto >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${dreData.lucro_bruto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(dreData.lucro_bruto)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margem: {dreData.margem_bruta_percentual.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultado Líquido</CardTitle>
            <TrendingUp className={`h-4 w-4 ${dreData.resultado_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${dreData.resultado_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(dreData.resultado_liquido)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margem: {dreData.margem_liquida_percentual.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com análises */}
      <Tabs defaultValue="dre" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dre">DRE Detalhado</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="categorias">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="dre" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DRE Clássico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold">RECEITA BRUTA</span>
                  <span className="font-bold text-green-600">{formatCurrency(dreData.receita_bruta)}</span>
                </div>
                <div className="flex justify-between items-center py-1 text-sm text-muted-foreground">
                  <span>(-) Deduções</span>
                  <span>({formatCurrency(dreData.deducoes_vendas)})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="font-semibold">= RECEITA LÍQUIDA</span>
                  <span className="font-bold">{formatCurrency(dreData.receita_liquida)}</span>
                </div>
                <div className="flex justify-between items-center py-1 text-sm text-muted-foreground">
                  <span>(-) CMV</span>
                  <span>({formatCurrency(dreData.cmv_total)})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="font-semibold">= LUCRO BRUTO</span>
                  <span className="font-bold text-blue-600">{formatCurrency(dreData.lucro_bruto)}</span>
                  <Badge variant="secondary">{dreData.margem_bruta_percentual.toFixed(1)}%</Badge>
                </div>
                <div className="flex justify-between items-center py-1 text-sm text-muted-foreground">
                  <span>(-) Despesas Operacionais</span>
                  <span>({formatCurrency(dreData.despesas_operacionais)})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-b-2 border-primary">
                  <span className="font-bold">= RESULTADO LÍQUIDO</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${dreData.resultado_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(dreData.resultado_liquido)}
                    </span>
                    <Badge variant={dreData.resultado_liquido >= 0 ? "default" : "destructive"}>
                      {dreData.margem_liquida_percentual.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolucao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dreData.evolucao_mensal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="receita_bruta" fill="#10b981" name="Receita Bruta" />
                    <Bar dataKey="cmv" fill="#ef4444" name="CMV" />
                    <Bar dataKey="resultado_liquido" fill="#3b82f6" name="Resultado Líquido" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          {expensePieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensePieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                      >
                        {expensePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
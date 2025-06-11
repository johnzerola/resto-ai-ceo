
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calculator, Package, FileDown } from "lucide-react";
import jsPDF from 'jspdf';
import { toast } from "sonner";

export function CMVAnalysis() {
  const [cmvData, setCmvData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCMVData();
  }, []);

  const loadCMVData = () => {
    setIsLoading(true);
    try {
      // Load cash flow data
      const cashFlowData = localStorage.getItem('cashFlowEntries');
      const entries = cashFlowData ? JSON.parse(cashFlowData) : [];
      
      // Load restaurant config
      const restaurantData = localStorage.getItem('restaurantData');
      const config = restaurantData ? JSON.parse(restaurantData) : {};
      
      // Filter food and beverage purchases
      const foodPurchases = entries.filter((entry: any) => 
        entry.type === 'expense' && 
        (entry.category === 'food_supplies' || entry.category === 'beverage_supplies')
      );
      
      // Filter sales
      const salesEntries = entries.filter((entry: any) => entry.type === 'income');
      
      // Calculate totals
      const totalFoodCost = foodPurchases
        .filter((entry: any) => entry.category === 'food_supplies')
        .reduce((sum: number, entry: any) => sum + entry.amount, 0);
        
      const totalBeverageCost = foodPurchases
        .filter((entry: any) => entry.category === 'beverage_supplies')
        .reduce((sum: number, entry: any) => sum + entry.amount, 0);
        
      const totalSales = salesEntries.reduce((sum: number, entry: any) => sum + entry.amount, 0);
      
      const totalCMV = totalFoodCost + totalBeverageCost;
      const cmvPercentage = totalSales > 0 ? (totalCMV / totalSales) * 100 : 0;
      const foodCostPercentage = totalSales > 0 ? (totalFoodCost / totalSales) * 100 : 0;
      const beverageCostPercentage = totalSales > 0 ? (totalBeverageCost / totalSales) * 100 : 0;
      
      // Get targets from config
      const targetFoodCost = config.targetFoodCost || 30;
      const targetBeverageCost = config.targetBeverageCost || 25;
      
      // Create monthly trend data
      const monthlyData = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const monthEntries = entries.filter((entry: any) => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() + 1 === month && entryDate.getFullYear() === year;
        });
        
        const monthSales = monthEntries
          .filter((entry: any) => entry.type === 'income')
          .reduce((sum: number, entry: any) => sum + entry.amount, 0);
          
        const monthFoodCost = monthEntries
          .filter((entry: any) => entry.type === 'expense' && entry.category === 'food_supplies')
          .reduce((sum: number, entry: any) => sum + entry.amount, 0);
          
        const monthBeverageCost = monthEntries
          .filter((entry: any) => entry.type === 'expense' && entry.category === 'beverage_supplies')
          .reduce((sum: number, entry: any) => sum + entry.amount, 0);
        
        const monthCMV = monthSales > 0 ? ((monthFoodCost + monthBeverageCost) / monthSales) * 100 : 0;
        
        monthlyData.push({
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          cmv: monthCMV,
          vendas: monthSales,
          custoAlimentos: monthFoodCost,
          custoBebidas: monthBeverageCost
        });
      }
      
      // Category breakdown
      const categoryData = [
        { name: 'Alimentos', valor: totalFoodCost, percentual: foodCostPercentage, meta: targetFoodCost },
        { name: 'Bebidas', valor: totalBeverageCost, percentual: beverageCostPercentage, meta: targetBeverageCost }
      ];
      
      setCmvData({
        totalCMV,
        cmvPercentage,
        totalFoodCost,
        totalBeverageCost,
        foodCostPercentage,
        beverageCostPercentage,
        totalSales,
        targetFoodCost,
        targetBeverageCost,
        monthlyData,
        categoryData,
        foodPurchases
      });
      
    } catch (error) {
      console.error('Error loading CMV data:', error);
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
      pdf.text('Análise CMV - Custo da Mercadoria Vendida', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(12);
      const currentDate = new Date().toLocaleDateString('pt-BR');
      pdf.text(`Gerado em: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // CMV Summary
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo CMV', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text(`CMV Total: R$ ${cmvData.totalCMV.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 10;
      
      pdf.text(`Percentual CMV: ${cmvData.cmvPercentage.toFixed(2)}%`, 20, yPosition);
      yPosition += 10;
      
      pdf.text(`Vendas Totais: R$ ${cmvData.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 15;
      
      // Category breakdown
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Análise por Categoria', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      cmvData.categoryData.forEach((category: any) => {
        const status = category.percentual <= category.meta ? 'Dentro da Meta' : 'Acima da Meta';
        const colorRGB: [number, number, number] = category.percentual <= category.meta ? [0, 128, 0] : [255, 0, 0];
        
        pdf.text(`${category.name}:`, 20, yPosition);
        yPosition += 8;
        pdf.text(`  Custo: R$ ${category.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 25, yPosition);
        yPosition += 8;
        pdf.text(`  Percentual: ${category.percentual.toFixed(2)}% (Meta: ${category.meta}%)`, 25, yPosition);
        yPosition += 8;
        pdf.setTextColor(colorRGB[0], colorRGB[1], colorRGB[2]);
        pdf.text(`  Status: ${status}`, 25, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 12;
      });
      
      const fileName = `cmv-analise-${currentDate.replace(/\//g, '-')}.pdf`;
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
      <div className="space-y-4 sm:space-y-6">
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
          <p className="text-muted-foreground">Nenhum dado de CMV encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-hidden">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Análise CMV</h2>
          <p className="text-muted-foreground text-sm">
            Custo da Mercadoria Vendida atualizado automaticamente
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportToPDF}>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CMV Total</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(cmvData.totalCMV)}
            </div>
            <p className="text-xs text-muted-foreground">
              {cmvData.cmvPercentage.toFixed(1)}% das vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Alimentos</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(cmvData.totalFoodCost)}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {cmvData.foodCostPercentage.toFixed(1)}%
              </p>
              <Badge variant={cmvData.foodCostPercentage <= cmvData.targetFoodCost ? "default" : "destructive"}>
                Meta: {cmvData.targetFoodCost}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Bebidas</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(cmvData.totalBeverageCost)}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {cmvData.beverageCostPercentage.toFixed(1)}%
              </p>
              <Badge variant={cmvData.beverageCostPercentage <= cmvData.targetBeverageCost ? "default" : "destructive"}>
                Meta: {cmvData.targetBeverageCost}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="categories">Por Categorias</TabsTrigger>
          <TabsTrigger value="trend">Tendência Mensal</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">CMV vs Vendas (Últimos 6 Meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cmvData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="vendas" fill="#10b981" name="Vendas" />
                      <Bar dataKey="custoAlimentos" fill="#3b82f6" name="Custo Alimentos" />
                      <Bar dataKey="custoBebidas" fill="#f59e0b" name="Custo Bebidas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Distribuição de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cmvData.categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="valor"
                        label={(entry) => `${entry.name}: ${formatCurrency(entry.valor)}`}
                      >
                        {cmvData.categoryData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="w-full overflow-x-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Análise Detalhada por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cmvData.categoryData.map((category: any, index: number) => (
                    <div key={category.name} className="p-4 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <h4 className="font-semibold">{category.name}</h4>
                        <Badge variant={category.percentual <= category.meta ? "default" : "destructive"}>
                          {category.percentual <= category.meta ? "Dentro da Meta" : "Acima da Meta"}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Custo Total: {formatCurrency(category.valor)}</p>
                        <p>Percentual: {category.percentual.toFixed(2)}%</p>
                        <p>Meta: {category.meta}%</p>
                        <p>Diferença: {(category.percentual - category.meta).toFixed(2)} pontos percentuais</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trend" className="space-y-4">
          <div className="w-full overflow-x-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Tendência CMV Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cmvData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cmv" stroke="#ef4444" strokeWidth={2} name="CMV %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

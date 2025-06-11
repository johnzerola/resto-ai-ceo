
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, DollarSign, FileDown } from "lucide-react";
import { getFinancialData } from "@/services/FinancialDataService";
import jsPDF from 'jspdf';
import { toast } from "sonner";

export function DREOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [dreData, setDreData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDREData();
  }, [selectedPeriod]);

  const loadDREData = () => {
    setIsLoading(true);
    try {
      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      // Load cash flow data
      const cashFlowData = localStorage.getItem('cashFlowEntries');
      const entries = cashFlowData ? JSON.parse(cashFlowData) : [];
      
      // Filter entries for current period
      const filteredEntries = entries.filter((entry: any) => {
        const entryDate = new Date(entry.date);
        const entryMonth = entryDate.getMonth() + 1;
        const entryYear = entryDate.getFullYear();
        
        if (selectedPeriod === "month") {
          return entryMonth === currentMonth && entryYear === currentYear;
        } else if (selectedPeriod === "year") {
          return entryYear === currentYear;
        }
        return true;
      });

      // Calculate totals
      const totalRevenue = filteredEntries
        .filter((entry: any) => entry.type === 'income')
        .reduce((sum: number, entry: any) => sum + entry.amount, 0);

      const totalExpenses = filteredEntries
        .filter((entry: any) => entry.type === 'expense')
        .reduce((sum: number, entry: any) => sum + entry.amount, 0);

      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Categorize expenses
      const expensesByCategory = filteredEntries
        .filter((entry: any) => entry.type === 'expense')
        .reduce((acc: any, entry: any) => {
          acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
          return acc;
        }, {});

      // Create monthly comparison data (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const monthEntries = entries.filter((entry: any) => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() + 1 === month && entryDate.getFullYear() === year;
        });

        const monthRevenue = monthEntries
          .filter((entry: any) => entry.type === 'income')
          .reduce((sum: number, entry: any) => sum + entry.amount, 0);

        const monthExpenses = monthEntries
          .filter((entry: any) => entry.type === 'expense')
          .reduce((sum: number, entry: any) => sum + entry.amount, 0);

        monthlyData.push({
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          receitas: monthRevenue,
          despesas: monthExpenses,
          lucro: monthRevenue - monthExpenses
        });
      }

      setDreData({
        period: selectedPeriod === "month" ? `${currentMonth}/${currentYear}` : currentYear.toString(),
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        expensesByCategory,
        monthlyData,
        entries: filteredEntries
      });

    } catch (error) {
      console.error('Error loading DRE data:', error);
      setDreData(null);
    } finally {
      setIsLoading(false);
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
      pdf.text('Demonstrativo de Resultados (DRE)', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.text(`Período: ${dreData.period}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Financial Summary
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo Financeiro', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      pdf.setTextColor(0, 128, 0);
      pdf.text(`Receitas Totais: R$ ${dreData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 10;
      
      pdf.setTextColor(255, 0, 0);
      pdf.text(`Despesas Totais: R$ ${dreData.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 10;
      
      pdf.setTextColor(dreData.netProfit >= 0 ? 0 : 255, dreData.netProfit >= 0 ? 0 : 0, 0);
      pdf.text(`Lucro Líquido: R$ ${dreData.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 10;
      
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Margem de Lucro: ${dreData.profitMargin.toFixed(2)}%`, 20, yPosition);
      yPosition += 20;
      
      // Expenses by Category
      if (Object.keys(dreData.expensesByCategory).length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Despesas por Categoria', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        Object.entries(dreData.expensesByCategory).forEach(([category, amount]) => {
          pdf.text(`${category}: R$ ${(amount as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
          yPosition += 8;
        });
      }
      
      const fileName = `dre-${dreData.period.replace('/', '-')}.pdf`;
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

  if (!dreData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Nenhum dado financeiro encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const expensePieData = Object.entries(dreData.expensesByCategory).map(([name, value], index) => ({
    name,
    value: value as number,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-hidden">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">DRE - {dreData.period}</h2>
          <p className="text-muted-foreground text-sm">
            Demonstrativo atualizado automaticamente com o fluxo de caixa
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

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {formatCurrency(dreData.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {formatCurrency(dreData.totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className={`h-4 w-4 ${dreData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${dreData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(dreData.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margem: {dreData.profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dreData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                  <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                  <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {expensePieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

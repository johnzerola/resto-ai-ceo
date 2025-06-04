import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Calendar } from "lucide-react";
import { getFinancialData } from "@/services/FinancialDataService";

// Interface para dados do DRE
interface DREData {
  period: string;
  revenue: {
    foodSales: number;
    beverageSales: number;
    deliverySales: number;
    otherSales: number;
    total: number;
  };
  costs: {
    foodCost: number;
    beverageCost: number;
    packagingCost: number;
    otherCosts: number;
    total: number;
  };
  grossProfit: number;
  expenses: {
    labor: number;
    rent: number;
    utilities: number;
    marketing: number;
    maintenance: number;
    administrative: number;
    depreciation: number;
    otherExpenses: number;
    total: number;
  };
  operatingProfit: number;
  taxes: number;
  netProfit: number;
}

export function DREOverview() {
  const [dreData, setDreData] = useState<DREData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [hasData, setHasData] = useState(false);

  // Períodos disponíveis
  const periods = [
    { id: "current", label: "Mês Atual (Maio 2025)" },
    { id: "previous", label: "Mês Anterior (Abril 2025)" },
    { id: "ytd", label: "Acumulado do Ano" },
    { id: "q1", label: "1º Trimestre 2025" },
    { id: "q2", label: "2º Trimestre 2025" }
  ];

  // Carregar dados financeiros e atualizar o DRE quando houver alterações
  useEffect(() => {
    const loadDREData = () => {
      // Obter dados financeiros atualizados
      const financialData = getFinancialData();
      
      // Verificar se há dados reais no sistema
      const cashFlowData = localStorage.getItem("cashFlow");
      const hasCashFlowData = cashFlowData && JSON.parse(cashFlowData).length > 0;
      
      if (hasCashFlowData) {
        // Gerar dados do DRE com base no período selecionado e nos dados financeiros
        const data = generateDREData(selectedPeriod, financialData);
        setDreData(data);
        setHasData(true);
      } else {
        setDreData(null);
        setHasData(false);
      }
    };

    // Carregar dados iniciais
    loadDREData();
    
    // Adicionar listener para atualizações nos dados financeiros
    const handleFinancialDataUpdate = () => {
      loadDREData();
    };
    
    window.addEventListener("financialDataUpdated", handleFinancialDataUpdate);
    
    return () => {
      window.removeEventListener("financialDataUpdated", handleFinancialDataUpdate);
    };
  }, [selectedPeriod]);

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Função para calcular porcentagem
  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  // Função para determinar a cor baseada no valor (positivo/negativo)
  const getValueColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" disabled>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar DRE
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Nenhum dado disponível</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  O DRE será preenchido automaticamente conforme você registrar transações no Fluxo de Caixa.
                  Comece adicionando suas primeiras receitas e despesas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dreData) {
    return <div className="flex justify-center items-center h-64">Carregando dados...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Selecione um período" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar DRE
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Demonstrativo de Resultado do Exercício</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 min-w-[200px]">Categoria</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 min-w-[120px]">Valor (R$)</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 min-w-[100px]">% da Receita</th>
                </tr>
              </thead>
              <tbody>
                {/* Receitas */}
                <tr className="font-medium bg-muted/50">
                  <td colSpan={3} className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">1. RECEITA BRUTA OPERACIONAL</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Alimentos</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.revenue.foodSales)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.revenue.foodSales, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Bebidas</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.revenue.beverageSales)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.revenue.beverageSales, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Delivery</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.revenue.deliverySales)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.revenue.deliverySales, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Outros</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.revenue.otherSales)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.revenue.otherSales, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b font-medium">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">RECEITA TOTAL</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.revenue.total)}</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">100%</td>
                </tr>

                {/* Custos de Mercadoria Vendida (CMV) */}
                <tr className="font-medium bg-muted/50">
                  <td colSpan={3} className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">2. CUSTO DE MERCADORIA VENDIDA (CMV)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Custo de Alimentos</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.costs.foodCost)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.costs.foodCost, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Custo de Bebidas</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.costs.beverageCost)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.costs.beverageCost, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Embalagens</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.costs.packagingCost)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.costs.packagingCost, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Outros Custos</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.costs.otherCosts)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.costs.otherCosts, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b font-medium">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">TOTAL CMV</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.costs.total)}</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.costs.total, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>

                {/* Lucro Bruto */}
                <tr className="border-b font-medium bg-green-50">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">3. LUCRO BRUTO</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.grossProfit)}</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.grossProfit, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>

                {/* Despesas Operacionais */}
                <tr className="font-medium bg-muted/50">
                  <td colSpan={3} className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">4. DESPESAS OPERACIONAIS</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Mão de Obra</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.expenses.labor)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.expenses.labor, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Aluguel</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.expenses.rent)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.expenses.rent, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Concessionárias (Água/Luz/Gás)</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.expenses.utilities)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.expenses.utilities, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Marketing</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.expenses.marketing)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.expenses.marketing, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Manutenção</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.expenses.maintenance)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.expenses.maintenance, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Administrativas</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.expenses.administrative)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.expenses.administrative, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Depreciação</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.expenses.depreciation)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.expenses.depreciation, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 pl-4 sm:pl-8 text-xs sm:text-sm">Outras Despesas</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.expenses.otherExpenses)}</td>
                  <td className="text-right py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.expenses.otherExpenses, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b font-medium">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">TOTAL DESPESAS OPERACIONAIS</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.expenses.total)}</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.expenses.total, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>

                {/* Lucro Operacional */}
                <tr className="border-b font-medium bg-green-50">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">5. LUCRO OPERACIONAL</td>
                  <td className={`text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm ${getValueColor(dreData.operatingProfit)}`}>
                    {formatCurrency(dreData.operatingProfit)}
                  </td>
                  <td className={`text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm ${getValueColor(dreData.operatingProfit)}`}>
                    {calculatePercentage(dreData.operatingProfit, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>

                {/* Impostos */}
                <tr className="border-b">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">6. IMPOSTOS E TRIBUTOS</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{formatCurrency(dreData.taxes)}</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                    {calculatePercentage(dreData.taxes, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>

                {/* Lucro Líquido */}
                <tr className="font-medium text-sm sm:text-lg bg-green-100">
                  <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-base">7. LUCRO LÍQUIDO</td>
                  <td className={`text-right py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-base ${getValueColor(dreData.netProfit)}`}>
                    {formatCurrency(dreData.netProfit)}
                  </td>
                  <td className={`text-right py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-base ${getValueColor(dreData.netProfit)}`}>
                    {calculatePercentage(dreData.netProfit, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Função para gerar dados do DRE com base no período e dados financeiros reais
function generateDREData(periodId: string, financialData: any): DREData {
  // Base values from actual financial data
  let multiplier = 1;
  let periodName = "Maio 2025";
  
  // Adjust values based on period
  switch (periodId) {
    case "previous":
      multiplier = 0.92;
      periodName = "Abril 2025";
      break;
    case "ytd":
      multiplier = 5.2;
      periodName = "Ano até Maio 2025";
      break;
    case "q1":
      multiplier = 3;
      periodName = "1º Trimestre 2025";
      break;
    case "q2":
      multiplier = 2.1;
      periodName = "2º Trimestre 2025";
      break;
  }
  
  // Use actual financial data from cash flow
  const cashFlowData = localStorage.getItem("cashFlow");
  let actualRevenue = 0;
  let actualExpenses = 0;
  
  if (cashFlowData) {
    const entries = JSON.parse(cashFlowData);
    actualRevenue = entries
      .filter((entry: any) => entry.type === 'entrada')
      .reduce((sum: number, entry: any) => sum + (parseFloat(entry.amount) || 0), 0);
    
    actualExpenses = entries
      .filter((entry: any) => entry.type === 'saida')
      .reduce((sum: number, entry: any) => sum + (parseFloat(entry.amount) || 0), 0);
  }
  
  // Generate DRE based on actual data
  const foodSales = actualRevenue * 0.7 * multiplier;
  const beverageSales = actualRevenue * 0.2 * multiplier;
  const deliverySales = actualRevenue * 0.08 * multiplier;
  const otherSales = actualRevenue * 0.02 * multiplier;
  const totalRevenue = foodSales + beverageSales + deliverySales + otherSales;
  
  // Costs calculations based on actual expenses
  const foodCost = actualExpenses * 0.4 * multiplier;
  const beverageCost = actualExpenses * 0.15 * multiplier;
  const packagingCost = actualExpenses * 0.05 * multiplier;
  const otherCosts = actualExpenses * 0.1 * multiplier;
  const totalCosts = foodCost + beverageCost + packagingCost + otherCosts;
  
  // Gross profit
  const grossProfit = totalRevenue - totalCosts;
  
  // Operational expenses based on actual data
  const labor = actualExpenses * 0.25 * multiplier;
  const rent = actualExpenses * 0.08 * multiplier;
  const utilities = actualExpenses * 0.05 * multiplier;
  const marketing = actualExpenses * 0.03 * multiplier;
  const maintenance = actualExpenses * 0.02 * multiplier;
  const administrative = actualExpenses * 0.04 * multiplier;
  const depreciation = actualExpenses * 0.01 * multiplier;
  const otherExpenses = actualExpenses * 0.02 * multiplier;
  const totalExpenses = labor + rent + utilities + marketing + maintenance + 
                       administrative + depreciation + otherExpenses;
  
  // Operating profit
  const operatingProfit = grossProfit - totalExpenses;
  
  // Taxes
  const taxes = operatingProfit > 0 ? operatingProfit * 0.15 : 0;
  
  // Net profit
  const netProfit = operatingProfit - taxes;
  
  return {
    period: periodName,
    revenue: {
      foodSales,
      beverageSales,
      deliverySales,
      otherSales,
      total: totalRevenue
    },
    costs: {
      foodCost,
      beverageCost,
      packagingCost,
      otherCosts,
      total: totalCosts
    },
    grossProfit,
    expenses: {
      labor,
      rent,
      utilities,
      marketing,
      maintenance,
      administrative,
      depreciation,
      otherExpenses,
      total: totalExpenses
    },
    operatingProfit,
    taxes,
    netProfit
  };
}

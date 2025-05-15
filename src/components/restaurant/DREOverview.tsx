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
      
      // Gerar dados do DRE com base no período selecionado e nos dados financeiros
      const data = generateDREData(selectedPeriod, financialData);
      setDreData(data);
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

  if (!dreData) {
    return <div className="flex justify-center items-center h-64">Carregando dados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[250px]">
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
        <Button variant="outline" size="sm">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar DRE
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demonstrativo de Resultado do Exercício</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Categoria</th>
                  <th className="text-right py-3 px-4">Valor (R$)</th>
                  <th className="text-right py-3 px-4">% da Receita</th>
                </tr>
              </thead>
              <tbody>
                {/* Receitas */}
                <tr className="font-medium bg-muted/50">
                  <td colSpan={3} className="py-3 px-4">1. RECEITA BRUTA OPERACIONAL</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Alimentos</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.revenue.foodSales)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.revenue.foodSales, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Bebidas</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.revenue.beverageSales)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.revenue.beverageSales, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Delivery</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.revenue.deliverySales)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.revenue.deliverySales, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Outros</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.revenue.otherSales)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.revenue.otherSales, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b font-medium">
                  <td className="py-3 px-4">RECEITA TOTAL</td>
                  <td className="text-right py-3 px-4">{formatCurrency(dreData.revenue.total)}</td>
                  <td className="text-right py-3 px-4">100%</td>
                </tr>

                {/* Custos de Mercadoria Vendida (CMV) */}
                <tr className="font-medium bg-muted/50">
                  <td colSpan={3} className="py-3 px-4">2. CUSTO DE MERCADORIA VENDIDA (CMV)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Custo de Alimentos</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.costs.foodCost)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.costs.foodCost, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Custo de Bebidas</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.costs.beverageCost)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.costs.beverageCost, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Embalagens</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.costs.packagingCost)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.costs.packagingCost, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Outros Custos</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.costs.otherCosts)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.costs.otherCosts, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b font-medium">
                  <td className="py-3 px-4">TOTAL CMV</td>
                  <td className="text-right py-3 px-4">{formatCurrency(dreData.costs.total)}</td>
                  <td className="text-right py-3 px-4">
                    {calculatePercentage(dreData.costs.total, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>

                {/* Lucro Bruto */}
                <tr className="border-b font-medium bg-green-50">
                  <td className="py-3 px-4">3. LUCRO BRUTO</td>
                  <td className="text-right py-3 px-4">{formatCurrency(dreData.grossProfit)}</td>
                  <td className="text-right py-3 px-4">
                    {calculatePercentage(dreData.grossProfit, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>

                {/* Despesas Operacionais */}
                <tr className="font-medium bg-muted/50">
                  <td colSpan={3} className="py-3 px-4">4. DESPESAS OPERACIONAIS</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Mão de Obra</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.expenses.labor)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.expenses.labor, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Aluguel</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.expenses.rent)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.expenses.rent, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Concessionárias (Água/Luz/Gás)</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.expenses.utilities)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.expenses.utilities, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Marketing</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.expenses.marketing)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.expenses.marketing, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Manutenção</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.expenses.maintenance)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.expenses.maintenance, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Administrativas</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.expenses.administrative)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.expenses.administrative, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Depreciação</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.expenses.depreciation)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.expenses.depreciation, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 pl-8">Outras Despesas</td>
                  <td className="text-right py-2 px-4">{formatCurrency(dreData.expenses.otherExpenses)}</td>
                  <td className="text-right py-2 px-4">
                    {calculatePercentage(dreData.expenses.otherExpenses, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b font-medium">
                  <td className="py-3 px-4">TOTAL DESPESAS OPERACIONAIS</td>
                  <td className="text-right py-3 px-4">{formatCurrency(dreData.expenses.total)}</td>
                  <td className="text-right py-3 px-4">
                    {calculatePercentage(dreData.expenses.total, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>

                {/* Lucro Operacional */}
                <tr className="border-b font-medium bg-green-50">
                  <td className="py-3 px-4">5. LUCRO OPERACIONAL</td>
                  <td className={`text-right py-3 px-4 ${getValueColor(dreData.operatingProfit)}`}>
                    {formatCurrency(dreData.operatingProfit)}
                  </td>
                  <td className={`text-right py-3 px-4 ${getValueColor(dreData.operatingProfit)}`}>
                    {calculatePercentage(dreData.operatingProfit, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>

                {/* Impostos */}
                <tr className="border-b">
                  <td className="py-3 px-4">6. IMPOSTOS E TRIBUTOS</td>
                  <td className="text-right py-3 px-4">{formatCurrency(dreData.taxes)}</td>
                  <td className="text-right py-3 px-4">
                    {calculatePercentage(dreData.taxes, dreData.revenue.total).toFixed(1)}%
                  </td>
                </tr>

                {/* Lucro Líquido */}
                <tr className="font-medium text-lg bg-green-100">
                  <td className="py-4 px-4">7. LUCRO LÍQUIDO</td>
                  <td className={`text-right py-4 px-4 ${getValueColor(dreData.netProfit)}`}>
                    {formatCurrency(dreData.netProfit)}
                  </td>
                  <td className={`text-right py-4 px-4 ${getValueColor(dreData.netProfit)}`}>
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

// Função para gerar dados do DRE com base no período e dados financeiros
function generateDREData(periodId: string, financialData: any): DREData {
  // Base values
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
  
  // Use financial data from cash flow if available, otherwise use sample data
  const foodSales = financialData?.revenue?.foodSales 
    ? financialData.revenue.foodSales * multiplier 
    : 125000 * multiplier;
    
  const beverageSales = financialData?.revenue?.beverageSales 
    ? financialData.revenue.beverageSales * multiplier 
    : 45000 * multiplier;
    
  const deliverySales = financialData?.revenue?.deliverySales 
    ? financialData.revenue.deliverySales * multiplier 
    : 30000 * multiplier;
    
  const otherSales = financialData?.revenue?.otherSales 
    ? financialData.revenue.otherSales * multiplier 
    : 5000 * multiplier;
    
  const totalRevenue = foodSales + beverageSales + deliverySales + otherSales;
  
  // Costs calculations - use financial data if available
  const foodCost = financialData?.costs?.foodCost 
    ? financialData.costs.foodCost * multiplier 
    : foodSales * 0.32;
    
  const beverageCost = financialData?.costs?.beverageCost 
    ? financialData.costs.beverageCost * multiplier 
    : beverageSales * 0.28;
    
  const packagingCost = financialData?.costs?.packagingCost 
    ? financialData.costs.packagingCost * multiplier 
    : deliverySales * 0.08;
    
  const otherCosts = financialData?.costs?.otherCosts 
    ? financialData.costs.otherCosts * multiplier 
    : totalRevenue * 0.02;
    
  const totalCosts = foodCost + beverageCost + packagingCost + otherCosts;
  
  // Gross profit
  const grossProfit = totalRevenue - totalCosts;
  
  // Expenses calculations
  const labor = totalRevenue * 0.25;
  const rent = 15000;
  const utilities = 8500;
  const marketing = totalRevenue * 0.04;
  const maintenance = 5000;
  const administrative = 7500;
  const depreciation = 3000;
  const otherExpenses = 2500;
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

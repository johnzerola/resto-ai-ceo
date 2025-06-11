
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  Package,
  AlertTriangle
} from "lucide-react";

interface MetricsGridProps {
  stats: any;
}

export default function MetricsGrid({ stats }: MetricsGridProps) {
  const [financialData, setFinancialData] = useState<any>(null);
  const [goalsData, setGoalsData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);

  useEffect(() => {
    loadFinancialData();
    loadGoalsData();
    loadInventoryData();
  }, []);

  const loadFinancialData = () => {
    try {
      const cashFlowData = localStorage.getItem('cashFlowEntries');
      if (cashFlowData) {
        const entries = JSON.parse(cashFlowData);
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const monthEntries = entries.filter((entry: any) => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() + 1 === currentMonth && entryDate.getFullYear() === currentYear;
        });

        const totalIncome = monthEntries
          .filter((entry: any) => entry.type === 'income')
          .reduce((sum: number, entry: any) => sum + entry.amount, 0);

        const totalExpenses = monthEntries
          .filter((entry: any) => entry.type === 'expense')
          .reduce((sum: number, entry: any) => sum + entry.amount, 0);

        const netProfit = totalIncome - totalExpenses;

        setFinancialData({
          totalIncome,
          totalExpenses,
          netProfit,
          transactionCount: monthEntries.length
        });
      } else {
        setFinancialData({
          totalIncome: 0,
          totalExpenses: 0,
          netProfit: 0,
          transactionCount: 0
        });
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
      setFinancialData({
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        transactionCount: 0
      });
    }
  };

  const loadGoalsData = () => {
    try {
      const storedGoals = localStorage.getItem('goals');
      if (storedGoals) {
        const goals = JSON.parse(storedGoals);
        setGoalsData(Array.isArray(goals) ? goals : []);
      } else {
        setGoalsData([]);
      }
    } catch (error) {
      console.error('Error loading goals data:', error);
      setGoalsData([]);
    }
  };

  const loadInventoryData = () => {
    try {
      const storedItems = localStorage.getItem('inventoryItems');
      if (storedItems) {
        const items = JSON.parse(storedItems);
        setInventoryData(Array.isArray(items) ? items : []);
      } else {
        setInventoryData([]);
      }
    } catch (error) {
      console.error('Error loading inventory data:', error);
      setInventoryData([]);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const lowStockItems = inventoryData.filter(item => item.quantity <= item.minStock);
  const completedGoals = goalsData.filter(goal => goal.progress >= 100);

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
            Receitas do Mês
          </CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
            {financialData ? formatCurrency(financialData.totalIncome) : formatCurrency(0)}
          </div>
          <p className="text-xs text-slate-600">
            {financialData?.transactionCount || 0} transações
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
            Lucro Líquido
          </CardTitle>
          {financialData?.netProfit >= 0 ? 
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" /> :
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          }
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${financialData?.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {financialData ? formatCurrency(financialData.netProfit) : formatCurrency(0)}
          </div>
          <p className="text-xs text-slate-600">
            {financialData?.netProfit >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
            Metas Ativas
          </CardTitle>
          <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
            {goalsData.length}
          </div>
          <p className="text-xs text-slate-600">
            {completedGoals.length} concluídas
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
            Estoque
          </CardTitle>
          {lowStockItems.length > 0 ? 
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" /> :
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          }
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
            {inventoryData.length}
          </div>
          <p className={`text-xs ${lowStockItems.length > 0 ? 'text-red-600' : 'text-slate-600'}`}>
            {lowStockItems.length > 0 ? `${lowStockItems.length} em falta` : 'Estoque OK'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

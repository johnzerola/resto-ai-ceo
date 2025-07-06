import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Plus, 
  DollarSign, 
  AlertTriangle, 
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  FileText,
  Bell,
  Settings
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CashFlowOverview } from "./CashFlowOverview";
import { CashFlowForm } from "./CashFlowForm";
import { AccountsPayableManager } from "./AccountsPayableManager";
import { AccountsReceivableManager } from "./AccountsReceivableManager";
import { FinancialCategoriesManager } from "./FinancialCategoriesManager";
import { FinancialMetricsWidget } from "./FinancialMetricsWidget";
import { QuickExpenseForm } from "./QuickExpenseForm";
import { FinancialAlertsWidget } from "./FinancialAlertsWidget";

interface AlertData {
  id: string;
  tipo_alerta: string;
  prioridade: string;
  titulo: string;
  mensagem: string;
  resolvido: boolean;
  data_criacao: string;
}

interface SummaryData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingPayables: number;
  pendingReceivables: number;
  overduePayables: number;
  overdueReceivables: number;
}

export function IntegratedCashFlowManager() {
  const { currentRestaurant } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [summary, setSummary] = useState<SummaryData>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingPayables: 0,
    pendingReceivables: 0,
    overduePayables: 0,
    overdueReceivables: 0
  });
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadSummaryData();
    }
  }, [currentRestaurant]);

  const loadSummaryData = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      // Carregar dados do fluxo de caixa do mês atual
      const { data: cashFlowData } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .gte('date', firstDayOfMonth.toISOString().split('T')[0])
        .eq('status', 'paid');

      // Carregar contas a pagar pendentes
      const { data: payablesData } = await supabase
        .from('contas_a_pagar')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .eq('status', 'pendente');

      // Carregar contas a receber pendentes
      const { data: receivablesData } = await supabase
        .from('contas_a_receber')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .eq('status', 'pendente');

      const today = new Date();
      
      const monthlyIncome = cashFlowData
        ?.filter(item => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0) || 0;

      const monthlyExpenses = cashFlowData
        ?.filter(item => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0) || 0;

      const pendingPayables = payablesData
        ?.reduce((sum, item) => sum + item.valor, 0) || 0;

      const pendingReceivables = receivablesData
        ?.reduce((sum, item) => sum + item.valor, 0) || 0;

      const overduePayables = payablesData
        ?.filter(item => new Date(item.data_vencimento) < today)
        .reduce((sum, item) => sum + item.valor, 0) || 0;

      const overdueReceivables = receivablesData
        ?.filter(item => new Date(item.data_vencimento) < today)
        .reduce((sum, item) => sum + item.valor, 0) || 0;

      setSummary({
        totalBalance: monthlyIncome - monthlyExpenses + pendingReceivables - pendingPayables,
        monthlyIncome,
        monthlyExpenses,
        pendingPayables,
        pendingReceivables,
        overduePayables,
        overdueReceivables
      });

    } catch (error) {
      console.error('Erro ao carregar dados do resumo:', error);
      toast.error('Erro ao carregar dados financeiros');
    }
  };


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };


  const handleEditEntry = (entryId: string) => {
    setEditingEntry({ id: entryId });
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEntry(null);
    loadSummaryData(); // Recarregar dados após alterações
  };

  if (!currentRestaurant) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Selecione um restaurante para gerenciar o fluxo de caixa
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Financeiras */}
      <FinancialMetricsWidget />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Saldo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(summary.totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receitas - Despesas + Pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.monthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receber: {formatCurrency(summary.pendingReceivables)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
              Despesas Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.monthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              A pagar: {formatCurrency(summary.pendingPayables)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              Monitoramento Ativo
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sistema de alertas inteligentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Widget de Alertas */}
      <FinancialAlertsWidget onAlertsUpdate={loadSummaryData} />

      {/* Botões de Ação Rápida - Mais Visíveis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="h-20 flex flex-col gap-3 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <CreditCard className="h-8 w-8" />
              <div className="text-center">
                <div className="font-bold">Nova Conta a Pagar</div>
                <div className="text-xs opacity-90">Gastos e fornecedores</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-red-600">💳 Nova Conta a Pagar</DialogTitle>
            </DialogHeader>
            <AccountsPayableManager onDataChange={loadSummaryData} />
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="h-20 flex flex-col gap-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <TrendingUp className="h-8 w-8" />
              <div className="text-center">
                <div className="font-bold">Nova Conta a Receber</div>
                <div className="text-xs opacity-90">Vendas e serviços</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-600">💰 Nova Conta a Receber</DialogTitle>
            </DialogHeader>
            <AccountsReceivableManager onDataChange={loadSummaryData} />
          </DialogContent>
        </Dialog>

        <Button 
          onClick={() => setShowForm(true)} 
          size="lg"
          className="h-20 flex flex-col gap-3 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-8 w-8" />
          <div className="text-center">
            <div className="font-bold">Nova Transação</div>
            <div className="text-xs opacity-90">Fluxo de caixa direto</div>
          </div>
        </Button>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="payables">A Pagar</TabsTrigger>
            <TabsTrigger value="receivables">A Receber</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <CashFlowOverview onEdit={handleEditEntry} />
        </TabsContent>

        <TabsContent value="payables">
          <AccountsPayableManager onDataChange={loadSummaryData} />
        </TabsContent>

        <TabsContent value="receivables">
          <AccountsReceivableManager onDataChange={loadSummaryData} />
        </TabsContent>

        <TabsContent value="transactions">
          <CashFlowOverview onEdit={handleEditEntry} />
        </TabsContent>

        <TabsContent value="categories">
          <FinancialCategoriesManager />
        </TabsContent>
      </Tabs>

      {/* Modal do formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CashFlowForm
              editingEntry={editingEntry}
              onEntryAdded={handleFormClose}
              onEditComplete={handleFormClose}
            />
            <div className="p-4 border-t">
              <Button variant="outline" onClick={handleFormClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
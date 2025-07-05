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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CashFlowOverview } from "./CashFlowOverview";
import { CashFlowForm } from "./CashFlowForm";
import { AccountsPayableManager } from "./AccountsPayableManager";
import { AccountsReceivableManager } from "./AccountsReceivableManager";
import { FinancialCategoriesManager } from "./FinancialCategoriesManager";
import { FinancialMetricsWidget } from "./FinancialMetricsWidget";

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
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingPayables: 0,
    pendingReceivables: 0,
    overduePayables: 0,
    overdueReceivables: 0
  });
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadSummaryData();
      loadAlerts();
      checkForAlerts();
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

  const loadAlerts = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('alertas_sistema')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .eq('resolvido', false)
        .in('tipo_alerta', ['vencimento_pagar', 'vencimento_receber', 'saldo_baixo'])
        .order('data_criacao', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setAlerts(data || []);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    }
  };

  const checkForAlerts = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoadingAlerts(true);
    try {
      const { data, error } = await supabase.functions.invoke('cash-flow-alerts', {
        body: { 
          restaurantId: currentRestaurant.id,
          daysBeforeDue: 3 
        }
      });

      if (error) throw error;

      if (data?.alertsProcessed > 0) {
        toast.success(`${data.alertsProcessed} novo(s) alerta(s) encontrado(s)`);
        loadAlerts(); // Recarregar alertas
      }
    } catch (error) {
      console.error('Erro ao verificar alertas:', error);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alertas_sistema')
        .update({ 
          resolvido: true,
          data_resolucao: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      toast.success('Alerta marcado como resolvido');
      loadAlerts();
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
      toast.error('Erro ao resolver alerta');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
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
              {alerts.length}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkForAlerts}
              disabled={isLoadingAlerts}
              className="text-xs mt-1 p-0 h-auto"
            >
              {isLoadingAlerts ? 'Verificando...' : 'Verificar Alertas'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Alertas Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={getPriorityColor(alert.prioridade)}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.titulo}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {alert.prioridade}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                        className="h-6 px-2 text-xs"
                      >
                        Resolver
                      </Button>
                    </div>
                  </AlertTitle>
                  <AlertDescription>
                    {alert.mensagem}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
          
          <Button onClick={() => setShowForm(true)} className="ml-4">
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
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
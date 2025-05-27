import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/restaurant/Layout";
import { OnboardingForm } from "@/components/restaurant/OnboardingForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/restaurant/StatsCard";
import { RevenueChart } from "@/components/restaurant/RevenueChart";
import { TopProducts } from "@/components/restaurant/TopProducts";
import { FileDigit, Receipt, ShoppingCart } from "lucide-react";
import { Alert, AlertType, Alerts } from "@/components/restaurant/Alerts";
import { CMVAnalysis } from "@/components/restaurant/CMVAnalysis";
import { useNavigate } from "react-router-dom";
import { getFinancialData } from "@/services/FinancialDataService";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { DashboardCustomizer } from "@/components/restaurant/DashboardCustomizer";
import { AdvancedAnalytics } from "@/components/restaurant/AdvancedAnalytics";
import { getSystemAlerts } from "@/services/ModuleIntegrationService";
import { DailySnapshot } from "@/components/restaurant/DailySnapshot";
import { PerformanceComparison } from "@/components/restaurant/PerformanceComparison";
import { QuickReports } from "@/components/restaurant/QuickReports";

// Dados de exemplo para os gráficos e componentes
const sampleRevenueData = [
  { name: "Jan", revenue: 12000 },
  { name: "Fev", revenue: 15000 },
  { name: "Mar", revenue: 18000 },
  { name: "Abr", revenue: 20000 },
  { name: "Mai", revenue: 19000 },
  { name: "Jun", revenue: 22000 },
];

const sampleProducts = [
  { name: "Picanha ao Ponto", sales: 120, revenue: 5400, margin: 35 },
  { name: "Filé Mignon", sales: 98, revenue: 4900, margin: 40 },
  { name: "Risoto de Camarão", sales: 75, revenue: 3000, margin: 32 },
  { name: "Tiramisu", sales: 62, revenue: 1240, margin: 45 },
];

const Index = () => {
  const [hasConfigData, setHasConfigData] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>([]);
  const navigate = useNavigate();

  // Verificar dados de configuração e alertas
  useEffect(() => {
    // Verificar se já existem dados de configuração
    const savedData = localStorage.getItem("restaurantData");
    if (savedData) {
      const data = JSON.parse(savedData);
      // Verificar se os dados mínimos foram configurados
      const hasMinimumData = data.businessName && 
                            data.fixedExpenses && 
                            data.variableExpenses && 
                            data.desiredProfitMargin;
      
      setHasConfigData(hasMinimumData);
      setShowOnboarding(!hasMinimumData);
    } else {
      setShowOnboarding(true);
      setHasConfigData(false);
    }

    // Carregar alertas do sistema
    setAlerts(getSystemAlerts());

    // Carregar KPIs selecionados
    const savedKPIs = localStorage.getItem('dashboardKPIs');
    if (savedKPIs) {
      setSelectedKPIs(JSON.parse(savedKPIs));
    } else {
      // KPIs padrão
      setSelectedKPIs(['sales_today', 'dishes_sold', 'average_ticket', 'cmv']);
    }
    
    // Configurar ouvinte de evento para atualizações de alertas
    const handleSystemAlert = () => {
      setAlerts(getSystemAlerts());
    };
    
    window.addEventListener('systemAlertAdded', handleSystemAlert);
    
    return () => {
      window.removeEventListener('systemAlertAdded', handleSystemAlert);
    };
  }, []);

  const handleConfigComplete = () => {
    setHasConfigData(true);
    setShowOnboarding(false);
    // Após completar a configuração, recarregar a página para mostrar o dashboard
    window.location.reload();
  };

  const handleAlertClick = (alert: Alert) => {
    if (alert.type === "warning" && alert.title === "Estoque Baixo") {
      navigate("/estoque");
      toast.info("Verificando itens com estoque baixo", {
        description: "Redirecionando para o módulo de estoque"
      });
    } else if (alert.type === "error" && alert.title.includes("CMV")) {
      navigate("/dre-cmv");
      toast.info("Analisando CMV", {
        description: "Redirecionando para análise de CMV"
      });
    }
  };
  
  // Gerenciar KPIs selecionados
  const handleSaveKPIs = (kpis: string[]) => {
    setSelectedKPIs(kpis);
  };

  // Renderizar KPI baseado no ID
  const renderKPI = (kpiId: string) => {
    switch (kpiId) {
      case 'sales_today':
        return (
          <StatsCard 
            title="Vendas Hoje" 
            value={formatCurrency(2350)} 
            description="em relação a ontem" 
            trend={{ value: 5, isPositive: true }}
          />
        );
      case 'dishes_sold':
        return (
          <StatsCard 
            title="Pratos Vendidos" 
            value="138" 
            description="23 pratos/hora" 
          />
        );
      case 'average_ticket':
        return (
          <StatsCard 
            title="Ticket Médio" 
            value={formatCurrency(85)} 
            description="em relação à semana passada" 
            trend={{ value: 2.4, isPositive: true }}
          />
        );
      case 'cmv':
        return (
          <StatsCard 
            title="CMV" 
            value="27%" 
            description="em relação à meta" 
            trend={{ value: 1.5, isPositive: false }}
            trendDesirable="down"
          />
        );
      case 'monthly_revenue':
        return (
          <StatsCard 
            title="Faturamento Mensal" 
            value={formatCurrency(62350)} 
            description="projeção para o mês" 
            trend={{ value: 7.2, isPositive: true }}
          />
        );
      case 'weekly_sales':
        return (
          <StatsCard 
            title="Vendas Semanais" 
            value={formatCurrency(15800)} 
            description="últimos 7 dias" 
            trend={{ value: 3.8, isPositive: true }}
          />
        );
      case 'dish_per_hour':
        return (
          <StatsCard 
            title="Pratos por Hora" 
            value="23" 
            description="média do período" 
          />
        );
      case 'table_turnover':
        return (
          <StatsCard 
            title="Rotatividade de Mesas" 
            value="4.2x" 
            description="clientes por mesa/dia" 
            trend={{ value: 0.8, isPositive: true }}
          />
        );
      case 'avg_service_time':
        return (
          <StatsCard 
            title="Tempo de Serviço" 
            value="18 min" 
            description="pedido até entrega" 
            trend={{ value: 2.5, isPositive: false }}
            trendDesirable="down"
          />
        );
      case 'labor_cost':
        return (
          <StatsCard 
            title="Custo de Pessoal" 
            value="25%" 
            description="da receita total" 
            trend={{ value: 0.5, isPositive: true }}
            trendDesirable="down"
          />
        );
      case 'utilities_cost':
        return (
          <StatsCard 
            title="Custos Fixos" 
            value={formatCurrency(9500)} 
            description="mensal" 
            trend={{ value: 1.2, isPositive: false }}
            trendDesirable="down"
          />
        );
      case 'profit_margin':
        return (
          <StatsCard 
            title="Margem de Lucro" 
            value="15.8%" 
            description="lucro líquido" 
            trend={{ value: 0.7, isPositive: true }}
          />
        );
      case 'sales_growth':
        return (
          <StatsCard 
            title="Crescimento" 
            value="8.3%" 
            description="vs. mês anterior" 
            trend={{ value: 8.3, isPositive: true }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      {showOnboarding ? (
        <div className="max-w-2xl mx-auto mt-8">
          <h1 className="text-2xl font-bold mb-6">Bem-vindo ao Resto AI CEO</h1>
          <p className="text-muted-foreground mb-8">
            Para começar, vamos configurar os dados financeiros do seu restaurante.
            Isso nos ajudará a fornecer análises mais precisas e recomendações personalizadas.
          </p>
          
          <Card>
            <CardContent className="pt-6">
              <OnboardingForm onComplete={handleConfigComplete} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
          {/* Dashboard com novos componentes contextuais */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Visão geral do seu restaurante
              </p>
            </div>
            <DashboardCustomizer onSaveSettings={handleSaveKPIs} />
          </div>

          {/* Novo componente de snapshot diário com dados em tempo real */}
          <DailySnapshot />
          
          {/* Comparativo de desempenho */}
          <PerformanceComparison />
          
          {/* Acesso rápido a relatórios */}
          <QuickReports />

          <Tabs defaultValue="visao-geral" className="space-y-4">
            <TabsList>
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              <TabsTrigger value="operacional">Operacional</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visao-geral" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {selectedKPIs.slice(0, 4).map(kpiId => (
                  <div key={kpiId}>
                    {renderKPI(kpiId)}
                  </div>
                ))}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Vendas por Período</h3>
                    <RevenueChart data={sampleRevenueData} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Produtos Mais Vendidos</h3>
                    <TopProducts products={sampleProducts} />
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">CMV por Categoria</h3>
                    <CMVAnalysis />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Alertas</h3>
                    <Alerts alerts={alerts} onActionClick={handleAlertClick} />
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <Button 
                  onClick={() => navigate("/ficha-tecnica")}
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <Receipt className="h-6 w-6" />
                  <span>Fichas Técnicas</span>
                </Button>
                
                <Button 
                  onClick={() => navigate("/estoque")}
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span>Estoque e Compras</span>
                </Button>
                
                <Button 
                  onClick={() => navigate("/dre-cmv")}
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <FileDigit className="h-6 w-6" />
                  <span>DRE e Análise de CMV</span>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="financeiro" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {selectedKPIs
                  .filter(kpi => ['sales_today', 'monthly_revenue', 'weekly_sales', 'average_ticket', 'cmv', 'profit_margin', 'labor_cost', 'utilities_cost'].includes(kpi))
                  .map(kpiId => (
                    <div key={kpiId}>
                      {renderKPI(kpiId)}
                    </div>
                  ))}
              </div>
              
              <AdvancedAnalytics />
            </TabsContent>
            
            <TabsContent value="operacional" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {selectedKPIs
                  .filter(kpi => ['dishes_sold', 'dish_per_hour', 'table_turnover', 'avg_service_time'].includes(kpi))
                  .map(kpiId => (
                    <div key={kpiId}>
                      {renderKPI(kpiId)}
                    </div>
                  ))}
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium">Eficiência Operacional</h3>
                  <p className="text-muted-foreground mt-2 mb-4">
                    Análise de métricas operacionais por período
                  </p>
                  
                  <div className="text-center py-8 text-muted-foreground">
                    Análises adicionais de eficiência operacional estarão disponíveis em breve.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-4">
              <AdvancedAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Layout>
  );
};

export default Index;

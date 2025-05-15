
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/restaurant/Layout";
import { OnboardingForm } from "@/components/restaurant/OnboardingForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/restaurant/StatsCard";
import { RevenueChart } from "@/components/restaurant/RevenueChart";
import { TopProducts } from "@/components/restaurant/TopProducts";
import { AlertCircle, FileDigit, Receipt, ShoppingCart } from "lucide-react";
import { Alerts } from "@/components/restaurant/Alerts";
import { CMVAnalysis } from "@/components/restaurant/CMVAnalysis";
import { useNavigate } from "react-router-dom";
import { getFinancialData } from "@/services/FinancialDataService";

const Index = () => {
  const [hasConfigData, setHasConfigData] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

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
  }, []);

  const handleConfigComplete = () => {
    setHasConfigData(true);
    setShowOnboarding(false);
    // Após completar a configuração, recarregar a página para mostrar o dashboard
    window.location.reload();
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Visão geral do seu restaurante
              </p>
            </div>
          </div>

          <Tabs defaultValue="visao-geral" className="space-y-4">
            <TabsList>
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              <TabsTrigger value="operacional">Operacional</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visao-geral" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard 
                  title="Vendas Hoje" 
                  value="R$ 2.350,00" 
                  description="+5% em relação a ontem" 
                  trend="up"
                />
                <StatsCard 
                  title="Pratos Vendidos" 
                  value="138" 
                  description="23 pratos/hora" 
                />
                <StatsCard 
                  title="Ticket Médio" 
                  value="R$ 85,00" 
                  description="+2,4% em relação à semana passada" 
                  trend="up"
                />
                <StatsCard 
                  title="CMV" 
                  value="27%" 
                  description="-1,5% em relação à meta" 
                  trend="down"
                  trendDesirable="down"
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Vendas por Período</h3>
                    <RevenueChart />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Produtos Mais Vendidos</h3>
                    <TopProducts />
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
                    <Alerts />
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
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium">Resumo Financeiro</h3>
                  <p className="text-muted-foreground mt-2">
                    Dados financeiros resumidos ainda em desenvolvimento.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="operacional" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium">Resumo Operacional</h3>
                  <p className="text-muted-foreground mt-2">
                    Dados operacionais resumidos ainda em desenvolvimento.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Layout>
  );
};

export default Index;

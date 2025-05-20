// Imports e código existente...
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/restaurant/Layout";
import { RestaurantSelector } from "@/components/restaurant/RestaurantSelector";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useUser, useAuth, UserRole } from "@/services/AuthService";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Progress } from "@/components/ui/progress";
import { CircleDollarSign, Forklift, PieChart, Salad, Store } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabaseDataService } from "@/services/SupabaseDataService";

ChartJS.register(ArcElement, Tooltip, Legend);

const Index = () => {
  const { user, userRole } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Dados de exemplo para o gráfico de custos
  const costData = {
    labels: ['Alimentos', 'Bebidas', 'Outros'],
    datasets: [
      {
        label: 'Custos',
        data: [300, 50, 100],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Opções de configuração do gráfico
  const costOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#6B7280', // Cor do texto da legenda
          boxWidth: 12, // Largura da caixa de cor da legenda
          padding: 20, // Espaçamento ao redor dos itens da legenda
          font: {
            size: 14 // Tamanho da fonte da legenda
          }
        },
      },
    },
  };

  // Dados de exemplo para o gráfico de estoque
  const stockData = {
    labels: ['Em Estoque', 'Mínimo', 'Ideal'],
    datasets: [
      {
        label: 'Estoque',
        data: [60, 30, 100],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Opções de configuração do gráfico de estoque
  const stockOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#6B7280', // Cor do texto da legenda
          boxWidth: 12, // Largura da caixa de cor da legenda
          padding: 20, // Espaçamento ao redor dos itens da legenda
          font: {
            size: 14 // Tamanho da fonte da legenda
          }
        },
      },
    },
  };

  useEffect(() => {
    const storedRestaurantData = localStorage.getItem("restaurantData");
    if (storedRestaurantData) {
      setSelectedRestaurant(JSON.parse(storedRestaurantData));
    }
  }, []);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      setIsLoading(true);
      try {
        if (selectedRestaurant) {
          const restaurant = await supabaseDataService.getById('restaurants', selectedRestaurant.id);
          setRestaurantData(restaurant);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do restaurante:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantData();
  }, [selectedRestaurant]);

  const handleRestaurantSelect = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    localStorage.setItem("restaurantData", JSON.stringify(restaurant));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu negócio
          </p>
        </div>

        <RestaurantSelector onRestaurantSelect={handleRestaurantSelect} />

        {!selectedRestaurant ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Selecione um restaurante para visualizar os dados.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vendas Mensais</CardTitle>
                  <CardDescription>
                    Visão geral das vendas do mês atual
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="text-2xl font-bold">
                    {isLoading ? <Skeleton width={100} /> : `R$ ${restaurantData?.average_monthly_sales || 0}`}
                  </div>
                  <Progress value={restaurantData?.average_monthly_sales ? (restaurantData?.average_monthly_sales / 10000) * 100 : 0} />
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? <Skeleton width={150} /> : `Meta: R$ 10.000`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custo Total</CardTitle>
                  <CardDescription>
                    Visão geral dos custos do mês atual
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="text-2xl font-bold">
                    {isLoading ? <Skeleton width={100} /> : `R$ ${restaurantData?.fixed_expenses || 0}`}
                  </div>
                  <Progress value={restaurantData?.fixed_expenses ? (restaurantData?.fixed_expenses / 5000) * 100 : 0} />
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? <Skeleton width={150} /> : `Meta: R$ 5.000`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Margem de Lucro</CardTitle>
                  <CardDescription>
                    Visão geral da margem de lucro atual
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="text-2xl font-bold">
                    {isLoading ? <Skeleton width={100} /> : `${restaurantData?.desired_profit_margin || 0}%`}
                  </div>
                  <Progress value={restaurantData?.desired_profit_margin || 0} />
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? <Skeleton width={150} /> : `Meta: 20%`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CMV</CardTitle>
                  <CardDescription>
                    Visão geral do Custo de Mercadorias Vendidas
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="text-2xl font-bold">
                    {isLoading ? <Skeleton width={100} /> : `${restaurantData?.target_food_cost || 0}%`}
                  </div>
                  <Progress value={restaurantData?.target_food_cost || 0} />
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? <Skeleton width={150} /> : `Meta: 30%`}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Visão Geral de Custos</CardTitle>
                  <CardDescription>
                    Análise detalhada dos seus custos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '300px' }}>
                    <Doughnut data={costData} options={costOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visão Geral de Estoque</CardTitle>
                  <CardDescription>
                    Análise detalhada do seu estoque
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '300px' }}>
                    <Doughnut data={stockData} options={stockOptions} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="financas">
                <AccordionTrigger>
                  <CircleDollarSign className="mr-2 h-4 w-4" />
                  Controle Financeiro
                </AccordionTrigger>
                <AccordionContent>
                  Gerencie suas finanças de forma eficiente.
                  <div className="mt-4 space-x-2">
                    <Button size="sm" onClick={() => handleNavigate("/fluxo-caixa")}>
                      Fluxo de Caixa
                    </Button>
                    <Button size="sm" onClick={() => handleNavigate("/contas-financeiras")}>
                      Contas a Pagar/Receber
                    </Button>
                    <Button size="sm" onClick={() => handleNavigate("/dre-cmv")}>
                      DRE/CMV
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="producao">
                <AccordionTrigger>
                  <Salad className="mr-2 h-4 w-4" />
                  Gestão de Produção
                </AccordionTrigger>
                <AccordionContent>
                  Otimize suas receitas e controle os custos dos ingredientes.
                  <div className="mt-4 space-x-2">
                    <Button size="sm" onClick={() => handleNavigate("/ficha-tecnica")}>
                      Ficha Técnica
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="estoque">
                <AccordionTrigger>
                  <Forklift className="mr-2 h-4 w-4" />
                  Controle de Estoque
                </AccordionTrigger>
                <AccordionContent>
                  Mantenha seu estoque sempre em dia.
                  <div className="mt-4 space-x-2">
                    <Button size="sm" onClick={() => handleNavigate("/estoque")}>
                      Estoque
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="sistema">
                <AccordionTrigger>
                  <Store className="mr-2 h-4 w-4" />
                  Status do Sistema
                </AccordionTrigger>
                <AccordionContent>
                  Acompanhe o status e a saúde do sistema.
                  <div className="mt-4 space-x-2">
                    <Button size="sm" onClick={() => handleNavigate("/status-sistema")}>
                      Status do Sistema
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </Layout>
    </ProtectedRoute>
  );
};

export default Index;

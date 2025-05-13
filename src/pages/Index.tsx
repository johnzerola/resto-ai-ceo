
import { useEffect, useState } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { StatsCard } from "@/components/restaurant/StatsCard";
import { RevenueChart } from "@/components/restaurant/RevenueChart";
import { TopProducts } from "@/components/restaurant/TopProducts";
import { Alerts } from "@/components/restaurant/Alerts";
import { OnboardingForm } from "@/components/restaurant/OnboardingForm";
import { DollarSign, TrendingUp, ShoppingBag, Users } from "lucide-react";

const Dashboard = () => {
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const restaurantData = localStorage.getItem("restaurantData");
    if (restaurantData) {
      setIsOnboarded(true);
    }
  }, []);

  // Sample data for charts
  const revenueData = [
    { name: "Jan", revenue: 30000 },
    { name: "Fev", revenue: 35000 },
    { name: "Mar", revenue: 28000 },
    { name: "Abr", revenue: 32000 },
    { name: "Mai", revenue: 40000 },
    { name: "Jun", revenue: 45000 },
    { name: "Jul", revenue: 50000 },
  ];

  // Sample data for top products
  const topProducts = [
    { name: "Pizza Margherita", sales: 145, revenue: 4350, margin: 35 },
    { name: "Filé Mignon", sales: 98, revenue: 6860, margin: 42 },
    { name: "Risoto de Camarão", sales: 87, revenue: 3915, margin: 28 },
    { name: "Salada Caesar", sales: 76, revenue: 2280, margin: 25 },
  ];

  // Sample alerts
  const alerts = [
    {
      type: "warning" as const,
      title: "Alerta de Estoque",
      description: "3 itens estão abaixo do nível mínimo",
    },
    {
      type: "error" as const,
      title: "CMV Alto",
      description: "CMV da categoria Bebidas acima de 40%",
    },
    {
      type: "success" as const,
      title: "Meta Atingida",
      description: "Faturamento da semana superou a meta em 12%",
    },
  ];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <OnboardingForm />
      </div>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu restaurante
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Faturamento Hoje"
          value={formatCurrency(3500)}
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Faturamento do Mês"
          value={formatCurrency(50000)}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Clientes do Mês"
          value="1,250"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="CMV Atual"
          value="32%"
          icon={<ShoppingBag className="h-5 w-5" />}
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart data={revenueData} />
        </div>
        <div className="lg:col-span-3">
          <TopProducts products={topProducts} />
        </div>
      </div>

      <div className="mt-6">
        <Alerts alerts={alerts} />
      </div>
    </Layout>
  );
};

export default Dashboard;

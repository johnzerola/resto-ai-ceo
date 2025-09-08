
import { useState, useEffect } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { DREOverview } from "@/components/restaurant/DREOverview";
import { CMVAnalysis } from "@/components/restaurant/CMVAnalysis";
import { FinancialMetricsWidget } from "@/components/restaurant/FinancialMetricsWidget";
import { FinancialCategoriesManager } from "@/components/restaurant/FinancialCategoriesManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DreCmv = () => {
  const [activeTab, setActiveTab] = useState("dre");
  const [configData, setConfigData] = useState<any>(null);
  const { user } = useAuth();
  
  // Carregar configurações do restaurante
  useEffect(() => {
    const loadRestaurantConfig = async () => {
      if (!user) return;

      try {
        // Buscar o restaurante do usuário
        const { data: restaurants, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', user.id)
          .limit(1);

        if (restaurantError) {
          console.error('Erro ao buscar restaurante:', restaurantError);
          return;
        }

        if (restaurants && restaurants.length > 0) {
          const restaurant = restaurants[0];
          setConfigData({
            businessName: restaurant.name,
            targetFoodCost: restaurant.target_food_cost,
            targetBeverageCost: restaurant.target_beverage_cost
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    loadRestaurantConfig();
  }, [user]);

  return (
    <ModernLayout>
      <div className="main-content-padding space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">DRE & CMV</h1>
          <p className="text-muted-foreground">
            Demonstrativo de Resultados e Custo de Mercadoria Vendida
          </p>
        </div>

        {configData && (configData.targetFoodCost || configData.targetBeverageCost) && (
          <div className="mb-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Metas de CMV configuradas:
              {configData.targetFoodCost && (
                <span className="ml-2 text-green-600 font-medium">
                  • CMV Alvo (Alimentos): {configData.targetFoodCost}%
                </span>
              )}
              {configData.targetBeverageCost && (
                <span className="ml-2 text-green-600 font-medium">
                  • CMV Alvo (Bebidas): {configData.targetBeverageCost}%
                </span>
              )}
            </p>
          </div>
        )}

        {/* Métricas Financeiras em Tempo Real */}
        <FinancialMetricsWidget />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dre">DRE</TabsTrigger>
            <TabsTrigger value="cmv">CMV</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
          </TabsList>
          <TabsContent value="dre">
            <DREOverview />
          </TabsContent>
          <TabsContent value="cmv">
            <CMVAnalysis />
          </TabsContent>
          <TabsContent value="categorias">
            <FinancialCategoriesManager />
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
};

export default DreCmv;

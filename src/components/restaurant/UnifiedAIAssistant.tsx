
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Megaphone, 
  Download,
  RefreshCw,
  Calculator
} from "lucide-react";
import { toast } from "sonner";
import { useSubscriptionPlan } from "@/hooks/useSubscriptionPlan";
import { supabase } from "@/integrations/supabase/client";
import { AIChat } from "./ai/AIChat";
import { AILimitedChat } from "./ai/AILimitedChat";
import { AutoCalculationService } from "@/services/AutoCalculationService";

interface RestaurantContext {
  restaurantData: any;
  menuData: any;
  financialData: any;
  simulatorData: any;
  restaurantId?: string;
}

export function UnifiedAIAssistant() {
  const { hasFeature } = useSubscriptionPlan();
  const [activeTab, setActiveTab] = useState<'manager' | 'social'>('manager');
  const [context, setContext] = useState<RestaurantContext | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    console.log('🚀 [UnifiedAIAssistant] Componente montado, carregando contexto...');
    loadRestaurantContext();
  }, []);

  const loadRestaurantContext = async () => {
    setIsLoadingData(true);
    try {
      console.log('📊 [UnifiedAIAssistant] Iniciando carregamento do contexto...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ [UnifiedAIAssistant] Usuário não autenticado');
        return;
      }

      console.log('✅ [UnifiedAIAssistant] Usuário autenticado:', user.id);

      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1);

      const restaurant = restaurants?.[0];
      const restaurantId = restaurant?.id;

      console.log('🏪 [UnifiedAIAssistant] Restaurante encontrado:', restaurant?.name, 'ID:', restaurantId);

      const [cashFlowData, inventoryData, recipesData, goalsData] = await Promise.all([
        supabase.from('cash_flow').select('*').eq('restaurant_id', restaurantId).order('date', { ascending: false }).limit(50),
        supabase.from('inventory').select('*').eq('restaurant_id', restaurantId),
        supabase.from('recipes').select('*').eq('restaurant_id', restaurantId),
        supabase.from('goals').select('*').eq('restaurant_id', restaurantId)
      ]);

      const newContext = {
        restaurantData: restaurant || {},
        menuData: recipesData.data || [],
        financialData: cashFlowData.data || [],
        simulatorData: {},
        restaurantId: restaurantId
      };

      setContext(newContext);

      console.log('✅ [UnifiedAIAssistant] Contexto carregado com sucesso:');
      console.log('📊 [UnifiedAIAssistant] Dados:', {
        restaurant: restaurant?.name,
        restaurantId: restaurantId,
        cashFlow: cashFlowData.data?.length || 0,
        inventory: inventoryData.data?.length || 0,
        recipes: recipesData.data?.length || 0,
        goals: goalsData.data?.length || 0
      });

    } catch (error) {
      console.error('❌ [UnifiedAIAssistant] Erro ao carregar contexto:', error);
      toast.error('Erro ao carregar dados do restaurante');
    } finally {
      setIsLoadingData(false);
    }
  };

  const exportHistory = () => {
    toast.success('Funcionalidade de exportação será implementada em breve!');
  };

  const recalculateData = async () => {
    if (!context?.restaurantId) {
      toast.error('Nenhum restaurante encontrado');
      return;
    }

    setIsLoadingData(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await AutoCalculationService.recalculateAllData(context.restaurantId, user.id);
      await loadRestaurantContext(); // Recarregar dados após recálculo
    } catch (error) {
      console.error('Erro ao recalcular dados:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  console.log('🔍 [UnifiedAIAssistant] Verificando feature hasFullAIAssistant:', hasFeature('hasFullAIAssistant'));
  console.log('📋 [UnifiedAIAssistant] Contexto atual:', context);

  if (!hasFeature('hasFullAIAssistant')) {
    console.log('⚠️ [UnifiedAIAssistant] Usuário não tem acesso completo, mostrando versão limitada');
    return (
      <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
        <div className="flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'manager' | 'social')} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="manager" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Gerente Virtual</span>
                <span className="sm:hidden">Gerente</span>
                <Badge variant="secondary" className="text-xs">Limitado</Badge>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Megaphone className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Social Media IA</span>
                <span className="sm:hidden">Social</span>
                <Badge variant="secondary" className="text-xs">Limitado</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="flex-1 min-h-0 mt-2 sm:mt-4">
              <AILimitedChat aiType={activeTab} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  console.log('✅ [UnifiedAIAssistant] Usuário tem acesso completo, mostrando versão completa');

  return (
    <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-shrink-0">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadRestaurantContext} 
            size="sm"
            disabled={isLoadingData}
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar Contexto</span>
            <span className="sm:hidden">Atualizar</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={recalculateData} 
            size="sm"
            disabled={isLoadingData}
          >
            <Calculator className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Recalcular Dados</span>
            <span className="sm:hidden">Recalcular</span>
          </Button>
          <Button variant="outline" onClick={exportHistory} size="sm">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'manager' | 'social')} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="manager" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Gerente Virtual</span>
              <span className="sm:hidden">Gerente</span>
              {context?.restaurantId && (
                <Badge variant="outline" className="text-xs">Conectado</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Megaphone className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Social Media IA</span>
              <span className="sm:hidden">Social</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 min-h-0 mt-2 sm:mt-4">
            <AIChat aiType={activeTab} context={context} />
          </TabsContent>
        </Tabs>
      </div>

      {context && (
        <Card className="flex-shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              Sistema Conectado {isLoadingData && <RefreshCw className="h-3 w-3 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                <Badge variant="outline" className="text-xs">Restaurante</Badge>
                <p className="mt-1 text-xs sm:text-sm">{context.restaurantData.name || 'Não configurado'}</p>
              </div>
              <div>
                <Badge variant="outline" className="text-xs">Receitas</Badge>
                <p className="mt-1 text-xs sm:text-sm">{context.menuData.length || 0} itens</p>
              </div>
              <div>
                <Badge variant="outline" className="text-xs">Transações</Badge>
                <p className="mt-1 text-xs sm:text-sm">{context.financialData.length || 0} registros</p>
              </div>
              <div>
                <Badge variant="outline" className="text-xs">Status</Badge>
                <p className="mt-1 text-xs sm:text-sm font-medium text-green-600">
                  {isLoadingData ? 'Carregando...' : 'Dados Reais'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

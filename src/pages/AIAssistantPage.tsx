
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { UnifiedAIAssistant } from "@/components/restaurant/UnifiedAIAssistant";
import { ProtectedFeature } from "@/components/subscription/ProtectedFeature";
import { useSubscriptionPlan } from "@/hooks/useSubscriptionPlan";
import { AutoCalculationService } from "@/services/AutoCalculationService";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function AIAssistantPage() {
  const { refreshSubscription } = useSubscriptionPlan();

  // Forçar atualização dos dados da assinatura ao carregar a página
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Executar cálculos automáticos ao carregar a página
  useEffect(() => {
    const runAutoCalculations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: restaurants } = await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1);

        const restaurantId = restaurants?.[0]?.id;
        if (restaurantId) {
          await AutoCalculationService.runAllCalculations(restaurantId);
        }
      } catch (error) {
        console.error('Erro ao executar cálculos automáticos:', error);
      }
    };

    runAutoCalculations();
  }, []);

  return (
    <ModernLayout>
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-2 sm:p-4 lg:p-6 bg-background min-h-screen max-w-full overflow-hidden">
        <div className="space-y-1">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight">Assistente de IA</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Seu consultor pessoal para gestão inteligente
          </p>
        </div>

        <div className="w-full min-w-0 overflow-hidden">
          <ProtectedFeature
            feature="hasFullAIAssistant"
            featureName="Assistente IA Completo"
            description="Tenha acesso completo aos assistentes de IA: Gerente Virtual e Social Media IA com todas as funcionalidades."
          >
            <div className="h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] lg:h-[calc(100vh-220px)]">
              <UnifiedAIAssistant />
            </div>
          </ProtectedFeature>
        </div>
      </div>
    </ModernLayout>
  );
}

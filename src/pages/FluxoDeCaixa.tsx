
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { IntegratedCashFlowManager } from "@/components/restaurant/IntegratedCashFlowManager";

export default function FluxoDeCaixa() {
  return (
    <ModernLayout>
      <div className="p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 bg-background min-h-screen">
        <div className="flex flex-col space-y-2">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight">Fluxo de Caixa Integrado</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Gestão completa de transações, contas a pagar e receber com alertas inteligentes
          </p>
        </div>
        
        <IntegratedCashFlowManager />
      </div>
    </ModernLayout>
  );
}

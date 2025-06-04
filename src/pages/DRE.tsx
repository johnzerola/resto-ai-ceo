
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { DREOverview } from "@/components/restaurant/DREOverview";

export function DRE() {
  return (
    <ModernLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:justify-between sm:items-start">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              DRE - Demonstrativo de Resultados
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Demonstrativo completo dos resultados financeiros
            </p>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <DREOverview />
        </div>
      </div>
    </ModernLayout>
  );
}

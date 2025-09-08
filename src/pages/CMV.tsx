
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { IntegratedCMVAnalysis } from "@/components/restaurant/IntegratedCMVAnalysis";

export function CMV() {
  return (
    <ModernLayout>
      <div className="main-content-padding space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CMV - Custo da Mercadoria Vendida</h1>
            <p className="text-muted-foreground">
              Análise detalhada dos custos e margens de lucro
            </p>
          </div>
        </div>
        <IntegratedCMVAnalysis />
      </div>
    </ModernLayout>
  );
}

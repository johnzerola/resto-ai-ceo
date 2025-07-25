
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { TrialBlocker } from "@/components/trial/TrialBlocker";

export function Receitas() {
  return (
    <TrialBlocker 
      featureName="Gestão de Receitas" 
      description="Controle completo de receitas, custos e margens de lucro"
    >
      <ModernLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
          <p className="text-muted-foreground">
            Controle de receitas em desenvolvimento
          </p>
        </div>
      </ModernLayout>
    </TrialBlocker>
  );
}

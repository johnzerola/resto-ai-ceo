
import { Layout } from "@/components/restaurant/Layout";
import { DREOverview } from "@/components/restaurant/DREOverview";

export function DRE() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">DRE - Demonstrativo de Resultados</h1>
            <p className="text-muted-foreground">
              Demonstrativo completo dos resultados financeiros
            </p>
          </div>
        </div>
        <DREOverview />
      </div>
    </Layout>
  );
}

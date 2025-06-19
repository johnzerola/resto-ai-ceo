
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { DashboardEmpresarial } from "@/components/restaurant/DashboardEmpresarial";

export default function DashboardEmpresarialPage() {
  return (
    <ModernLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Empresarial</h1>
          <p className="text-muted-foreground">
            Visão completa da performance e indicadores do seu restaurante
          </p>
        </div>
        <DashboardEmpresarial />
      </div>
    </ModernLayout>
  );
}

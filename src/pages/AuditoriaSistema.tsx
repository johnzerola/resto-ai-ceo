
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { SystemAuditDashboard } from "@/components/audit/SystemAuditDashboard";

export function AuditoriaSistema() {
  return (
    <ModernLayout>
      <div className="main-content-padding space-y-4 sm:space-y-6 bg-background min-h-screen">
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:justify-between sm:items-start">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              Auditoria do Sistema
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Monitoramento completo de alterações e saúde do sistema
            </p>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <SystemAuditDashboard />
        </div>
      </div>
    </ModernLayout>
  );
}

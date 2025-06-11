
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { PrivacyDashboard } from "@/components/security/PrivacyDashboard";

export function Privacidade() {
  return (
    <ModernLayout>
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-2 sm:p-4 lg:p-6 bg-background min-h-screen max-w-full overflow-hidden">
        <div className="space-y-1">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight">Privacidade e Segurança</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Gerencie suas configurações de privacidade e segurança
          </p>
        </div>

        <div className="w-full min-w-0 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[280px] w-full">
              <PrivacyDashboard />
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}

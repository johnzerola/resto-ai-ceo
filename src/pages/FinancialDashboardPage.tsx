
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";

const FinancialDashboardPage = () => {
  return (
    <ModernLayout>
      <div className="main-content-padding space-y-6 bg-background min-h-screen">
        <FinancialDashboard />
      </div>
    </ModernLayout>
  );
};

export default FinancialDashboardPage;

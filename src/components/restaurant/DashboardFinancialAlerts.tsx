import { EnhancedFinancialAlertsWidget } from "./EnhancedFinancialAlertsWidget";

export function DashboardFinancialAlerts() {
  return <EnhancedFinancialAlertsWidget maxAlerts={3} showAutoRefresh={false} />;
}
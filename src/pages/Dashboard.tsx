
import { OptimizedDashboard } from "@/components/dashboard/OptimizedDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";

export function Dashboard() {
  return (
    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
      <OptimizedDashboard />
    </ProtectedRoute>
  );
}

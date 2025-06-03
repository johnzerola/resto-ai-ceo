
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { OptimizedDashboard } from "@/components/dashboard/OptimizedDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";

const Index = () => {
  return (
    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
      <ModernLayout>
        <OptimizedDashboard />
      </ModernLayout>
    </ProtectedRoute>
  );
};

export default Index;


import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { Dashboard } from "@/components/restaurant/Dashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";

const Index = () => {
  return (
    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
      <ModernLayout>
        <Dashboard />
      </ModernLayout>
    </ProtectedRoute>
  );
};

export default Index;

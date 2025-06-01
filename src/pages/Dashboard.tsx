
import { StreamlinedDashboard } from "@/components/dashboard/StreamlinedDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";

export function Dashboard() {
  return (
    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
      <StreamlinedDashboard />
    </ProtectedRoute>
  );
}


import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services/AuthService";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, hasPermission, isLoading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute verificando:", { 
    isAuthenticated, 
    isLoading, 
    path: location.pathname,
    user: user?.email 
  });

  // Loading state melhorado com verificação de timeout
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md mx-auto p-6">
          <div className="text-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Verificando autenticação...</p>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Verificar autenticação - evitar loop em /onboarding
  if (!isAuthenticated) {
    console.log("Usuário não autenticado, redirecionando para login");
    
    // Se estiver em /onboarding, redirecionar para dashboard após login
    const redirectPath = location.pathname === '/onboarding' ? '/dashboard' : location.pathname;
    
    return <Navigate to="/login" state={{ from: redirectPath }} replace />;
  }

  // Verificar permissões apenas se role é especificada
  if (requiredRole && user && !hasPermission(requiredRole)) {
    console.log("Usuário sem permissão adequada");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Acesso autorizado para:", location.pathname);
  return <>{children}</>;
};

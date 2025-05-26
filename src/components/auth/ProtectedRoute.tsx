
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

  console.log("ProtectedRoute - Estado:", { 
    isAuthenticated, 
    isLoading, 
    pathname: location.pathname,
    userRole: user?.role 
  });

  // Mostrar loading enquanto verifica autenticação
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

  // Se não autenticado, redirecionar para login
  if (!isAuthenticated) {
    console.log("ProtectedRoute - Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Verificar permissões apenas se role é especificada
  if (requiredRole && user && !hasPermission(requiredRole)) {
    console.log("ProtectedRoute - Usuário sem permissão adequada");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("ProtectedRoute - Acesso autorizado para:", location.pathname);
  return <>{children}</>;
};

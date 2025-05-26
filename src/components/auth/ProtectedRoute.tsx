
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

  console.log("ProtectedRoute:", { 
    isAuthenticated, 
    isLoading, 
    path: location.pathname,
    user: user?.email 
  });

  // Mostrar loading melhorado enquanto verifica autenticação
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

  // Verificar se o usuário está autenticado
  if (!isAuthenticated) {
    console.log("Usuário não autenticado, redirecionando para login");
    // Redirecionar para login e lembrar a página atual para redirecionar de volta após o login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Verificar permissões se um papel específico é requerido
  if (requiredRole && user && !hasPermission(requiredRole)) {
    console.log("Usuário sem permissão, redirecionando para acesso negado");
    return <Navigate to="/acesso-negado" replace />;
  }

  console.log("Acesso autorizado, renderizando componente");
  // Se o usuário está autenticado e tem permissão, renderizar o componente filho
  return <>{children}</>;
};

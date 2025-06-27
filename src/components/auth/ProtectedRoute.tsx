
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services/AuthService";
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, userRole, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - Estado:', {
    isAuthenticated,
    isLoading,
    pathname: location.pathname,
    userRole: userRole || 'undefined',
    userId: user?.id
  });

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se requer autenticação e não está autenticado, redirecionar para login
  if (requireAuth && !isAuthenticated) {
    console.log('ProtectedRoute: Redirecionando para login - usuário não autenticado');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se especifica um papel específico, verificar permissões
  if (requiredRole && userRole) {
    const hasPermission = () => {
      if (userRole === UserRole.OWNER) {
        return true; // Proprietário tem acesso a tudo
      }
      
      if (userRole === UserRole.MANAGER) {
        return requiredRole !== UserRole.OWNER;
      }
      
      return userRole === requiredRole;
    };

    if (!hasPermission()) {
      console.log('ProtectedRoute: Acesso negado - permissões insuficientes');
      return <Navigate to="/access-denied" replace />;
    }
  }

  // Se passou por todas as verificações, renderizar o componente
  return <>{children}</>;
}


import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services/AuthService";
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requireAuth?: boolean;
  allowOnboarding?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireAuth = true,
  allowOnboarding = false
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, userRole, user, needsOnboarding } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - Estado:', {
    isAuthenticated,
    isLoading,
    pathname: location.pathname,
    userRole: userRole || 'undefined',
    userId: user?.id,
    needsOnboarding
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

  // Se está autenticado mas precisa de onboarding e não está na página de onboarding
  if (isAuthenticated && needsOnboarding && location.pathname !== '/onboarding' && !allowOnboarding) {
    console.log('ProtectedRoute: Redirecionando para onboarding - usuário precisa configurar restaurante');
    return <Navigate to="/onboarding" replace />;
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


import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services/AuthService";
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { ProtectedOnboardingRoute } from "./ProtectedOnboardingRoute";

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
  const { isAuthenticated, isLoading, userRole, user, needsOnboarding } = useAuth();
  const location = useLocation();

  // Estado monitorado via context

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
    // Redirecionamento automático para login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se está autenticado mas precisa de onboarding e não está na página de onboarding
  // Adicionar verificação extra para prevenir loops
  if (isAuthenticated && needsOnboarding && location.pathname !== '/onboarding' && location.pathname !== '/dashboard') {
    // Redirecionamento para onboarding obrigatório apenas se não estiver tentando acessar dashboard
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
      // Acesso negado por permissões insuficientes
      return <Navigate to="/access-denied" replace />;
    }
  }

  // Se passou por todas as verificações, usar o ProtectedOnboardingRoute
  return (
    <ProtectedOnboardingRoute requireOnboardingComplete={true}>
      {children}
    </ProtectedOnboardingRoute>
  );
}

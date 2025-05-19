
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services/AuthService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, hasPermission } = useAuth();
  const location = useLocation();

  // Verificar se o usuário está autenticado
  if (!isAuthenticated) {
    // Redirecionar para login e lembrar a página atual para redirecionar de volta após o login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Verificar permissões se um papel específico é requerido
  if (requiredRole && user && !hasPermission(requiredRole)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  // Se o usuário está autenticado e tem permissão, renderizar o componente filho
  return <>{children}</>;
};

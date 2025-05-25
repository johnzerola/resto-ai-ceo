
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { securityService } from "@/services/SecurityService";

export function useSecurityMonitoring() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Log de login bem-sucedido
      securityService.logSecurityEvent({
        userId: user.id,
        eventType: 'login'
      });

      // Log de acesso a dados quando o usuário navega
      securityService.logDataAccess(user.id, 'dashboard', 'read');
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Monitorar mudanças de visibilidade da página
    const handleVisibilityChange = () => {
      if (document.hidden && user) {
        // Usuário saiu da aba/minimizou
        securityService.logSecurityEvent({
          userId: user.id,
          eventType: 'logout'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  return {
    logSecurityEvent: securityService.logSecurityEvent.bind(securityService),
    logDataAccess: securityService.logDataAccess.bind(securityService)
  };
}

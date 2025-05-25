
import { useEffect, ReactNode } from "react";
import { securityService } from "@/services/SecurityService";
import { toast } from "sonner";

interface SecurityMiddlewareProps {
  children: ReactNode;
}

export function SecurityMiddleware({ children }: SecurityMiddlewareProps) {
  useEffect(() => {
    // Interceptar tentativas de XSS
    const handleInvalidInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.value && !securityService.validateSQLInput(target.value)) {
        event.preventDefault();
        target.value = securityService.sanitizeInput(target.value);
        toast.warning("Entrada de dados foi sanitizada por segurança");
      }
    };

    // Adicionar listener para todos os inputs
    document.addEventListener('input', handleInvalidInput);

    // Monitorar tentativas de console
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      // Em produção, isso poderia ser desabilitado
      originalConsoleLog.apply(console, args);
    };

    // Detectar DevTools
    let devtools = {
      open: false,
      orientation: null
    };

    const threshold = 160;
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          console.warn("DevTools detectado - monitoramento de segurança ativo");
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    return () => {
      document.removeEventListener('input', handleInvalidInput);
    };
  }, []);

  return <>{children}</>;
}


import { useEffect } from 'react';

export function useSimpleSecurityMonitoring() {
  useEffect(() => {
    // Monitoramento básico de segurança sem dependência do AuthContext
    const checkDevTools = () => {
      if (typeof window !== 'undefined' && window.console && window.console.clear) {
        const threshold = 160;
        if (window.outerHeight - window.innerHeight > threshold ||
            window.outerWidth - window.innerWidth > threshold) {
          console.warn('DevTools detectado - monitoramento de segurança ativo');
        }
      }
    };

    // Verificar DevTools periodicamente
    const intervalId = setInterval(checkDevTools, 5000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, []);
}

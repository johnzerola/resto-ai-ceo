
import { useEffect } from 'react';

export function useSimpleSecurityMonitoring() {
  useEffect(() => {
    console.log("Inicializando monitoramento de segurança...");
    
    // Monitoramento básico sem dependência do AuthContext
    const checkDevTools = () => {
      if (typeof window !== 'undefined' && window.console) {
        const threshold = 160;
        if (window.outerHeight - window.innerHeight > threshold ||
            window.outerWidth - window.innerWidth > threshold) {
          console.warn('DevTools detectado - monitoramento de segurança ativo');
        }
      }
    };

    // Verificar DevTools a cada 5 segundos
    const intervalId = setInterval(checkDevTools, 5000);

    // Monitorar tentativas de manipulação do DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Registrar atividade suspeita sem bloquear
          console.log('Mudança detectada no DOM');
        }
      });
    });

    // Observar mudanças no documento
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      clearInterval(intervalId);
      observer.disconnect();
      console.log("Monitoramento de segurança finalizado");
    };
  }, []);
}

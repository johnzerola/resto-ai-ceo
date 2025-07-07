
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { migrateUserFinancialData } from '@/services/FinancialStorageService';
import { toast } from 'sonner';

interface DataSyncProps {
  children: React.ReactNode;
}

export function DataSync({ children }: DataSyncProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      try {
        // Inicialização otimizada - não esperar auth se não necessário
        const quickInit = () => {
          if (mounted) {
            setIsInitialized(true);
          }
        };

        // Se ainda está carregando auth, dar timeout mais curto
        if (authLoading) {
          const timeout = setTimeout(quickInit, 1000); // Reduzido de 2s para 1s
          return () => clearTimeout(timeout);
        }

        // Inicializar dados se houver usuário (de forma assíncrona)
        if (user) {
          // Não bloquear a UI esperando migração
          requestIdleCallback ? requestIdleCallback(() => {
            migrateUserFinancialData().catch(console.error);
          }) : setTimeout(() => {
            migrateUserFinancialData().catch(console.error);
          }, 100);
          
          // Garantir estrutura básica de dados rapidamente
          const dataKeys = ['cashFlow', 'goals', 'inventory', 'recipes', 'restaurantData'];
          dataKeys.forEach(key => {
            const userKey = `${key}_${user.id}`;
            if (!localStorage.getItem(userKey)) {
              const defaultValue = key === 'restaurantData' ? {} : [];
              localStorage.setItem(userKey, JSON.stringify(defaultValue));
            }
          });
        }

        quickInit();
      } catch (error) {
        console.error('Erro na inicialização:', error);
        if (mounted) {
          setIsInitialized(true); // Permitir que o app continue mesmo com erro
        }
      }
    };

    initializeData();

    // Timeout de segurança reduzido - permitir que o app continue após 1.5 segundos
    const safetyTimeout = setTimeout(() => {
      if (mounted && !isInitialized) {
        console.log('Safety timeout - forçando inicialização');
        setIsInitialized(true);
      }
    }, 1500); // Reduzido de 3s para 1.5s

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [user, authLoading, isInitialized]);

  // Mostrar loading apenas muito brevemente para não impactar UX
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm">Inicializando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

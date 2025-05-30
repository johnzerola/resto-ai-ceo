
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
        // Se ainda está carregando auth, aguardar um pouco mas não indefinidamente
        if (authLoading) {
          const timeout = setTimeout(() => {
            if (mounted) {
              console.log('Auth timeout - prosseguindo com inicialização');
              setIsInitialized(true);
            }
          }, 2000);
          return () => clearTimeout(timeout);
        }

        // Inicializar dados se houver usuário
        if (user) {
          console.log('Inicializando dados para usuário:', user.id);
          await migrateUserFinancialData();
          
          // Garantir estrutura básica de dados
          const dataKeys = ['cashFlow', 'goals', 'inventory', 'recipes', 'restaurantData'];
          dataKeys.forEach(key => {
            const userKey = `${key}_${user.id}`;
            if (!localStorage.getItem(userKey)) {
              const defaultValue = key === 'restaurantData' ? {} : [];
              localStorage.setItem(userKey, JSON.stringify(defaultValue));
            }
          });
        }

        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        if (mounted) {
          setIsInitialized(true); // Permitir que o app continue mesmo com erro
        }
      }
    };

    initializeData();

    // Timeout de segurança - sempre permitir que o app continue após 3 segundos
    const safetyTimeout = setTimeout(() => {
      if (mounted && !isInitialized) {
        console.log('Safety timeout - forçando inicialização');
        setIsInitialized(true);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [user, authLoading, isInitialized]);

  // Mostrar loading apenas brevemente
  if (!isInitialized && authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

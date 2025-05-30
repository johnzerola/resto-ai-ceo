
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { migrateUserFinancialData } from '@/services/FinancialStorageService';
import { toast } from 'sonner';

interface DataSyncProps {
  children: React.ReactNode;
}

export function DataSync({ children }: DataSyncProps) {
  const { user, isLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeUserData = async () => {
      if (isLoading) return;
      
      try {
        if (user) {
          console.log('Inicializando dados para usuário:', user.id);
          
          // Verificar se já foi inicializado para evitar re-execução
          const initKey = `initialized_${user.id}`;
          const alreadyInitialized = localStorage.getItem(initKey);
          
          if (!alreadyInitialized) {
            // Migrar dados financeiros para o formato específico do usuário
            await migrateUserFinancialData();
            
            // Inicializar outros dados se necessário
            const userKeys = [
              'cashFlow',
              'goals', 
              'inventory',
              'recipes',
              'restaurantData'
            ];
            
            userKeys.forEach(key => {
              const userKey = `${key}_${user.id}`;
              
              // Se não existem dados específicos do usuário, criar dados vazios
              if (!localStorage.getItem(userKey)) {
                const defaultValue = key === 'restaurantData' ? {} : [];
                localStorage.setItem(userKey, JSON.stringify(defaultValue));
              }
            });
            
            // Marcar como inicializado
            localStorage.setItem(initKey, 'true');
            console.log('Inicialização de dados completada para usuário:', user.id);
          } else {
            console.log('Dados já inicializados para usuário:', user.id);
          }
        } else {
          console.log('Usuário não autenticado');
        }
        
        if (isMounted) {
          setIsInitialized(true);
          setHasError(false);
        }
      } catch (error) {
        console.error('Erro na inicialização de dados:', error);
        if (isMounted) {
          setHasError(true);
          setIsInitialized(true); // Permitir que o app continue mesmo com erro
          toast.error('Erro ao inicializar dados, mas você pode continuar usando o sistema');
        }
      }
    };

    // Pequeno delay para evitar execução imediata
    const timeoutId = setTimeout(initializeUserData, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [user, isLoading]);

  // Timeout de segurança para evitar travamento infinito
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn('Inicialização demorou muito, forçando continuação');
        setIsInitialized(true);
        toast.warning('Inicialização demorou mais que o esperado, continuando...');
      }
    }, 5000); // 5 segundos

    return () => clearTimeout(safetyTimeout);
  }, [isInitialized]);

  // Não renderizar até que a inicialização esteja completa
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Inicializando dados...</p>
          {hasError && (
            <p className="text-sm text-yellow-600 mt-2">
              Houve um problema, mas você pode continuar
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

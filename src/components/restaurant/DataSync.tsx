
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

  useEffect(() => {
    let isMounted = true;

    const initializeUserData = async () => {
      // Don't wait for auth loading to complete - handle both states
      if (isLoading) {
        // If still loading auth, wait a bit but don't block indefinitely
        setTimeout(() => {
          if (isMounted && isLoading) {
            console.log('Auth still loading, proceeding anyway');
            setIsInitialized(true);
          }
        }, 2000);
        return;
      }
      
      try {
        if (user) {
          console.log('Inicializando dados para usuário:', user.id);
          
          // Quick initialization without complex checks
          await migrateUserFinancialData();
          
          // Ensure basic data structure exists
          const userKeys = [
            'cashFlow',
            'goals', 
            'inventory',
            'recipes',
            'restaurantData'
          ];
          
          userKeys.forEach(key => {
            const userKey = `${key}_${user.id}`;
            if (!localStorage.getItem(userKey)) {
              const defaultValue = key === 'restaurantData' ? {} : [];
              localStorage.setItem(userKey, JSON.stringify(defaultValue));
            }
          });
          
          console.log('Inicialização completada para usuário:', user.id);
        } else {
          console.log('Usuário não autenticado - prosseguindo sem dados específicos');
        }
        
        if (isMounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        // Don't block the app even if initialization fails
        if (isMounted) {
          setIsInitialized(true);
          toast.error('Erro na inicialização, mas você pode continuar usando o sistema');
        }
      }
    };

    initializeUserData();

    // Safety timeout - always allow the app to proceed after 3 seconds
    const safetyTimeout = setTimeout(() => {
      if (isMounted && !isInitialized) {
        console.log('Timeout de segurança ativado - prosseguindo');
        setIsInitialized(true);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [user, isLoading]);

  // Show loading only briefly, then always proceed
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

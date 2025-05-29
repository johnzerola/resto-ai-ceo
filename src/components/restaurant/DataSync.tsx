
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
    const initializeUserData = async () => {
      if (isLoading) return;
      
      if (user) {
        try {
          console.log('Inicializando dados para usuário:', user.id);
          
          // Migrar dados financeiros para o formato específico do usuário
          await migrateUserFinancialData();
          
          // Verificar e migrar outros dados se necessário
          const userKeys = [
            'cashFlow',
            'goals', 
            'inventory',
            'recipes',
            'restaurantData'
          ];
          
          userKeys.forEach(key => {
            const userKey = `${key}_${user.id}`;
            const oldData = localStorage.getItem(key);
            
            // Se não existem dados específicos do usuário mas existem dados antigos
            if (!localStorage.getItem(userKey) && oldData) {
              try {
                localStorage.setItem(userKey, oldData);
                console.log(`Dados ${key} migrados para usuário:`, user.id);
              } catch (error) {
                console.error(`Erro ao migrar ${key}:`, error);
                // Criar dados vazios em caso de erro
                localStorage.setItem(userKey, JSON.stringify([]));
              }
            } else if (!localStorage.getItem(userKey)) {
              // Criar dados vazios se não existir nada
              const defaultValue = key === 'restaurantData' ? {} : [];
              localStorage.setItem(userKey, JSON.stringify(defaultValue));
            }
          });
          
          console.log('Inicialização de dados completada para usuário:', user.id);
        } catch (error) {
          console.error('Erro na inicialização de dados:', error);
          toast.error('Erro ao inicializar dados do usuário');
        }
      } else {
        console.log('Usuário não autenticado, limpando dados locais');
        // Limpar quaisquer dados de usuário se não estiver autenticado
        const keysToClean = [
          'financialData',
          'cashFlow',
          'goals',
          'inventory', 
          'recipes',
          'restaurantData'
        ];
        
        keysToClean.forEach(key => {
          // Manter apenas dados que não são específicos de usuário
          const allKeys = Object.keys(localStorage);
          allKeys.forEach(storageKey => {
            if (storageKey.startsWith(key + '_')) {
              // Não limpar dados específicos de outros usuários
              return;
            }
            if (storageKey === key) {
              localStorage.removeItem(storageKey);
            }
          });
        });
      }
      
      setIsInitialized(true);
    };

    initializeUserData();
  }, [user, isLoading]);

  // Não renderizar até que a inicialização esteja completa
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Inicializando dados...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

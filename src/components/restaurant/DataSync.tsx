
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { migrateUserFinancialData } from '@/services/FinancialStorageService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DataSyncProps {
  children: React.ReactNode;
}

export function DataSync({ children }: DataSyncProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCleaningData, setIsCleaningData] = useState(false);

  // Função para detectar e limpar dados de usuários novos
  const checkAndCleanNewUser = async (userId: string) => {
    try {
      setIsCleaningData(true);
      
      // Verificar se é usuário novo (criado nas últimas 24h)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('created_at, onboarding_complete')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao verificar perfil:', error);
        return;
      }

      if (profile) {
        const isNewUser = new Date(profile.created_at).getTime() > Date.now() - (24 * 60 * 60 * 1000);
        const needsCleaning = isNewUser && !profile.onboarding_complete;

        if (needsCleaning) {
          console.log('🧹 Usuário novo detectado - iniciando limpeza automática');
          
          // Chamar função de limpeza do Supabase
          const { error: cleanError } = await supabase.rpc('clean_user_data', {
            user_uuid: userId
          });

          if (cleanError) {
            console.error('Erro na limpeza automática:', cleanError);
          } else {
            console.log('✨ Limpeza automática concluída - ambiente limpo garantido');
            
            // Limpar localStorage também
            const keysToClean = [
              'cashFlow', 'goals', 'inventory', 'recipes', 'restaurantData',
              'financialData', 'currentUser'
            ];
            
            keysToClean.forEach(key => {
              const userKey = `${key}_${userId}`;
              localStorage.removeItem(userKey);
              localStorage.removeItem(key); // Versão sem user_id também
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro na verificação de usuário novo:', error);
    } finally {
      setIsCleaningData(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      try {
        // Inicialização otimizada
        const quickInit = () => {
          if (mounted) {
            setIsInitialized(true);
          }
        };

        // Se ainda está carregando auth, timeout mais rápido
        if (authLoading) {
          const timeout = setTimeout(quickInit, 800);
          return () => clearTimeout(timeout);
        }

        // Se houver usuário, verificar se precisa de limpeza
        if (user) {
          // Primeiro, verificar e limpar se necessário
          await checkAndCleanNewUser(user.id);
          
          // Migração de dados em background (não bloquear UI)
          requestIdleCallback ? requestIdleCallback(() => {
            migrateUserFinancialData().catch(console.error);
          }) : setTimeout(() => {
            migrateUserFinancialData().catch(console.error);
          }, 100);
        }

        quickInit();
      } catch (error) {
        console.error('Erro na inicialização:', error);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeData();

    // Timeout de segurança ainda mais agressivo para UX
    const safetyTimeout = setTimeout(() => {
      if (mounted && !isInitialized) {
        console.log('⚡ Safety timeout - forçando inicialização rápida');
        setIsInitialized(true);
      }
    }, 1200);

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [user, authLoading]);

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

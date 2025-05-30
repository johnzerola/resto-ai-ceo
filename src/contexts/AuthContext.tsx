import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/services/AuthService';
import { toast } from 'sonner';

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  subscriptionInfo: SubscriptionInfo;
  userRestaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
  setCurrentRestaurant: (restaurant: Restaurant) => void;
  createRestaurant: (name: string) => Promise<void>;
  checkSubscription: () => Promise<void>;
  createCheckoutSession: (priceId: string) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRestaurants, setUserRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });

  // Função para limpar dados do usuário
  const clearUserData = () => {
    setUser(null);
    setSession(null);
    setUserRole(null);
    setUserRestaurants([]);
    setCurrentRestaurant(null);
    setSubscriptionInfo({
      subscribed: false,
      subscription_tier: null,
      subscription_end: null,
    });
    
    // Limpar localStorage de dados específicos do usuário (mantendo configurações globais)
    const keysToRemove = [
      'financialData',
      'cashFlow',
      'goals',
      'restaurantData',
      'currentUser',
      'inventory',
      'recipes'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  };

  // Função para inicializar dados de novo usuário
  const initializeNewUserData = async (userId: string) => {
    try {
      console.log('Inicializando dados para novo usuário:', userId);
      
      // Criar dados financeiros vazios
      const emptyFinancialData = {
        receita: 0,
        cmv: 0,
        cmvPercentage: 0,
        profitMargin: 0,
        fixedCosts: 0,
        variableCosts: 0,
        netProfit: 0,
        lastUpdate: new Date().toISOString()
      };
      
      localStorage.setItem('financialData', JSON.stringify(emptyFinancialData));
      localStorage.setItem('cashFlow', JSON.stringify([]));
      localStorage.setItem('goals', JSON.stringify([]));
      localStorage.setItem('inventory', JSON.stringify([]));
      localStorage.setItem('recipes', JSON.stringify([]));
      
      console.log('Dados iniciais criados para novo usuário');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar dados do usuário:', error);
      return false;
    }
  };

  const checkSubscription = async () => {
    try {
      if (!session?.access_token) {
        console.log('No session available for subscription check');
        return;
      }

      console.log('Checking subscription status...');
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      console.log('Subscription check response:', data);
      setSubscriptionInfo({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const createCheckoutSession = async (priceId: string) => {
    try {
      if (!session?.access_token) {
        toast.error('Você precisa estar logado para assinar');
        return;
      }

      console.log('Creating checkout session for price:', priceId);
      toast.loading('Criando sessão de checkout...');

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      toast.dismiss();

      if (error) {
        console.error('Error creating checkout session:', error);
        toast.error('Erro ao criar sessão de checkout');
        return;
      }

      if (data?.url) {
        console.log('Redirecting to checkout:', data.url);
        window.open(data.url, '_blank');
        toast.success('Redirecionando para o checkout...');
      } else {
        console.error('No checkout URL received');
        toast.error('Erro: URL de checkout não recebida');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error creating checkout session:', error);
      toast.error('Erro ao criar sessão de checkout');
    }
  };

  const openCustomerPortal = async () => {
    try {
      if (!session?.access_token) {
        toast.error('Você precisa estar logado');
        return;
      }

      console.log('Opening customer portal...');
      toast.loading('Abrindo portal do cliente...');

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      toast.dismiss();

      if (error) {
        console.error('Error opening customer portal:', error);
        toast.error('Erro ao abrir portal do cliente');
        return;
      }

      if (data?.url) {
        console.log('Redirecting to customer portal:', data.url);
        window.open(data.url, '_blank');
        toast.success('Redirecionando para o portal...');
      } else {
        console.error('No portal URL received');
        toast.error('Erro: URL do portal não recebida');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error opening customer portal:', error);
      toast.error('Erro ao abrir portal do cliente');
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        toast.error('Erro no login. Verifique suas credenciais.');
        return false;
      }

      if (data.user) {
        toast.success('Login realizado com sucesso!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro no login. Verifique suas credenciais.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        console.error('Erro no cadastro:', error);
        toast.error('Erro no cadastro. Tente novamente.');
        return false;
      }

      if (data.user) {
        toast.success('Conta criada com sucesso! Verifique seu email.');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro no cadastro. Tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
        toast.error('Erro no logout.');
        return;
      }

      clearUserData();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro no logout.');
    }
  };

  // Alias functions for compatibility
  const login = signIn;
  const register = signUp;
  const logout = signOut;

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!userRole) return false;

    // Hierarquia de permissões
    if (userRole === UserRole.OWNER) {
      return true; // Proprietário tem acesso a tudo
    }
    
    if (userRole === UserRole.MANAGER) {
      return requiredRole !== UserRole.OWNER; // Gerente não tem acesso às funções exclusivas do proprietário
    }
    
    // Funcionário só tem acesso às funções de funcionário
    return userRole === requiredRole;
  };

  const createRestaurant = async (name: string): Promise<void> => {
    try {
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Criar restaurante via Supabase
      const { data, error } = await supabase
        .from('restaurants')
        .insert([
          {
            name,
            owner_id: user.id,
            business_type: 'Restaurante',
            target_food_cost: 30,
            target_beverage_cost: 25,
            desired_profit_margin: 50,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar restaurante no Supabase:', error);
        // Fallback para criar localmente
        const newRestaurant: Restaurant = {
          id: crypto.randomUUID(),
          name,
          user_id: user.id,
          created_at: new Date().toISOString(),
        };

        setUserRestaurants(prev => [...prev, newRestaurant]);
        setCurrentRestaurant(newRestaurant);
      } else {
        const newRestaurant: Restaurant = {
          id: data.id,
          name: data.name,
          user_id: data.owner_id,
          created_at: data.created_at,
        };

        setUserRestaurants(prev => [...prev, newRestaurant]);
        setCurrentRestaurant(newRestaurant);
      }

      toast.success('Restaurante criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar restaurante:', error);
      toast.error('Erro ao criar restaurante');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar sessão existente
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Verificar se é um usuário novo (criado há menos de 1 hora)
          const userCreatedAt = new Date(currentSession.user.created_at);
          const now = new Date();
          const hoursDiff = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 1) {
            console.log('Novo usuário detectado, inicializando dados...');
            await initializeNewUserData(currentSession.user.id);
          }
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('AuthContext: Auth state changed:', event, currentSession?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        clearUserData();
        setIsLoading(false);
        return;
      }

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        
        // Se for um novo login, verificar se precisa inicializar dados
        if (event === 'SIGNED_IN') {
          const userCreatedAt = new Date(currentSession.user.created_at);
          const now = new Date();
          const hoursDiff = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 1) {
            console.log('Novo usuário logado, inicializando dados...');
            await initializeNewUserData(currentSession.user.id);
          }
        }
        
        setIsLoading(true);
        try {
          // Buscar perfil do usuário
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentSession.user.id)
            .single();
          
          if (profile) {
            console.log('AuthContext: Perfil encontrado:', profile);
            setUserRole(profile.role as UserRole);
          } else {
            console.log('AuthContext: Criando perfil padrão');
            setUserRole(UserRole.OWNER);
          }

          // Configurar restaurante padrão
          const defaultRestaurant: Restaurant = {
            id: 'default',
            name: 'Meu Restaurante',
            user_id: currentSession.user.id,
            created_at: new Date().toISOString(),
          };
          setUserRestaurants([defaultRestaurant]);
          setCurrentRestaurant(defaultRestaurant);
        } catch (error) {
          console.error('AuthContext: Erro ao buscar perfil:', error);
          setUserRole(UserRole.OWNER);
        } finally {
          setIsLoading(false);
        }
      } else {
        clearUserData();
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verificar assinatura quando a sessão mudar
  useEffect(() => {
    if (session?.access_token) {
      // Usar setTimeout para evitar problemas de concorrência
      setTimeout(() => {
        checkSubscription();
      }, 1000);
    }
  }, [session?.access_token]);

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    session,
    userRole,
    isLoading,
    isAuthenticated,
    subscriptionInfo,
    userRestaurants,
    currentRestaurant,
    signIn,
    signUp,
    signOut,
    login,
    register,
    logout,
    hasPermission,
    setCurrentRestaurant,
    createRestaurant,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/services/AuthService';
import { toast } from 'sonner';
import { useOptimizedQueries } from '@/hooks/useOptimizedQueries';

// Cache para restaurantes (30 min)
const RESTAURANT_CACHE_TIME = 30 * 60 * 1000;
const restaurantCache = new Map<string, { data: Restaurant[]; timestamp: number }>();

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
  plan?: string | null;
  status?: string | null;
  nextBilling?: string | null;
  amount?: string | null;
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
  needsOnboarding: boolean;
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
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [lastAuthCheck, setLastAuthCheck] = useState<number>(0);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    plan: null,
    status: null,
    nextBilling: null,
    amount: null,
  });

  const { fetchUserDataOptimized, clearCache } = useOptimizedQueries();

  // Função para limpar dados do usuário
  const clearUserData = () => {
    setUser(null);
    setSession(null);
    setUserRole(null);
    setUserRestaurants([]);
    setCurrentRestaurant(null);
    setNeedsOnboarding(false);
    setSubscriptionInfo({
      subscribed: false,
      subscription_tier: null,
      subscription_end: null,
      plan: null,
      status: null,
      nextBilling: null,
      amount: null,
    });
    
    // Limpar cache de queries
    clearCache();
    
    // Limpar apenas dados temporários do localStorage
    // NÃO limpar dados que devem persistir entre sessões
    const tempKeys = [
      'currentUser',
      'financialData',
      'cashFlow',
      'cashFlowEntries',
      'goals',
      'inventory',
      'recipes'
    ];
    
    tempKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Erro ao remover ${key} do localStorage:`, error);
      }
    });
    
    // Dados do restaurante são mantidos entre sessões
  };

  const checkSubscription = useCallback(async () => {
    try {
      // Debounce subscription check (máximo 1 vez por minuto)
      const now = Date.now();
      if (now - lastAuthCheck < 60000) {
        return;
      }
      setLastAuthCheck(now);

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
        plan: data.subscription_tier || 'basic',
        status: data.subscribed ? 'active' : 'inactive',
        nextBilling: data.subscription_end || 'Não disponível',
        amount: data.subscribed ? 'R$ 99,00' : 'Não disponível',
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }, [session?.access_token, lastAuthCheck]);

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
      // Tentativa de login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        toast.error('Erro no login. Verifique suas credenciais.');
        return false;
      }

      if (data.user && data.session) {
        toast.success('Login realizado com sucesso!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro no login. Verifique suas credenciais.');
      return false;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Tentativa de criação de conta
      
      // Garantir HTTPS para redirecionamento em produção
      const redirectUrl = window.location.protocol === 'https:' 
        ? `${window.location.origin}/login?confirmed=true`
        : `https://${window.location.host}/login?confirmed=true`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name,
          },
        },
      });

      if (error) {
        console.error('Erro no cadastro:', error);
        if (error.message.includes('already registered')) {
          toast.error('Este email já está cadastrado. Tente fazer login.');
        } else {
          toast.error(`Erro no cadastro: ${error.message}`);
        }
        return false;
      }

      if (data.user) {
        // Conta criada com sucesso
        
        // Verificar se precisa confirmar email
        if (!data.session) {
          toast.success('Conta criada com sucesso! Verifique seu email para confirmar.', {
            description: 'Um email de confirmação foi enviado automaticamente.',
            duration: 8000
          });
        } else {
          toast.success('Conta criada e confirmada com sucesso!');
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro no cadastro. Tente novamente.');
      return false;
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
        setNeedsOnboarding(false);
      } else {
        const newRestaurant: Restaurant = {
          id: data.id,
          name: data.name,
          user_id: data.owner_id,
          created_at: data.created_at,
        };

        setUserRestaurants(prev => [...prev, newRestaurant]);
        setCurrentRestaurant(newRestaurant);
        setNeedsOnboarding(false);
      }

      toast.success('Restaurante criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar restaurante:', error);
      toast.error('Erro ao criar restaurante');
    }
  };

  const checkUserRestaurants = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Verificando restaurantes para usuário:', userId);
      
      // Query simples e direta
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', userId)
        .limit(10);

      if (error) {
        console.error('Erro ao buscar restaurantes:', error);
        setNeedsOnboarding(true);
        return;
      }
      
      const formattedRestaurants = (restaurants || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        user_id: r.owner_id,
        created_at: r.created_at,
      }));
      
      console.log('🏪 Restaurantes encontrados:', formattedRestaurants.length);
      
      if (formattedRestaurants.length > 0) {
        setUserRestaurants(formattedRestaurants);
        setCurrentRestaurant(formattedRestaurants[0]);
        setNeedsOnboarding(false);
        setUserRole(UserRole.OWNER);
      } else {
        console.log('📝 Nenhum restaurante encontrado - redirecionando para onboarding');
        setNeedsOnboarding(true);
        setUserRole(UserRole.OWNER);
      }
      
    } catch (error) {
      console.error('Erro crítico ao verificar restaurantes:', error);
      setNeedsOnboarding(true);
      setUserRole(UserRole.OWNER);
    }
  }, []);

  // Debounce para checkUserRestaurants
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  
  const debouncedCheckUserRestaurants = useCallback((userId: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      checkUserRestaurants(userId);
    }, 300);
  }, [checkUserRestaurants]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('✅ Inicializando autenticação...');
        
        // Evitar inicialização muito frequente
        const now = Date.now();
        if (now - lastAuthCheck < 2000) {
          setIsLoading(false);
          return;
        }
        setLastAuthCheck(now);
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user && mounted) {
          console.log('✅ Sessão ativa encontrada:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Verificar restaurantes diretamente sem debounce para acelerar carregamento
          await checkUserRestaurants(currentSession.user.id);
        } else {
          console.log('ℹ️ Nenhuma sessão ativa encontrada');
          clearUserData();
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        clearUserData();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.email);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !currentSession) {
        console.log('Usuário deslogado');
        clearUserData();
        setIsLoading(false);
        return;
      }

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        
        if (event === 'SIGNED_IN') {
          console.log('Login realizado - carregando dados...');
          await checkUserRestaurants(currentSession.user.id);
        } else if (event === 'INITIAL_SESSION') {
          console.log('Sessão inicial - carregando dados...');
          await checkUserRestaurants(currentSession.user.id);
        }
      } else {
        clearUserData();
      }
      
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, [debouncedCheckUserRestaurants]);

  // Check subscription when session changes
  useEffect(() => {
    if (session?.access_token) {
      setTimeout(() => {
        checkSubscription();
      }, 1000);
    }
  }, [session?.access_token]);

  const isAuthenticated = !!user && !!session;

  // Memoizar o valor do contexto para evitar re-renders desnecessários
  const value: AuthContextType = useMemo(() => ({
    user,
    session,
    userRole,
    isLoading,
    isAuthenticated,
    needsOnboarding,
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
  }), [
    user,
    session,
    userRole,
    isLoading,
    isAuthenticated,
    needsOnboarding,
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
  ]);

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

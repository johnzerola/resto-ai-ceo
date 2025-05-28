
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, loginUser, registerUser, logoutUser, getUserById } from '@/services/AuthService';
import { toast } from 'sonner';

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  subscriptionInfo: SubscriptionInfo;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
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
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });

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
        toast.error('Erro ao verificar assinatura');
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
      toast.error('Erro ao verificar assinatura');
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
        // Abrir o checkout do Stripe em uma nova aba
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
        // Abrir o portal do cliente em uma nova aba
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

      setUser(null);
      setSession(null);
      setUserRole(null);
      setSubscriptionInfo({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
      });
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro no logout.');
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        console.log('AuthContext: Usuário logado ou sessão restaurada...');
        console.log('AuthContext estado atual:', {
          user: currentSession.user.email,
          isAuthenticated: true,
          isLoading: false,
          session: !!currentSession,
          subscriptionInfo
        });
      }
      
      setIsLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('AuthContext: Auth state changed:', event, currentSession?.user?.email);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        console.log('AuthContext: Usuário logado ou sessão restaurada...');
        console.log('AuthContext estado atual:', {
          user: currentSession.user.email,
          isAuthenticated: true,
          isLoading: false,
          session: !!currentSession,
          subscriptionInfo
        });
        
        console.log('AuthContext: Sessão detectada, buscando perfil...');
        console.log('AuthContext: Buscando perfil para usuário:', currentSession.user.id);
        
        setIsLoading(true);
        try {
          // Fetch user profile from Supabase profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentSession.user.id)
            .single();
          
          if (profile) {
            console.log('AuthContext: Perfil encontrado:', profile);
            setUserRole(profile.role as UserRole);
          } else {
            // Default to employee if no profile found
            setUserRole(UserRole.EMPLOYEE);
          }
        } catch (error) {
          console.error('AuthContext: Erro ao buscar perfil:', error);
          setUserRole(UserRole.EMPLOYEE);
        } finally {
          setIsLoading(false);
        }
        
        console.log('AuthContext estado atual:', {
          user: currentSession.user.email,
          isAuthenticated: true,
          isLoading: false,
          session: !!currentSession,
          subscriptionInfo
        });
      } else {
        setUserRole(null);
        setSubscriptionInfo({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verificar assinatura quando a sessão mudar
  useEffect(() => {
    if (session?.access_token) {
      checkSubscription();
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
    signIn,
    signUp,
    signOut,
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

import React, { createContext, useContext, useState, useEffect } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/services/AuthService";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

interface RestaurantMember {
  id: string;
  restaurant_id: string;
  user_id: string;
  role: string;
}

interface Restaurant {
  id: string;
  name: string;
  owner_id: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  currentRestaurant: Restaurant | null;
  userRestaurants: Restaurant[];
  subscriptionInfo: SubscriptionInfo;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  hasPermission: (role: UserRole) => boolean;
  createRestaurant: (name: string, businessType?: string) => Promise<string | null>;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  checkSubscription: () => Promise<void>;
  createCheckoutSession: (priceId: string) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRestaurants, setUserRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null
  });

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    setIsLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("AuthContext: Auth state changed:", event, newSession?.user?.email);
        if (!mounted) return;
        setSession(newSession);

        if (newSession?.user) {
          console.log("AuthContext: Usuário logado ou sessão restaurada...");
        } else {
          console.log("AuthContext: Usuário deslogado ou sem sessão, limpando estado...");
          setUser(null);
          setUserRestaurants([]);
          setCurrentRestaurant(null);
        }
      }
    );
    authSubscription = subscription;

    const getInitialSession = async () => {
      try {
        console.log("AuthContext: Obtendo sessão inicial...");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao obter sessão inicial:", error);
        } else {
          console.log("AuthContext: Sessão inicial obtida:", currentSession?.user?.email || "Nenhuma");
          if (mounted) {
          }
        }

      } catch (error) {
         console.error("Erro no getInitialSession:", error);
      } finally {
         if (mounted) {
           setIsLoading(false);
         }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const checkSubscription = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      setSubscriptionInfo({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const createCheckoutSession = async (priceId: string) => {
    if (!session) {
      toast.error('Você precisa estar logado para assinar');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        toast.error('Erro ao criar sessão de checkout');
        return;
      }

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Erro ao processar pagamento');
    }
  };

  const openCustomerPortal = async () => {
    if (!session) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        toast.error('Erro ao abrir portal do cliente');
        return;
      }

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Erro ao abrir portal');
    }
  };

  useEffect(() => {
    if (session?.user) {
      console.log("AuthContext: Sessão detectada, buscando perfil...");
      setIsLoading(true);
      fetchUserProfile(session.user.id);
      checkSubscription(); // Check subscription when session is available
    } else {
      setUser(null);
      setUserRestaurants([]);
      setCurrentRestaurant(null);
      setSubscriptionInfo({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      });
    }

    return () => {
    };
  }, [session]);

  useEffect(() => {
    if (user) {
      loadUserRestaurants();
    }
  }, [user]);

  // Função para buscar o perfil do usuário
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("AuthContext: Buscando perfil para usuário:", userId);
      
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        
        // Se o perfil não existe, criar um novo
        if (profileError.code === 'PGRST116') {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            console.log("AuthContext: Criando novo perfil para:", authUser.email);
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: authUser.id,
                  name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
                  email: authUser.email || '',
                  role: UserRole.OWNER
                }
              ])
              .select()
              .single();

            if (createError) {
              console.error('Erro ao criar perfil:', createError);
            } else if (newProfile) {
              console.log("AuthContext: Perfil criado com sucesso:", newProfile);
              setUser({
                id: newProfile.id,
                name: newProfile.name,
                email: newProfile.email,
                role: newProfile.role as UserRole
              });
            }
          }
        } else {
          // Outros erros ao buscar perfil
        }
      } else if (profile) {
        console.log("AuthContext: Perfil encontrado:", profile);
        setUser({
          id: profile.id,
          name: profile.name || 'Usuário',
          email: profile.email || '',
          role: profile.role as UserRole || UserRole.EMPLOYEE
        });
      }
    } catch (error) {
      console.error('Erro ao processar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRestaurants = async () => {
    if (!user?.id) return;

    try {
      // Primeiro, buscar restaurantes que o usuário é proprietário
      const { data: ownedRestaurants, error: ownedError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id);

      if (ownedError) {
        console.error('Erro ao buscar restaurantes próprios:', ownedError);
        return;
      }

      // Depois, buscar restaurantes onde o usuário é membro
      const { data: memberships, error: membershipsError } = await supabase
        .from('restaurant_members')
        .select('restaurant_id')
        .eq('user_id', user.id);

      if (membershipsError) {
        console.error('Erro ao buscar associações:', membershipsError);
        return;
      }

      // Buscar detalhes dos restaurantes onde o usuário é membro
      let memberRestaurants: Restaurant[] = [];
      
      if (memberships && memberships.length > 0) {
        const restaurantIds = memberships.map(m => m.restaurant_id);
        
        const { data: restaurants, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', restaurantIds);

        if (restaurantsError) {
          console.error('Erro ao buscar restaurantes de membros:', restaurantsError);
        } else if (restaurants) {
          memberRestaurants = restaurants;
        }
      }

      // Combinar restaurantes próprios e associados
      const allRestaurants = [...(ownedRestaurants || []), ...memberRestaurants];
      setUserRestaurants(allRestaurants);

      // Se o usuário tiver restaurantes e nenhum estiver definido como atual,
      // selecione o primeiro restaurante como atual
      if (allRestaurants.length > 0 && !currentRestaurant) {
        setCurrentRestaurant(allRestaurants[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("AuthContext: Iniciando processo de login para:", email);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('AuthContext: Erro de login:', error.message);
        toast.error('Erro ao fazer login: ' + error.message);
        return false;
      }

      if (data.user && data.session) {
        console.log("AuthContext: Login bem-sucedido para:", data.user.email);
        // O fetchUserProfile será chamado automaticamente pelo onAuthStateChange
        return true;
      }

      return false;
    } catch (error) {
      console.error('AuthContext: Erro ao fazer login:', error);
      toast.error('Erro ao fazer login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string,
    role: UserRole = UserRole.EMPLOYEE
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (error) {
        console.error('Erro de registro:', error.message);
        toast.error('Erro ao registrar: ' + error.message);
        return false;
      }

      if (data.user) {
        toast.success('Registro realizado com sucesso!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      toast.error('Erro ao registrar usuário');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setCurrentRestaurant(null);
      setUserRestaurants([]);
      toast.info('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const createRestaurant = async (name: string, businessType?: string): Promise<string | null> => {
    if (!user) {
      toast.error('Você precisa estar logado para criar um restaurante');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('restaurants')
        .insert([
          { 
            name, 
            owner_id: user.id,
            business_type: businessType || 'Restaurante'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar restaurante:', error);
        toast.error('Erro ao criar restaurante');
        return null;
      }

      if (data) {
        toast.success(`Restaurante "${name}" criado com sucesso!`);
        
        // Adicionar o novo restaurante à lista
        const newRestaurant = data as Restaurant;
        setUserRestaurants([...userRestaurants, newRestaurant]);
        
        // Definir como restaurante atual
        setCurrentRestaurant(newRestaurant);
        
        return newRestaurant.id;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao criar restaurante:', error);
      toast.error('Erro ao criar restaurante');
      return null;
    }
  };

  const hasPermission = (role: UserRole): boolean => {
    if (!user) return false;
    
    // Hierarquia de permissões
    if (user.role === UserRole.OWNER) {
      return true; // Proprietário tem acesso a tudo
    }
    
    if (user.role === UserRole.MANAGER) {
      return role !== UserRole.OWNER; // Gerente não tem acesso às funções exclusivas do proprietário
    }
    
    // Funcionário só tem acesso às funções de funcionário
    return user.role === role;
  };

  console.log("AuthContext estado atual:", { 
    user: user?.email, 
    isAuthenticated: !!user, 
    isLoading,
    session: !!session,
    subscriptionInfo
  });

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      session,
      currentRestaurant,
      userRestaurants,
      subscriptionInfo,
      login,
      logout,
      register,
      hasPermission,
      createRestaurant,
      setCurrentRestaurant,
      checkSubscription,
      createCheckoutSession,
      openCustomerPortal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

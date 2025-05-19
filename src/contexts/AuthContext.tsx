
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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  hasPermission: (role: UserRole) => boolean;
  createRestaurant: (name: string, businessType?: string) => Promise<string | null>;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRestaurants, setUserRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    // Configurar o listener para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          // Adiar a busca de perfil para evitar deadlock
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Verificar se já existe uma sessão
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Carregar restaurantes do usuário quando o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      loadUserRestaurants();
    } else {
      setUserRestaurants([]);
      setCurrentRestaurant(null);
    }
  }, [user?.id]);

  // Função para buscar o perfil do usuário
  const fetchUserProfile = async (userId: string) => {
    try {
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        setIsLoading(false);
        return;
      }

      if (profile) {
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

  // Carregar restaurantes do usuário
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
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro de login:', error.message);
        toast.error('Erro ao fazer login: ' + error.message);
        return false;
      }

      if (data.user) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
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

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      session,
      currentRestaurant,
      userRestaurants,
      login,
      logout,
      register,
      hasPermission,
      createRestaurant,
      setCurrentRestaurant
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

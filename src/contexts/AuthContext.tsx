
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User, 
  UserRole,
  getCurrentUser, 
  loginUser, 
  logoutUser, 
  registerUser,
  initializeDefaultUser
} from "@/services/AuthService";

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  hasPermission: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se existe um usuário logado quando o componente é montado
    const checkLoggedUser = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    // Inicializar usuário padrão se necessário
    initializeDefaultUser();
    
    checkLoggedUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loggedUser = await loginUser({ email, password });
      if (loggedUser) {
        setUser(loggedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const register = async (
    name: string, 
    email: string, 
    password: string,
    role: UserRole = UserRole.EMPLOYEE
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser = registerUser({ name, email, password, role });
      return !!newUser;
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      return false;
    } finally {
      setIsLoading(false);
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
      login,
      logout,
      register,
      hasPermission
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

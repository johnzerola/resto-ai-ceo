
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";

export enum UserRole {
  VISITOR = "visitor",
  STAFF = "staff",
  EMPLOYEE = "employee",  // Added the missing EMPLOYEE role
  MANAGER = "manager",
  OWNER = "owner",
  ADMIN = "admin"
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  setUserRole: (role: UserRole) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.VISITOR);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(session);
        
        if (session?.user) {
          setUser(session.user);
          await loadUserRole(session.user.id);
        } else {
          setUser(null);
          setUserRole(UserRole.VISITOR);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
        setUserRole(UserRole.VISITOR);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setSession(session);
        await loadUserRole(session.user.id);
      } else {
        setUser(null);
        setSession(null);
        setUserRole(UserRole.VISITOR);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserRole = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }

      if (profile && profile.role) {
        setUserRole(profile.role as UserRole);
      } else {
        setUserRole(UserRole.VISITOR);
      }
    } catch (error) {
      console.error("Error loading user role:", error);
      setUserRole(UserRole.VISITOR);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserRole(data.user.id);
        
        // Redirect to the previous page or home
        const from = (location.state as any)?.from?.pathname || "/";
        navigate(from, { replace: true });
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Falha ao fazer login" };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Falha ao criar conta" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const value = {
    session,
    user,
    userRole,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    setUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Add missing user management functions for GerenciarUsuarios.tsx
export const getUsers = () => {
  // Mock implementation for now - would connect to Supabase in a real app
  return [
    {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: UserRole.OWNER,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      id: "2",
      name: "Manager User",
      email: "manager@example.com",
      role: UserRole.MANAGER,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  ];
};

export const getUserByEmail = (email: string) => {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
};

export const registerUser = (userData: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) => {
  // Mock implementation for now
  return {
    id: Math.random().toString(36).substring(7),
    name: userData.name,
    email: userData.email,
    role: userData.role,
    createdAt: new Date().toISOString(),
    lastLogin: null
  };
};

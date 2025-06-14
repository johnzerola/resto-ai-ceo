import { toast } from "sonner";
import { addSystemAlert } from "./ModuleIntegrationService";

export enum UserRole {
  OWNER = "owner",
  MANAGER = "manager", 
  EMPLOYEE = "employee",
  SUPERADMIN = "superadmin"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  dev_notes?: string;
  alert_level?: 'critical' | 'medium' | 'low';
  debug_mode?: boolean;
  last_activity?: string;
}

interface Credentials {
  email: string;
  password: string;
}

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const encryptPassword = (password: string): string => {
  return btoa(password + "salt_value");
};

const verifyPassword = (password: string, encryptedPassword: string): boolean => {
  return encryptPassword(password) === encryptedPassword;
};

export const getUsers = (): User[] => {
  try {
    const usersData = localStorage.getItem("users");
    if (usersData) {
      return JSON.parse(usersData);
    }
    return [];
  } catch (error) {
    console.error("Erro ao obter usuários:", error);
    return [];
  }
};

const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem("users", JSON.stringify(users));
  } catch (error) {
    console.error("Erro ao salvar usuários:", error);
  }
};

export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(user => user.id === userId) || null;
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
};

export const isEmailInUse = (email: string): boolean => {
  return getUserByEmail(email) !== null;
};

export const registerUser = (userData: RegistrationData): User | null => {
  try {
    if (isEmailInUse(userData.email)) {
      toast.error("Este email já está em uso.");
      return null;
    }

    const users = getUsers();
    
    const newUser: User = {
      id: crypto.randomUUID(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      createdAt: new Date().toISOString()
    };

    const passwords = getPasswords();
    passwords[newUser.id] = encryptPassword(userData.password);
    savePasswords(passwords);

    users.push(newUser);
    saveUsers(users);

    addSystemAlert({
      type: "success",
      title: "Novo usuário criado",
      description: `${newUser.name} foi adicionado como ${newUser.role}`,
      date: new Date().toLocaleString()
    });

    toast.success("Usuário criado com sucesso!");
    return newUser;
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    toast.error("Erro ao criar conta. Tente novamente.");
    return null;
  }
};

const getPasswords = (): Record<string, string> => {
  try {
    const passwordsData = localStorage.getItem("userPasswords");
    if (passwordsData) {
      return JSON.parse(passwordsData);
    }
    return {};
  } catch (error) {
    console.error("Erro ao obter senhas:", error);
    return {};
  }
};

const savePasswords = (passwords: Record<string, string>): void => {
  try {
    localStorage.setItem("userPasswords", JSON.stringify(passwords));
  } catch (error) {
    console.error("Erro ao salvar senhas:", error);
  }
};

export const loginUser = async (credentials: Credentials): Promise<User | null> => {
  try {
    const user = getUserByEmail(credentials.email);
    
    if (!user) {
      toast.error("Email não encontrado.");
      return null;
    }

    const passwords = getPasswords();
    const storedPassword = passwords[user.id];

    if (!storedPassword || !verifyPassword(credentials.password, storedPassword)) {
      toast.error("Senha incorreta.");
      return null;
    }

    const users = getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return { ...u, lastLogin: new Date().toISOString() };
      }
      return u;
    });
    
    saveUsers(updatedUsers);
    
    localStorage.setItem("currentUser", JSON.stringify({
      ...user,
      lastLogin: new Date().toISOString()
    }));

    toast.success(`Bem-vindo(a), ${user.name}!`);
    return { ...user, lastLogin: new Date().toISOString() };
  } catch (error) {
    console.error("Erro no login:", error);
    toast.error("Erro ao fazer login. Tente novamente.");
    return null;
  }
};

export const logoutUser = (): void => {
  try {
    localStorage.removeItem("currentUser");
    toast.info("Você saiu do sistema.");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error);
    return null;
  }
};

export const hasPermission = (requiredRole: UserRole): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  if (currentUser.role === UserRole.SUPERADMIN) {
    return true;
  }
  
  if (currentUser.role === UserRole.OWNER) {
    return requiredRole !== UserRole.SUPERADMIN;
  }
  
  if (currentUser.role === UserRole.MANAGER) {
    return requiredRole !== UserRole.OWNER && requiredRole !== UserRole.SUPERADMIN;
  }
  
  return currentUser.role === requiredRole;
};

export const initializeDefaultUser = (): void => {
  const users = getUsers();
  if (users.length === 0) {
    registerUser({
      name: "Proprietário",
      email: "admin@restaurante.com",
      password: "admin123",
      role: UserRole.OWNER
    });
    
    registerUser({
      name: "Administrador Técnico da Plataforma",
      email: "superadmin@restauria.com", 
      password: "SuperAdmin2024!Tech",
      role: UserRole.SUPERADMIN
    });
    
    console.log("Usuários padrão criados:");
    console.log("Admin: admin@restaurante.com / admin123");
    console.log("SuperAdmin: superadmin@restauria.com / SuperAdmin2024!Tech");
  }
};

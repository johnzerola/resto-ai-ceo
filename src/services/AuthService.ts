
import { toast } from "sonner";
import { addSystemAlert } from "./ModuleIntegrationService";

// Tipos de usuários para controle de acesso
export enum UserRole {
  OWNER = "owner",
  MANAGER = "manager",
  EMPLOYEE = "employee"
}

// Interface para representar um usuário
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

// Interface para representação de credenciais
interface Credentials {
  email: string;
  password: string;
}

// Interface para dados de registro
interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Função para criptografar senha (simulação simples)
// Em produção, isso seria feito no backend com bcrypt ou similar
const encryptPassword = (password: string): string => {
  // Simulação simplificada de hash - NÃO USE EM PRODUÇÃO
  return btoa(password + "salt_value");
};

// Verificar se senha corresponde à senha criptografada
const verifyPassword = (password: string, encryptedPassword: string): boolean => {
  return encryptPassword(password) === encryptedPassword;
};

// Obter todos os usuários do sistema
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

// Salvar usuários no localStorage
const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem("users", JSON.stringify(users));
  } catch (error) {
    console.error("Erro ao salvar usuários:", error);
  }
};

// Obter usuário pelo ID
export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(user => user.id === userId) || null;
};

// Obter usuário pelo email
export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
};

// Verificar se um email já está em uso
export const isEmailInUse = (email: string): boolean => {
  return getUserByEmail(email) !== null;
};

// Registrar um novo usuário
export const registerUser = (userData: RegistrationData): User | null => {
  try {
    if (isEmailInUse(userData.email)) {
      toast.error("Este email já está em uso.");
      return null;
    }

    const users = getUsers();
    
    // Criar novo usuário
    const newUser: User = {
      id: crypto.randomUUID(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      createdAt: new Date().toISOString()
    };

    // Salvar senha criptografada separadamente
    const passwords = getPasswords();
    passwords[newUser.id] = encryptPassword(userData.password);
    savePasswords(passwords);

    // Adicionar à lista de usuários e salvar
    users.push(newUser);
    saveUsers(users);

    addSystemAlert({
      type: "success", // Alterado de "info" para "success" para corresponder ao tipo esperado
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

// Obter senhas criptografadas
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

// Salvar senhas criptografadas
const savePasswords = (passwords: Record<string, string>): void => {
  try {
    localStorage.setItem("userPasswords", JSON.stringify(passwords));
  } catch (error) {
    console.error("Erro ao salvar senhas:", error);
  }
};

// Login de usuário
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

    // Atualizar último login
    const users = getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return { ...u, lastLogin: new Date().toISOString() };
      }
      return u;
    });
    
    saveUsers(updatedUsers);
    
    // Salvar dados da sessão
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

// Logout de usuário
export const logoutUser = (): void => {
  try {
    localStorage.removeItem("currentUser");
    toast.info("Você saiu do sistema.");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};

// Obter usuário atual (logado)
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

// Verificar se usuário tem determinada permissão
export const hasPermission = (requiredRole: UserRole): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  // Hierarquia de permissões
  if (currentUser.role === UserRole.OWNER) {
    return true; // Proprietário tem acesso a tudo
  }
  
  if (currentUser.role === UserRole.MANAGER) {
    return requiredRole !== UserRole.OWNER; // Gerente não tem acesso às funções exclusivas do proprietário
  }
  
  // Funcionário só tem acesso às funções de funcionário
  return currentUser.role === requiredRole;
};

// Inicializar usuário padrão (proprietário) se não houver usuários
export const initializeDefaultUser = (): void => {
  const users = getUsers();
  if (users.length === 0) {
    registerUser({
      name: "Proprietário",
      email: "admin@restaurante.com",
      password: "admin123",
      role: UserRole.OWNER
    });
    console.log("Usuário padrão criado: admin@restaurante.com / admin123");
  }
};

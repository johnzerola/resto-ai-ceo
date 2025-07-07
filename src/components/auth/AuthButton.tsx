
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, User } from "lucide-react";

export function AuthButton() {
  const { isAuthenticated, user, logout } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button 
            variant="ghost" 
            className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
            aria-label="Acessar painel do usuário"
          >
            <User className="mr-2 h-4 w-4" />
            Meu Painel
          </Button>
        </Link>
        <Button 
          variant="outline" 
          onClick={logout}
          className="border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-500 transition-all duration-300 font-medium"
          aria-label="Sair da conta"
        >
          Sair
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link to="/login">
        <Button 
          variant="ghost" 
          className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
          aria-label="Fazer login"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Button>
      </Link>
      <Link to="/login?tab=register">
        <Button 
          className="bg-gradient-to-r from-blue-500 via-green-500 to-yellow-400 text-white hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium"
          aria-label="Criar nova conta"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Registrar-se
        </Button>
      </Link>
    </div>
  );
}

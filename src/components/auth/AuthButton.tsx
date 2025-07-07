
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
          <Button variant="ghost" className="text-slate-700 hover:text-emerald-500 transition-colors">
            <User className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <Button 
          variant="outline" 
          onClick={logout}
          className="border-slate-300 hover:border-emerald-400 hover:text-emerald-600 transition-all duration-300"
        >
          Sair
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link to="/login">
        <Button variant="ghost" className="text-slate-700 hover:text-emerald-500 transition-colors">
          <LogIn className="mr-2 h-4 w-4" />
          Entrar
        </Button>
      </Link>
      <Link to="/login?tab=register">
        <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <UserPlus className="mr-2 h-4 w-4" />
          Criar Conta
        </Button>
      </Link>
    </div>
  );
}

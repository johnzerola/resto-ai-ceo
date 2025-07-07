
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PlayCircle, ArrowRight, CheckCircle } from "lucide-react";

export function HeroCTA() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/dashboard">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 w-full sm:w-auto">
              <ArrowRight className="mr-2 h-5 w-5" />
              Ir para Dashboard
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-slate-300 hover:border-emerald-400 hover:text-emerald-600 transition-all duration-300 text-lg px-8 py-6 w-full sm:w-auto">
            <PlayCircle className="mr-2 h-5 w-5" />
            Ver Tutorial
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-emerald-500 mr-1" />
            Conta ativa
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-emerald-500 mr-1" />
            Dados sincronizados
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/login?tab=register">
          <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 w-full sm:w-auto">
            <PlayCircle className="mr-2 h-5 w-5" />
            COMEÇAR TESTE GRÁTIS
          </Button>
        </Link>
        <Button size="lg" variant="outline" className="border-slate-300 hover:border-emerald-400 hover:text-emerald-600 transition-all duration-300 text-lg px-8 py-6 w-full sm:w-auto">
          <PlayCircle className="mr-2 h-5 w-5" />
          Assistir ao vídeo
        </Button>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-emerald-500 mr-1" />
          14 dias grátis
        </div>
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-emerald-500 mr-1" />
          Sem cartão de crédito
        </div>
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-emerald-500 mr-1" />
          Suporte incluído
        </div>
      </div>
    </div>
  );
}

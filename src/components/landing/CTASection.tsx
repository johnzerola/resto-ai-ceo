
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, PlayCircle, Zap } from "lucide-react";

export function CTASection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-24 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-700 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M30%2030c0-16.569%2013.431-30%2030-30v60c-16.569%200-30-13.431-30-30z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center text-white">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
            <Zap className="mr-2 h-4 w-4" />
            {isAuthenticated ? 'Continue sua jornada' : 'Comece agora mesmo'}
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {isAuthenticated 
              ? 'Continue otimizando seu restaurante' 
              : 'Pronto para transformar seu restaurante?'
            }
          </h2>
          
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            {isAuthenticated 
              ? 'Acesse seu dashboard e continue aproveitando todas as funcionalidades do Lucraí CEO para maximizar seus lucros.'
              : 'Junte-se a mais de 1000 restaurantes que já aumentaram seus lucros e otimizaram suas operações com o Lucraí CEO.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 hover:scale-105 transition-all duration-300 text-lg px-10 py-6 shadow-xl">
                    <CheckCircle className="mr-2 h-6 w-6" />
                    Acessar Dashboard
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 transition-all duration-300 text-lg px-10 py-6">
                  <PlayCircle className="mr-2 h-6 w-6" />
                  Ver tutorial
                </Button>
              </>
            ) : (
              <>
                <Link to="/login?tab=register">
                  <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 hover:scale-105 transition-all duration-300 text-lg px-10 py-6 shadow-xl">
                    <CheckCircle className="mr-2 h-6 w-6" />
                    Começar teste gratuito
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 transition-all duration-300 text-lg px-10 py-6">
                  <PlayCircle className="mr-2 h-6 w-6" />
                  Ver demonstração
                </Button>
              </>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-300" />
              <span>{isAuthenticated ? 'Dados sempre atualizados' : '14 dias de teste grátis'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-300" />
              <span>{isAuthenticated ? 'Suporte premium ativo' : 'Sem compromisso de permanência'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-300" />
              <span>Suporte especializado incluído</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


import {
  LayoutDashboard,
  FileText,
  DollarSign,
  TrendingUp,
  Wallet,
  Package,
  Target,
  BarChart3,
  Shield,
  Settings,
  Calculator
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ModernSidebarProps {
  isCollapsed?: boolean;
}

export function ModernSidebar({ isCollapsed = false }: ModernSidebarProps) {
  const { user, logout, currentRestaurant } = useAuth();
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerLogout = async () => {
    await logout();
  };

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      description: "Visão geral do negócio"
    },
    {
      title: "Sistema Financeiro",
      href: "/financeiro", 
      icon: Calculator,
      description: "DRE + KPIs + Alertas Inteligentes",
      badge: "NOVO"
    },
    {
      title: "Ficha Técnica",
      href: "/ficha-tecnica",
      icon: FileText,
      description: "Receitas e ingredientes"
    },
    {
      title: "Precificação",
      href: "/precificacao", 
      icon: DollarSign,
      description: "Calcular preços ideais"
    },
    {
      title: "DRE & CMV",
      href: "/dre-cmv",
      icon: TrendingUp,
      description: "Análise financeira"
    },
    {
      title: "Fluxo de Caixa",
      href: "/fluxo-caixa",
      icon: Wallet,
      description: "Entradas e saídas"
    },
    {
      title: "Estoque",
      href: "/estoque",
      icon: Package,
      description: "Controle de ingredientes"
    },
    {
      title: "Auditoria",
      href: "/auditoria",
      icon: Shield,
      description: "Análise Harvard/Oxford/MIT"
    },
    {
      title: "Configurações",
      href: "/configuracoes",
      icon: Settings,
      description: "Ajustes do sistema"
    }
  ];

  const renderNavigation = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
      <div className="px-3 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                {currentRestaurant?.name || "RestaurIA"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gestão Inteligente
              </p>
            </div>
          )}
          {user && (
            <Avatar className="w-8 h-8 ring-2 ring-blue-500/20">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white font-semibold">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link to={item.href} key={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 px-3 text-left hover:bg-blue-50 dark:hover:bg-slate-800 group transition-all duration-200"
              >
                <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.description}
                        </p>
                      </div>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className="ml-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-0.5"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
      
      <Separator className="border-slate-200 dark:border-slate-700" />
      <div className="p-3">
        <Button
          variant="outline"
          className="w-full justify-center hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all duration-200"
          onClick={triggerLogout}
        >
          {!isCollapsed ? 'Sair da Conta' : '↗'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {isMobileView ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="fixed top-4 left-4 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border shadow-sm">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-left">Menu RestaurIA</SheetTitle>
            </SheetHeader>
            {renderNavigation()}
          </SheetContent>
        </Sheet>
      ) : (
        <div className={`${isCollapsed ? 'w-16' : 'w-72'} transition-all duration-300 ease-in-out`}>
          {renderNavigation()}
        </div>
      )}
    </>
  );
}

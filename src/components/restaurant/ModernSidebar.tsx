
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
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="font-bold text-md">
          {currentRestaurant?.name || "Seu Restaurante"}
        </span>
        {user && (
          <Avatar className="w-8 h-8">
            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link to={item.href} key={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                style={{ paddingLeft: isCollapsed ? '12px' : '24px' }}
              >
                <item.icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.title}</span>}
                {item.badge && !isCollapsed && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-3">
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={triggerLogout}
        >
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {isMobileView ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="px-2">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="pl-0 justify-start">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            {renderNavigation()}
          </SheetContent>
        </Sheet>
      ) : (
        <div className={`flex flex-col ${isCollapsed ? 'w-16' : 'w-60'} border-r border-border`}>
          {renderNavigation()}
        </div>
      )}
    </>
  );
}


import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModernNavItem } from "./ModernNavItem";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { SystemStatusWidget } from "./SystemStatusWidget";
import { 
  LayoutDashboard, 
  Calculator, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  ClipboardList,
  TrendingUp,
  Target,
  MessageSquare,
  Settings,
  FileText,
  Users,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Home,
  BarChart3
} from "lucide-react";

interface ModernSidebarProps {
  className?: string;
}

export function ModernSidebar({ className }: ModernSidebarProps) {
  const { user, subscriptionInfo } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Visão geral do negócio"
    },
    {
      title: "DRE/CMV",
      href: "/dre-cmv",
      icon: Calculator,
      description: "Demonstração de resultados e custos",
      badge: "Unificado"
    },
    {
      title: "Projeções",
      href: "/projecoes",
      icon: TrendingUp,
      description: "Análise de cenários futuros"
    },
    {
      title: "Fluxo de Caixa",
      href: "/fluxo-de-caixa",
      icon: DollarSign,
      description: "Controle financeiro"
    },
    {
      title: "Simulador",
      href: "/simulador",
      icon: BarChart3,
      description: "Simulações de preços"
    }
  ];

  const operationalNavItems = [
    {
      title: "Estoque",
      href: "/estoque",
      icon: Package,
      description: "Controle de inventário"
    },
    {
      title: "Cardápio",
      href: "/cardapio",
      icon: ClipboardList,
      description: "Gestão de receitas"
    },
    {
      title: "Vendas",
      href: "/vendas",
      icon: ShoppingCart,
      description: "Registro de vendas"
    },
    {
      title: "Metas",
      href: "/metas",
      icon: Target,
      description: "Objetivos e conquistas"
    }
  ];

  const aiNavItems = [
    {
      title: "Assistente IA",
      href: "/ai-assistant",
      icon: MessageSquare,
      description: "Consultoria inteligente",
      badge: subscriptionInfo.subscribed ? "Pro" : "Básico"
    }
  ];

  const managementNavItems = [
    {
      title: "Usuários",
      href: "/gerenciar-usuarios",
      icon: Users,
      description: "Gerenciar equipe"
    },
    {
      title: "Assinatura",
      href: "/assinatura",
      icon: CreditCard,
      description: "Planos e cobrança"
    },
    {
      title: "Configurações",
      href: "/configuracoes",
      icon: Settings,
      description: "Configurações gerais"
    },
    {
      title: "Documentação",
      href: "/documentacao",
      icon: FileText,
      description: "Guias e tutoriais"
    }
  ];

  return (
    <div className={cn(
      "flex h-screen bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-resto-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Restauria</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-6">
            {/* Analytics Section */}
            <div>
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Analytics
                </h3>
              )}
              <nav className="space-y-1">
                {mainNavItems.map((item) => (
                  <ModernNavItem 
                    key={item.href} 
                    {...item} 
                    isCollapsed={isCollapsed} 
                  />
                ))}
              </nav>
            </div>

            <Separator />

            {/* Operations Section */}
            <div>
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Operações
                </h3>
              )}
              <nav className="space-y-1">
                {operationalNavItems.map((item) => (
                  <ModernNavItem 
                    key={item.href} 
                    {...item} 
                    isCollapsed={isCollapsed} 
                  />
                ))}
              </nav>
            </div>

            <Separator />

            {/* AI Section */}
            <div>
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Inteligência Artificial
                </h3>
              )}
              <nav className="space-y-1">
                {aiNavItems.map((item) => (
                  <ModernNavItem 
                    key={item.href} 
                    {...item} 
                    isCollapsed={isCollapsed} 
                  />
                ))}
              </nav>
            </div>

            <Separator />

            {/* Management Section */}
            <div>
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Gerenciamento
                </h3>
              )}
              <nav className="space-y-1">
                {managementNavItems.map((item) => (
                  <ModernNavItem 
                    key={item.href} 
                    {...item} 
                    isCollapsed={isCollapsed} 
                  />
                ))}
              </nav>
            </div>
          </div>
        </ScrollArea>

        {/* System Status */}
        {!isCollapsed && (
          <div className="px-3 py-2 border-t border-gray-200">
            <SystemStatusWidget />
          </div>
        )}

        {/* User Menu */}
        <div className="p-3 border-t border-gray-200">
          <UserMenu />
        </div>
      </div>
    </div>
  );
}

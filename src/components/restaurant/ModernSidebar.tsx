
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Package, 
  Utensils,
  Calculator,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  Settings,
  Bot,
  HelpCircle,
  Shield,
  CreditCard
} from "lucide-react";
import { ModernNavItem } from "./ModernNavItem";

const navigation = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Visão geral do negócio",
    category: "overview"
  },
  {
    title: "Projeções",
    href: "/projecoes",
    icon: TrendingUp,
    description: "Planejamento e cenários futuros",
    category: "analytics"
  },
  {
    title: "Fluxo de Caixa",
    href: "/fluxo-de-caixa",
    icon: DollarSign,
    description: "Controle financeiro",
    category: "financial"
  },
  {
    title: "DRE",
    href: "/dre",
    icon: BarChart3,
    description: "Demonstração de resultados",
    category: "financial"
  },
  {
    title: "CMV",
    href: "/cmv",
    icon: Calculator,
    description: "Custo da mercadoria vendida",
    category: "financial"
  },
  {
    title: "Simulador",
    href: "/simulador",
    icon: Calculator,
    description: "Simulador de preços",
    category: "tools"
  },
  {
    title: "Metas",
    href: "/metas",
    icon: Target,
    description: "Sistema de metas e objetivos",
    category: "management"
  },
  {
    title: "Estoque",
    href: "/estoque",
    icon: Package,
    description: "Gestão de inventário",
    category: "operations"
  },
  {
    title: "Cardápio",
    href: "/cardapio",
    icon: Utensils,
    description: "Gestão do cardápio",
    category: "operations"
  },
  {
    title: "Assistente IA",
    href: "/ai-assistant",
    icon: Bot,
    description: "Suporte inteligente",
    category: "ai"
  },
  {
    title: "Usuários",
    href: "/gerenciar-usuarios",
    icon: Users,
    description: "Gestão de equipe",
    category: "management"
  },
  {
    title: "Assinatura",
    href: "/assinatura",
    icon: CreditCard,
    description: "Planos e pagamentos",
    category: "account"
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    description: "Configurações do sistema",
    category: "account"
  },
  {
    title: "Documentação",
    href: "/documentacao",
    icon: HelpCircle,
    description: "Ajuda e tutoriais",
    category: "support"
  },
  {
    title: "Privacidade",
    href: "/privacidade",
    icon: Shield,
    description: "Política de privacidade",
    category: "support"
  }
];

const categories = {
  overview: { label: "Visão Geral", color: "text-blue-600" },
  analytics: { label: "Análises", color: "text-purple-600" },
  financial: { label: "Financeiro", color: "text-green-600" },
  tools: { label: "Ferramentas", color: "text-orange-600" },
  operations: { label: "Operações", color: "text-blue-500" },
  management: { label: "Gestão", color: "text-indigo-600" },
  ai: { label: "Inteligência", color: "text-pink-600" },
  account: { label: "Conta", color: "text-gray-600" },
  support: { label: "Suporte", color: "text-gray-500" }
};

export function ModernSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for close mobile menu event
  useEffect(() => {
    const handleCloseMobileMenu = () => {
      setIsMobileOpen(false);
    };
    
    window.addEventListener('closeMobileMenu' as any, handleCloseMobileMenu);
    return () => window.removeEventListener('closeMobileMenu' as any, handleCloseMobileMenu);
  }, []);

  // Dispatch custom event when sidebar state changes
  useEffect(() => {
    const event = new CustomEvent('sidebarToggle', {
      detail: { isCollapsed, isMobileOpen }
    });
    window.dispatchEvent(event);
  }, [isCollapsed, isMobileOpen]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Group navigation items by category
  const groupedNavigation = navigation.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, typeof navigation>);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white/95 transition-all duration-200"
        onClick={toggleMobile}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-white border-r border-gray-200/60 transition-all duration-300 ease-out shadow-lg",
          isCollapsed ? "w-20" : "w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200/60 bg-gradient-to-r from-[#1B2C4F] to-[#2D4A7A]">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00D887] to-[#1B2C4F] rounded-lg flex items-center justify-center">
                <Utensils className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">
                RestaurIA
              </h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex text-white hover:bg-white/10 transition-colors"
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
          <nav className="space-y-6">
            {Object.entries(groupedNavigation).map(([categoryKey, items]) => {
              const categoryInfo = categories[categoryKey as keyof typeof categories];
              return (
                <div key={categoryKey} className="space-y-2">
                  {!isCollapsed && (
                    <div className="px-3 py-2">
                      <h3 className={cn(
                        "text-xs font-semibold uppercase tracking-wider",
                        categoryInfo.color
                      )}>
                        {categoryInfo.label}
                      </h3>
                    </div>
                  )}
                  <div className="space-y-1">
                    {items.map((item) => (
                      <ModernNavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        title={item.title}
                        description={item.description}
                        isCollapsed={isCollapsed}
                        category={categoryKey}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200/60 bg-gradient-to-r from-gray-50 to-white">
            <div className="text-xs text-gray-500 text-center">
              <p className="font-medium">RestaurIA v2.0</p>
              <p>Inteligência para seu restaurante</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

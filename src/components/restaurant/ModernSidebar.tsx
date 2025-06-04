
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
    title: "Dados",
    href: "/privacidade",
    icon: Shield,
    description: "Privacidade e segurança",
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
      // Auto-collapse on smaller screens
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleCloseMobileMenu = () => {
      setIsMobileOpen(false);
    };
    
    window.addEventListener('closeMobileMenu' as any, handleCloseMobileMenu);
    return () => window.removeEventListener('closeMobileMenu' as any, handleCloseMobileMenu);
  }, []);

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
        className="fixed top-3 left-3 z-50 md:hidden bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white/100 transition-all duration-200 border border-gray-200/50 dark:bg-gray-900/95 dark:border-gray-700/50 dark:hover:bg-gray-900/100"
        onClick={toggleMobile}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-sidebar-background border-r border-sidebar-border transition-all duration-300 ease-out shadow-lg flex flex-col",
          // Mobile: always show full width when open, hide when closed
          "md:translate-x-0", // Always visible on desktop
          isMobileOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full", // Mobile behavior
          !isMobileOpen && isCollapsed && "md:w-16", // Collapsed state only on desktop
          !isMobileOpen && !isCollapsed && "md:w-72" // Expanded state only on desktop
        )}
      >
        {/* Header */}
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 border-b border-sidebar-border bg-gradient-to-r from-[#1B2C4F] to-[#2D4A7A] flex-shrink-0">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-[#00D887] to-[#1B2C4F] rounded-lg flex items-center justify-center flex-shrink-0">
                <Utensils className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-bold text-white truncate">
                RestaurIA
              </h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex text-white hover:bg-white/10 transition-colors h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>

        {/* Scrollable Navigation Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full custom-scrollbar">
            <nav className="px-2 sm:px-3 py-3 sm:py-4 space-y-4 sm:space-y-6">
              {Object.entries(groupedNavigation).map(([categoryKey, items]) => {
                const categoryInfo = categories[categoryKey as keyof typeof categories];
                return (
                  <div key={categoryKey} className="space-y-1 sm:space-y-2">
                    {(!isCollapsed || isMobileOpen) && (
                      <div className="px-2 sm:px-3 py-1 sm:py-2">
                        <h3 className={cn(
                          "text-xs font-semibold uppercase tracking-wider",
                          categoryInfo.color
                        )}>
                          {categoryInfo.label}
                        </h3>
                      </div>
                    )}
                    <div className="space-y-0.5 sm:space-y-1">
                      {items.map((item) => (
                        <ModernNavItem
                          key={item.href}
                          href={item.href}
                          icon={item.icon}
                          title={item.title}
                          description={item.description}
                          isCollapsed={isCollapsed && !isMobileOpen} // Show text on mobile even when collapsed
                          category={categoryKey}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
          </ScrollArea>
        </div>

        {/* Footer */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-3 sm:p-4 border-t border-sidebar-border bg-gradient-to-r from-muted/50 to-card flex-shrink-0">
            <div className="text-xs text-muted-foreground text-center">
              <p className="font-medium">RestaurIA v2.0</p>
              <p className="hidden sm:block">Inteligência para seu restaurante</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

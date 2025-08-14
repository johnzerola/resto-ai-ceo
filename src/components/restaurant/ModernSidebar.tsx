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
  Shield,
  CreditCard,
  ClipboardList,
  Code2,
  Palette,
  Users2
} from "lucide-react";
import { ModernNavItem } from "./ModernNavItem";
import { ConditionalNavItem } from "./ConditionalNavItem";

const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Visão geral do negócio",
    category: "overview"
  },
  {
    title: "Fluxo de Caixa",
    href: "/fluxo-caixa",
    icon: DollarSign,
    description: "Controle financeiro completo",
    category: "financial"
  },
  {
    title: "DRE",
    href: "/dre",
    icon: BarChart3,
    description: "Demonstração de Resultados",
    category: "financial"
  },
  {
    title: "CMV",
    href: "/cmv",
    icon: Calculator,
    description: "Custo da Mercadoria Vendida",
    category: "financial"
  },
  {
    title: "Assinaturas",
    href: "/assinatura",
    icon: CreditCard,
    description: "Planos e pagamentos",
    category: "account"
  },
  {
    title: "Estoque",
    href: "/estoque",
    icon: Package,
    description: "Gestão de inventário",
    category: "operations"
  },
  {
    title: "Projeção",
    href: "/projecoes",
    icon: TrendingUp,
    description: "Planejamento e cenários futuros",
    category: "analytics"
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
    title: "Cardápio",
    href: "/cardapio",
    icon: Utensils,
    description: "Gestão do cardápio e preços",
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
    title: "Gestão de Tarefas",
    href: "/configuracoes",
    icon: ClipboardList,
    description: "Configurações do sistema",
    category: "account"
  },
  {
    title: "Dados do Negócio",
    href: "/dados-negocio",
    icon: Settings,
    description: "Configurações empresariais",
    category: "account"
  },
  {
    title: "Privacidade",
    href: "/privacidade",
    icon: Shield,
    description: "Privacidade e segurança",
    category: "support"
  },
  {
    title: "Developer",
    href: "/developer",
    icon: Code2,
    description: "Dashboard do desenvolvedor",
    category: "developer"
  },
  {
    title: "Branding",
    href: "/branding",
    icon: Palette,
    description: "Guia de marca",
    category: "developer"
  },
  {
    title: "Programa Afiliados",
    href: "/affiliate",
    icon: Users2,
    description: "Sistema de afiliados",
    category: "business"
  }
];

const categories = {
  overview: { label: "Visão Geral", color: "text-lucrai-blue-primary" },
  analytics: { label: "Análises", color: "text-lucrai-green-primary" },
  financial: { label: "Financeiro", color: "text-lucrai-green-primary" },
  tools: { label: "Ferramentas", color: "text-lucrai-yellow-primary" },
  operations: { label: "Operações", color: "text-lucrai-blue-secondary" },
  management: { label: "Gestão", color: "text-lucrai-blue-primary" },
  ai: { label: "Inteligência", color: "text-lucrai-green-primary" },
  account: { label: "Conta", color: "text-lucrai-gray-600" },
  support: { label: "Suporte", color: "text-lucrai-gray-500" },
  developer: { label: "Desenvolvedor", color: "text-lucrai-orange-alert" },
  business: { label: "Negócios", color: "text-lucrai-green-secondary" }
};

export function ModernSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };
    
    handleResize();
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
      {/* Mobile Menu Button - Otimizado para Touch */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/95 backdrop-blur-sm shadow-xl hover:bg-white/100 transition-all duration-200 border border-border/50 h-12 w-12 rounded-xl touch-manipulation"
        onClick={toggleMobile}
        aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay - Aprimorado */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden touch-manipulation"
          onClick={() => setIsMobileOpen(false)}
          onTouchStart={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full border-r border-border transition-all duration-300 ease-out shadow-xl flex flex-col",
          "bg-background border-sidebar-border",
          // Mobile behavior - Fullscreen na lateral
          "md:translate-x-0",
          isMobileOpen ? "w-screen max-w-xs translate-x-0" : "w-screen max-w-xs -translate-x-full",
          // Desktop behavior - Comportamento normal
          "md:relative md:w-auto md:translate-x-0",
          isCollapsed && "md:w-16",
          !isCollapsed && "md:w-72"
        )}
      >
        {/* Header com Branding - Mobile Otimizado */}
        <div className="flex h-14 md:h-16 items-center justify-between px-4 border-b border-sidebar-border flex-shrink-0 bg-lucrai-gradient-primary">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-sm font-bold text-lucrai-blue-primary">L</span>
                </div>
              </div>
              <h2 className="text-lg font-bold text-white truncate font-dm-sans tracking-wider">
                Lucraí
              </h2>
            </div>
          )}
          {isCollapsed && !isMobileOpen && (
            <div className="flex items-center justify-center w-full">
              <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-sm font-bold text-lucrai-blue-primary">L</span>
                </div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex text-white hover:bg-white/10 transition-all duration-200 h-10 w-10 flex-shrink-0 rounded-lg"
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Scrollable Navigation Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full custom-scrollbar">
            <nav className="px-3 py-4 space-y-6">
              {Object.entries(groupedNavigation).map(([categoryKey, items]) => {
                const categoryInfo = categories[categoryKey as keyof typeof categories];
                return (
                  <div key={categoryKey} className="space-y-2">
                    {(!isCollapsed || isMobileOpen) && (
                      <div className="px-3 py-2">
                        <h3 className={cn(
                          "text-xs font-semibold uppercase tracking-wider sidebar-category-label",
                          categoryInfo.color,
                          "dark:text-gray-300"
                        )}>
                          {categoryInfo.label}
                        </h3>
                      </div>
                    )}
                    <div className="space-y-1">
                      {items.map((item) => {
                        // Use ConditionalNavItem for developer features
                        if (item.category === 'developer') {
                          return (
                            <ConditionalNavItem
                              key={item.href}
                              href={item.href}
                              icon={item.icon}
                              title={item.title}
                              description={item.description}
                              isCollapsed={isCollapsed && !isMobileOpen}
                              category={categoryKey}
                              requiredRole="developer"
                            />
                          );
                        }
                        
                        // Use ConditionalNavItem for affiliate features
                        if (item.href === '/affiliate') {
                          return (
                            <ConditionalNavItem
                              key={item.href}
                              href={item.href}
                              icon={item.icon}
                              title={item.title}
                              description={item.description}
                              isCollapsed={isCollapsed && !isMobileOpen}
                              category={categoryKey}
                              requiredRole="affiliate"
                            />
                          );
                        }
                        
                        return (
                          <ModernNavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                            isCollapsed={isCollapsed && !isMobileOpen}
                            category={categoryKey}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </ScrollArea>
        </div>

        {/* Footer com Branding */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-4 border-t border-sidebar-border bg-lucrai-gradient-subtle flex-shrink-0">
            <div className="text-xs text-lucrai-gray-600 text-center space-y-1">
              <p className="font-semibold text-lucrai-blue-primary">Lucraí v2.0</p>
              <p className="font-medium">Inteligência para seu restaurante</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-2 h-2 bg-lucrai-green-primary rounded-full animate-pulse"></div>
                <span className="text-lucrai-green-primary font-medium">Sistema Online</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

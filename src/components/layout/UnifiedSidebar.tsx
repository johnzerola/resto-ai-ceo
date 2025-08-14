import React, { useState, useEffect, useCallback, memo } from "react";
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
  Users2,
  MessageCircle
} from "lucide-react";
import { ModernNavItem } from "@/components/restaurant/ModernNavItem";
import { ConditionalNavItem } from "@/components/restaurant/ConditionalNavItem";

type SidebarState = 'expanded' | 'collapsed' | 'hidden';

interface SidebarConfig {
  state: SidebarState;
  isMobileMenuOpen: boolean;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ElementType;
  description: string;
  category: string;
}

const navigation: NavigationItem[] = [
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
    title: "WhatsApp Bot",
    href: "/whatsapp",
    icon: MessageCircle,
    description: "Controle via WhatsApp",
    category: "tools"
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
  overview: { label: "Visão Geral", color: "text-blue-600" },
  analytics: { label: "Análises", color: "text-green-600" },
  financial: { label: "Financeiro", color: "text-green-600" },
  tools: { label: "Ferramentas", color: "text-orange-600" },
  operations: { label: "Operações", color: "text-blue-600" },
  management: { label: "Gestão", color: "text-blue-600" },
  ai: { label: "Inteligência", color: "text-purple-600" },
  account: { label: "Conta", color: "text-gray-600" },
  support: { label: "Suporte", color: "text-gray-500" },
  developer: { label: "Desenvolvedor", color: "text-orange-500" },
  business: { label: "Negócios", color: "text-green-600" }
};

export const UnifiedSidebar = memo(function UnifiedSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen(!isMobileOpen);
  }, [isMobileOpen]);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  const groupedNavigation = React.useMemo(() => {
    return navigation.reduce((groups, item) => {
      const category = item.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {} as Record<string, NavigationItem[]>);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-lg hover:bg-gray-50 border border-gray-200 h-12 w-12 rounded-xl"
        onClick={toggleMobile}
        aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Mobile First Design */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-white border-r border-gray-200 shadow-xl flex flex-col transition-all duration-300 ease-out",
          // Mobile: Full overlay sidebar
          isMobileOpen ? "w-80 translate-x-0" : "w-80 -translate-x-full",
          // Desktop: Fixed sidebar
          "md:translate-x-0 md:relative md:shadow-none md:z-auto",
          isCollapsed && "md:w-16",
          !isCollapsed && "md:w-72"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-white/10 rounded-lg">
                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">L</span>
                </div>
              </div>
              <h2 className="text-lg font-bold text-white truncate tracking-wider">
                Lucraí
              </h2>
            </div>
          )}
          
          {isCollapsed && !isMobileOpen && (
            <div className="flex items-center justify-center w-full">
              <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg">
                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">L</span>
                </div>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex text-white hover:bg-white/10 h-10 w-10 rounded-lg"
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <nav className="px-3 py-4 space-y-6">
              {Object.entries(groupedNavigation).map(([categoryKey, items]) => {
                const categoryInfo = categories[categoryKey as keyof typeof categories];
                return (
                  <div key={categoryKey} className="space-y-2">
                    {(!isCollapsed || isMobileOpen) && (
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
                      {items.map((item) => {
                        const itemIsCollapsed = isCollapsed && !isMobileOpen;
                        
                        if (item.category === 'developer') {
                          return (
                            <ConditionalNavItem
                              key={item.href}
                              href={item.href}
                              icon={item.icon as any}
                              title={item.title}
                              description={item.description}
                              isCollapsed={itemIsCollapsed}
                              category={categoryKey}
                              requiredRole="developer"
                            />
                          );
                        }
                        
                        if (item.href === '/affiliate') {
                          return (
                            <ConditionalNavItem
                              key={item.href}
                              href={item.href}
                              icon={item.icon as any}
                              title={item.title}
                              description={item.description}
                              isCollapsed={itemIsCollapsed}
                              category={categoryKey}
                              requiredRole="affiliate"
                            />
                          );
                        }
                        
                        return (
                          <ModernNavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon as any}
                            title={item.title}
                            description={item.description}
                            isCollapsed={itemIsCollapsed}
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

        {/* Footer */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="text-xs text-gray-600 text-center space-y-1">
              <p className="font-semibold text-blue-600">Lucraí v2.0</p>
              <p className="font-medium">Inteligência para seu restaurante</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Sistema Online</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
});

export { type SidebarState, type SidebarConfig };
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
  MessageCircle,
  Workflow
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
  overview: { label: "Visão Geral", color: "text-primary" },
  analytics: { label: "Análises", color: "text-accent" },
  financial: { label: "Financeiro", color: "text-accent" },
  tools: { label: "Ferramentas", color: "text-warning" },
  operations: { label: "Operações", color: "text-primary" },
  management: { label: "Gestão", color: "text-primary" },
  ai: { label: "Inteligência", color: "text-accent" },
  account: { label: "Conta", color: "text-muted-foreground" },
  support: { label: "Suporte", color: "text-muted-foreground" },
  developer: { label: "Desenvolvedor", color: "text-orange-500" },
  business: { label: "Negócios", color: "text-accent" }
};

const getInitialSidebarState = (): SidebarConfig => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
  
  if (width < 768) {
    return { state: 'hidden', isMobileMenuOpen: false };
  } else if (width < 1024) {
    return { state: 'collapsed', isMobileMenuOpen: false };
  } else {
    return { state: 'expanded', isMobileMenuOpen: false };
  }
};

const SidebarHeader = memo(({ 
  config, 
  onToggle, 
  onMobileToggle 
}: {
  config: SidebarConfig;
  onToggle: () => void;
  onMobileToggle: () => void;
}) => (
  <>
    {/* Mobile Menu Button */}
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-3 left-3 z-50 md:hidden bg-background/95 backdrop-blur-sm shadow-lg hover:bg-background/100 transition-all duration-200 border border-border/50"
      onClick={onMobileToggle}
    >
      {config.isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
    </Button>

    {/* Sidebar Header */}
    <div className="flex h-14 items-center justify-between px-3 border-b border-sidebar-border flex-shrink-0 bg-gradient-to-r from-primary to-accent">
      {(config.state === 'expanded' || config.isMobileMenuOpen) && (
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
              <span className="text-xs font-bold text-primary">L</span>
            </div>
          </div>
          <h2 className="text-lg font-bold text-white truncate tracking-wider">
            Lucraí
          </h2>
        </div>
      )}
      
      {config.state === 'collapsed' && !config.isMobileMenuOpen && (
        <div className="flex items-center justify-center w-full">
          <div className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
              <span className="text-xs font-bold text-primary">L</span>
            </div>
          </div>
        </div>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="hidden md:flex text-white hover:bg-white/10 transition-all duration-200 h-7 w-7 flex-shrink-0 rounded-lg"
      >
        {config.state === 'collapsed' ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  </>
));

const SidebarFooter = memo(({ config }: { config: SidebarConfig }) => (
  <>
    {(config.state === 'expanded' || config.isMobileMenuOpen) && (
      <div className="p-3 border-t border-sidebar-border bg-gradient-to-r from-background to-muted/20 flex-shrink-0">
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p className="font-semibold text-primary">Lucraí v2.0</p>
          <p className="font-medium">Inteligência para seu restaurante</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span className="text-accent font-medium">Sistema Online</span>
          </div>
        </div>
      </div>
    )}
  </>
));

export const UnifiedSidebar = memo(function UnifiedSidebar() {
  const [config, setConfig] = useState<SidebarConfig>(getInitialSidebarState);

  const handleResize = useCallback(() => {
    const newConfig = getInitialSidebarState();
    if (newConfig.state !== config.state) {
      setConfig(prev => ({ ...prev, state: newConfig.state, isMobileMenuOpen: false }));
    }
  }, [config.state]);

  const toggleSidebar = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      state: prev.state === 'expanded' ? 'collapsed' : 'expanded'
    }));
  }, []);

  const toggleMobile = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      isMobileMenuOpen: !prev.isMobileMenuOpen
    }));
  }, []);

  const closeMobileMenu = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      isMobileMenuOpen: false
    }));
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    window.addEventListener('closeMobileMenu' as any, closeMobileMenu);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('closeMobileMenu' as any, closeMobileMenu);
    };
  }, [handleResize, closeMobileMenu]);

  useEffect(() => {
    const event = new CustomEvent('sidebarStateChange', {
      detail: { config }
    });
    window.dispatchEvent(event);
  }, [config]);

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

  const sidebarWidth = config.state === 'expanded' || config.isMobileMenuOpen ? 'w-72' : config.state === 'collapsed' ? 'w-16' : 'w-0';
  const sidebarTransform = config.state === 'hidden' && !config.isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0';

  return (
    <>
      <SidebarHeader 
        config={config}
        onToggle={toggleSidebar}
        onMobileToggle={toggleMobile}
      />

      {/* Mobile Overlay */}
      {config.isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full border-r border-sidebar-border transition-all duration-300 ease-out shadow-lg flex flex-col",
          "bg-sidebar-background",
          sidebarWidth,
          sidebarTransform,
          "md:translate-x-0"
        )}
      >
        <SidebarHeader 
          config={config}
          onToggle={toggleSidebar}
          onMobileToggle={toggleMobile}
        />

        {/* Navigation Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <nav className="px-2 py-3 space-y-4">
              {Object.entries(groupedNavigation).map(([categoryKey, items]) => {
                const categoryInfo = categories[categoryKey as keyof typeof categories];
                return (
                  <div key={categoryKey} className="space-y-1">
                    {(config.state === 'expanded' || config.isMobileMenuOpen) && (
                      <div className="px-3 py-2">
                        <h3 className={cn(
                          "text-xs font-semibold uppercase tracking-wider",
                          categoryInfo.color
                        )}>
                          {categoryInfo.label}
                        </h3>
                      </div>
                    )}
                    <div className="space-y-0.5">
                      {items.map((item) => {
                        const isCollapsed = config.state === 'collapsed' && !config.isMobileMenuOpen;
                        
                        if (item.category === 'developer') {
                          return (
                            <ConditionalNavItem
                              key={item.href}
                              href={item.href}
                              icon={item.icon as any}
                              title={item.title}
                              description={item.description}
                              isCollapsed={isCollapsed}
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
                              isCollapsed={isCollapsed}
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
                            isCollapsed={isCollapsed}
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

        <SidebarFooter config={config} />
      </div>
    </>
  );
});

export { type SidebarState, type SidebarConfig };
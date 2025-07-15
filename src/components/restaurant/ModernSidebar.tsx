import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  DollarSign, 
  TrendingUp, 
  Target,
  Package,
  Receipt,
  ChefHat,
  Users,
  Settings,
  HelpCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart,
  Calculator,
  ClipboardList,
  Bell,
  Calendar,
  FileText,
  Wallet,
  Building2,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModernNavItem } from './ModernNavItem';
import { ConditionalNavItem } from './ConditionalNavItem';

const navigation = [
  // Geral
  {
    title: "Dashboard",
    href: "/dashboard", 
    icon: LayoutDashboard,
    description: "Visão geral do negócio",
    category: "overview"
  },
  
  // Financeiro
  {
    title: "Fluxo de Caixa",
    href: "/fluxo-de-caixa",
    icon: DollarSign,
    description: "Controle financeiro completo",
    category: "financial"
  },
  {
    title: "DRE & CMV",
    href: "/dre-cmv",
    icon: BarChart3,
    description: "Demonstrativo de Resultados",
    category: "financial"
  },
  {
    title: "DRE",
    href: "/dre",
    icon: PieChart,
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
    title: "Contas a Pagar",
    href: "/contas-pagar",
    icon: Receipt,
    description: "Controle de pagamentos",
    category: "financial"
  },
  {
    title: "Contas a Receber",
    href: "/contas-receber",
    icon: Wallet,
    description: "Controle de recebimentos",
    category: "financial"
  },

  // Operações
  {
    title: "Metas",
    href: "/metas",
    icon: Target,
    description: "Objetivos e acompanhamento",
    category: "operations"
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
    icon: ChefHat,
    description: "Configurações do sistema",
    category: "operations"
  },

  // Gestão
  {
    title: "Assinaturas",
    href: "/assinaturas",
    icon: CreditCard,
    description: "Planos e pagamentos",
    category: "management"
  },

  // Configurações
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    description: "Configurações do sistema",
    category: "account"
  },

  // Suporte
  {
    title: "Suporte",
    href: "/suporte",
    icon: HelpCircle,
    description: "Central de ajuda",
    category: "support"
  }
];

const categories = {
  overview: { label: "Visão Geral", color: "text-blue-600" },
  financial: { label: "Financeiro", color: "text-green-600" },
  operations: { label: "Operações", color: "text-orange-600" },
  management: { label: "Gestão", color: "text-purple-600" },
  account: { label: "Conta", color: "text-gray-600" },
  support: { label: "Suporte", color: "text-gray-500" }
};

export function ModernSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;
      
      if (isMobile) {
        setIsMobileOpen(false);
        setIsCollapsed(true);
      } else if (isTablet) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Notificar mudanças do sidebar para o layout principal
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
        className="fixed top-4 left-4 z-50 md:hidden bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white border border-gray-200"
        onClick={toggleMobile}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex fixed top-4 left-4 z-50 bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white border border-gray-200"
        onClick={toggleSidebar}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out shadow-xl flex flex-col",
          // Mobile
          "md:translate-x-0",
          isMobileOpen ? "w-72 translate-x-0" : "-translate-x-full",
          // Desktop
          "md:translate-x-0",
          isCollapsed ? "md:w-16" : "md:w-72"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50",
          isCollapsed && !isMobileOpen && "md:justify-center"
        )}>
          {(!isCollapsed || isMobileOpen) && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">Lucraí</h1>
                  <p className="text-xs text-gray-500">Premium</p>
                </div>
              </div>
            </>
          )}
          
          {(isCollapsed && !isMobileOpen) && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <nav className="p-2">
              {Object.entries(groupedNavigation).map(([categoryKey, items]) => {
                const categoryInfo = categories[categoryKey as keyof typeof categories];
                
                return (
                  <div key={categoryKey} className="mb-6">
                    {(!isCollapsed || isMobileOpen) && (
                      <div className="px-3 mb-2">
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
                          isCollapsed={isCollapsed && !isMobileOpen}
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
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <p className="text-xs font-semibold text-blue-600">Lucraí v2.0</p>
              <p className="text-xs text-gray-500 mt-1">Inteligência para seu restaurante</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Sistema Online</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

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
  Receipt
} from "lucide-react";
import { ModernNavItem } from "./ModernNavItem";

const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Visão geral do negócio"
  },
  {
    title: "Projeções",
    href: "/projecoes",
    icon: TrendingUp,
    description: "Planejamento e cenários futuros"
  },
  {
    title: "Fluxo de Caixa",
    href: "/fluxo-de-caixa",
    icon: DollarSign,
    description: "Controle financeiro"
  },
  {
    title: "DRE & CMV",
    href: "/dre",
    icon: BarChart3,
    description: "Demonstração de resultados"
  },
  {
    title: "Simulador",
    href: "/simulador",
    icon: Calculator,
    description: "Simulador de preços"
  },
  {
    title: "Metas",
    href: "/metas",
    icon: Target,
    description: "Sistema de metas e objetivos"
  },
  {
    title: "Estoque",
    href: "/estoque",
    icon: Package,
    description: "Gestão de inventário"
  },
  {
    title: "Cardápio & Precificação",
    href: "/cardapio",
    icon: Utensils,
    description: "Gestão do cardápio e preços"
  },
  {
    title: "Assistente IA",
    href: "/ai-assistant",
    icon: Bot,
    description: "Suporte inteligente"
  },
  {
    title: "Assinatura",
    href: "/assinatura",
    icon: CreditCard,
    description: "Planos e pagamentos"
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    description: "Configurações do sistema"
  },
  {
    title: "Auditoria",
    href: "/auditoria",
    icon: Shield,
    description: "Auditoria do sistema"
  },
  {
    title: "Privacidade",
    href: "/privacidade",
    icon: Shield,
    description: "Políticas e privacidade"
  },
  {
    title: "Contas",
    href: "/contas",
    icon: Receipt,
    description: "Contas a pagar e receber"
  }
];

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
      } else {
        setIsCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden bg-white shadow-lg"
        onClick={toggleMobile}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Corrigido o posicionamento e tamanho */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full border-r bg-white transition-all duration-300 flex flex-col shadow-sm",
          isMobileOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:translate-x-0",
          !isMobileOpen && isCollapsed && "md:w-16",
          !isMobileOpen && !isCollapsed && "md:w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b bg-gradient-to-r from-[#1B2C4F] to-[#2D4A7A]">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00D887] to-[#1B2C4F] rounded-lg flex items-center justify-center">
                <Utensils className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">RestaurIA</h2>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-white hover:bg-white/10 h-8 w-8 hidden md:flex"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <nav className="px-3 py-4 space-y-1">
              {navigation.map((item) => (
                <ModernNavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  isCollapsed={isCollapsed && !isMobileOpen}
                />
              ))}
            </nav>
          </ScrollArea>
        </div>

        {/* Footer */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-4 border-t bg-muted/30">
            <div className="text-xs text-muted-foreground text-center">
              <p className="font-medium">RestaurIA v2.0</p>
              <p>Inteligência para seu restaurante</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

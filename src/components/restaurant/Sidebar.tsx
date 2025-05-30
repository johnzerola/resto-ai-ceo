
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
  FileText, 
  Calculator,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Utensils
} from "lucide-react";
import { NavItem } from "./NavItem";

const navigation = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Visão geral do negócio"
  },
  {
    title: "Fluxo de Caixa",
    href: "/fluxo-de-caixa",
    icon: DollarSign,
    description: "Controle financeiro"
  },
  {
    title: "DRE",
    href: "/dre",
    icon: TrendingUp,
    description: "Demonstração de resultados"
  },
  {
    title: "CMV",
    href: "/cmv",
    icon: Calculator,
    description: "Custo da mercadoria vendida"
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
    title: "Cardápio",
    href: "/cardapio",
    icon: Utensils,
    description: "Gestão do cardápio"
  },
  {
    title: "Simulador",
    href: "/simulador",
    icon: Calculator,
    description: "Simulador de preços"
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle mobile responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
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

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-background border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">RestoAI CEO</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex"
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
          <nav className="space-y-2">
            {navigation.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                title={item.title}
                description={item.description}
                isCollapsed={isCollapsed}
                onClick={() => setIsMobileOpen(false)}
              />
            ))}
          </nav>
        </ScrollArea>
      </div>
    </>
  );
}

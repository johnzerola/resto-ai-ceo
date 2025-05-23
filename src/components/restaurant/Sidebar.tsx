import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home,
  FileText, 
  Database, 
  PackageOpen, 
  BarChartBig, 
  Calendar, 
  MessageSquare, 
  BarChart4,
  Settings,
  Menu,
  X,
  DollarSign,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services/AuthService";
import { Badge } from "@/components/ui/badge";
import { getAllAchievements } from "@/services/GoalsService";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState(0);
  const { hasPermission } = useAuth();

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    
    // Disparar evento para notificar o Layout de que o sidebar foi alternado
    if (typeof window !== "undefined") {
      const event = new CustomEvent('sidebarToggle', { 
        detail: { isCollapsed: newState } 
      });
      window.dispatchEvent(event);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Inicializar o menu como aberto e depois fechar após 1 segundo
  useEffect(() => {
    setIsCollapsed(false);
    
    // Disparar evento para notificar o Layout que o sidebar está aberto inicialmente
    if (typeof window !== "undefined") {
      const event = new CustomEvent('sidebarToggle', { 
        detail: { isCollapsed: false } 
      });
      window.dispatchEvent(event);
    }
    
    const timer = setTimeout(() => {
      setIsCollapsed(true);
      
      // Disparar evento para notificar o Layout que o sidebar foi fechado automaticamente
      if (typeof window !== "undefined") {
        const event = new CustomEvent('sidebarToggle', { 
          detail: { isCollapsed: true } 
        });
        window.dispatchEvent(event);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Carregar conquistas desbloqueadas
  useEffect(() => {
    const loadAchievements = () => {
      const achievements = getAllAchievements();
      const unlocked = achievements.filter(a => a.isUnlocked).length;
      setUnlockedAchievements(unlocked);
    };
    
    loadAchievements();
    
    // Listener para atualização de conquistas
    const handleAchievementsUpdate = () => {
      loadAchievements();
    };
    
    window.addEventListener("achievementsUpdated", handleAchievementsUpdate);
    
    return () => {
      window.removeEventListener("achievementsUpdated", handleAchievementsUpdate);
    };
  }, []);

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/" },
    { name: "Ficha Técnica", icon: FileText, path: "/ficha-tecnica" },
    { name: "DRE & CMV", icon: DollarSign, path: "/dre-cmv" },
    { 
      name: "Estoque", 
      icon: PackageOpen, 
      path: "/estoque",
      badge: unlockedAchievements > 0 ? (
        <Badge variant="outline" className="ml-auto bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1 h-5">
          {unlockedAchievements}
        </Badge>
      ) : undefined
    },
    { name: "Fluxo de Caixa", icon: Database, path: "/fluxo-caixa" },
    { name: "Promoções", icon: Calendar, path: "/promocoes" },
    { name: "Simulador", icon: BarChartBig, path: "/simulador" },
    { name: "Gerente IA", icon: MessageSquare, path: "/gerente-ia" },
    { name: "Marketing", icon: BarChart4, path: "/marketing" },
    { name: "Configurações", icon: Settings, path: "/configuracoes" },
  ];

  // Item para documentação técnica (apenas para gerentes)
  const docItem = { name: "Documentação", icon: Code, path: "/documentacao" };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-resto-blue-700 font-bold">
              {!isCollapsed && "Resto AI CEO"}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    isActive
                      ? "bg-resto-blue-50 text-resto-blue-700"
                      : "text-resto-gray-600 hover:bg-resto-gray-50",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all"
                  )
                }
              >
                <item.icon
                  className={cn(
                    "flex-shrink-0 h-5 w-5",
                    isCollapsed ? "mr-0 mx-auto" : "mr-3"
                  )}
                />
                {!isCollapsed && (
                  <div className="flex items-center w-full">
                    <span>{item.name}</span>
                    {item.badge}
                  </div>
                )}
                {isCollapsed && item.badge && (
                  <div className="absolute -right-1 -top-1">
                    {item.badge}
                  </div>
                )}
              </NavLink>
            ))}
            
            {/* Item de documentação técnica para gerentes */}
            {hasPermission(UserRole.MANAGER) && (
              <NavLink
                to={docItem.path}
                className={({ isActive }) =>
                  cn(
                    isActive
                      ? "bg-resto-blue-50 text-resto-blue-700"
                      : "text-resto-gray-600 hover:bg-resto-gray-50",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all"
                  )
                }
              >
                <docItem.icon
                  className={cn(
                    "flex-shrink-0 h-5 w-5",
                    isCollapsed ? "mr-0 mx-auto" : "mr-3"
                  )}
                />
                {!isCollapsed && <span>{docItem.name}</span>}
              </NavLink>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-resto-blue-200 flex items-center justify-center text-resto-blue-700 font-semibold">
              R
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Resto AI</p>
                <p className="text-xs text-gray-500">Seu Gerente IA</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

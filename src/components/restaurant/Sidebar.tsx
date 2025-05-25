import {
  LayoutDashboard,
  Settings,
  Calendar,
  BarChart,
  ListChecks,
  Receipt,
  MessageSquare,
  Users,
  Shield,
  Pizza,
  ChefHat,
  FileText,
  Goal,
  TrendingUp,
  Boxes,
  Calculator,
  HelpCircle,
  BookOpenCheck,
  LucideIcon
} from "lucide-react";
import { NavItem } from "./NavItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/hooks/useSidebar";
import { useEffect } from "react";
import { dispatchSidebarToggle } from "@/utils/auth-utils";

interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    description: "Visão geral do seu negócio"
  },
  {
    title: "Fluxo de Caixa",
    icon: Receipt,
    href: "/fluxo-de-caixa",
    description: "Registre entradas e saídas de dinheiro"
  },
  {
    title: "DRE",
    icon: BarChart,
    href: "/dre",
    description: "Demonstrativo de Resultados"
  },
  {
    title: "CMV",
    icon: TrendingUp,
    href: "/cmv",
    description: "Custo da Mercadoria Vendida"
  },
  {
    title: "Metas",
    icon: Goal,
    href: "/metas",
    description: "Defina e acompanhe suas metas"
  },
  {
    title: "Cardápio",
    icon: Pizza,
    href: "/cardapio",
    description: "Gerencie seus produtos"
  },
  {
    title: "Fichas Técnicas",
    icon: ChefHat,
    href: "/fichas-tecnicas",
    description: "Controle os ingredientes dos seus pratos"
  },
  {
    title: "Estoque",
    icon: Boxes,
    href: "/estoque",
    description: "Controle de estoque e ingredientes"
  },
  {
    title: "Relatórios",
    icon: FileText,
    href: "/relatorios",
    description: "Visualize seus relatórios"
  },
  {
    title: "Agenda",
    icon: Calendar,
    href: "/agenda",
    description: "Gerencie seus eventos e reservas"
  },
  {
    title: "Checklists",
    icon: ListChecks,
    href: "/checklists",
    description: "Crie e gerencie suas checklists"
  },
  {
    title: "Calculadora",
    icon: Calculator,
    href: "/calculadora",
    description: "Ferramentas úteis para o dia a dia"
  },
  {
    title: "Assistente IA",
    icon: MessageSquare,
    href: "/ai-assistant",
    description: "Assistente de IA para te ajudar"
  },
  {
    title: "Gerenciar Usuários",
    icon: Users,
    href: "/gerenciar-usuarios",
    description: "Gerencie os usuários do sistema"
  },
  {
    title: "Privacidade & Segurança",
    icon: Shield,
    href: "/privacidade",
    description: "Gerencie dados pessoais e monitore segurança"
  },
  {
    title: "Documentação",
    icon: BookOpenCheck,
    href: "/documentacao",
    description: "Aprenda a usar o sistema"
  },
  {
    title: "Suporte",
    icon: HelpCircle,
    href: "/suporte",
    description: "Tire suas dúvidas"
  },
  {
    title: "Configurações",
    icon: Settings,
    href: "/configuracoes",
    description: "Personalize o sistema"
  }
];

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();

  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);

    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, [setIsCollapsed]);

  return (
    <aside className={`
      ${isCollapsed ? 'w-16' : 'w-60'}
      flex flex-col h-screen bg-gray-50 border-r border-gray-200 transition-all duration-200`
    }>
      <div className="flex items-center justify-center h-16 shrink-0 bg-resto-blue-500 text-white">
        <button onClick={() => dispatchSidebarToggle(!isCollapsed)}>
          <h1 className={`
            text-lg font-bold tracking-tight
            ${isCollapsed ? 'hidden' : ''}
          `}>Resto<span className="text-green-400">AI</span> CEO</h1>
          <h1 className={`
            text-lg font-bold tracking-tight
            ${!isCollapsed ? 'hidden' : ''}
          `}>R<span className="text-green-400">AI</span></h1>
        </button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <nav className="grid gap-4">
          {menuItems.map((item) => (
            <NavItem
              key={item.href}
              title={item.title}
              icon={item.icon}
              href={item.href}
              description={item.description}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}


import { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ModernNavItemProps {
  title: string;
  icon: LucideIcon;
  href: string;
  description: string;
  isCollapsed: boolean;
  category: string;
}

export function ModernNavItem({ 
  title, 
  icon: Icon, 
  href, 
  description, 
  isCollapsed,
  category 
}: ModernNavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === href;

  const handleClick = () => {
    // Close mobile menu when navigating
    const event = new CustomEvent('closeMobileMenu');
    window.dispatchEvent(event);
  };

  const getCategoryColor = (cat: string) => {
    const colors = {
      overview: "bg-blue-500/10 text-blue-700 border-blue-200",
      analytics: "bg-purple-500/10 text-purple-700 border-purple-200",
      financial: "bg-green-500/10 text-green-700 border-green-200",
      tools: "bg-orange-500/10 text-orange-700 border-orange-200",
      operations: "bg-blue-400/10 text-blue-600 border-blue-200",
      management: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
      ai: "bg-pink-500/10 text-pink-700 border-pink-200",
      account: "bg-gray-500/10 text-gray-700 border-gray-200",
      support: "bg-gray-400/10 text-gray-600 border-gray-200"
    };
    return colors[cat as keyof typeof colors] || colors.account;
  };

  return (
    <Link
      to={href}
      data-sidebar-menu-item
      data-category={category}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:shadow-sm",
        isActive 
          ? `${getCategoryColor(category)} shadow-sm scale-[1.02]`
          : "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900",
        isCollapsed && "justify-center px-2"
      )}
      title={isCollapsed ? `${title} - ${description}` : undefined}
      onClick={handleClick}
    >
      <div className={cn(
        "flex items-center justify-center rounded-lg p-1.5 transition-all duration-200",
        isActive 
          ? "bg-white/70 shadow-sm" 
          : "group-hover:bg-white/50"
      )}>
        <Icon className="h-4 w-4 shrink-0" />
      </div>
      
      {!isCollapsed && (
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium truncate">{title}</span>
          <span className="text-xs opacity-70 truncate">{description}</span>
        </div>
      )}

      {!isCollapsed && isActive && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="w-1.5 h-1.5 bg-current rounded-full opacity-60" />
        </div>
      )}
    </Link>
  );
}

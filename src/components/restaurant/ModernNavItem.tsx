
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ModernNavItemProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  isCollapsed: boolean;
  category: string;
}

export const ModernNavItem: React.FC<ModernNavItemProps> = ({
  href,
  icon: Icon,
  title,
  description,
  isCollapsed,
  category
}) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  const handleClick = () => {
    // Close mobile menu on navigation
    const event = new CustomEvent('closeMobileMenu');
    window.dispatchEvent(event);
  };

  return (
    <Link
      to={href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group sidebar-nav-item",
        "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm border border-sidebar-border/50",
        isCollapsed ? "justify-center px-2" : "justify-start"
      )}
      title={isCollapsed ? title : undefined}
    >
      <Icon className={cn(
        "h-4 w-4 flex-shrink-0 transition-colors",
        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70",
        "group-hover:text-sidebar-accent-foreground"
      )} />
      
      {!isCollapsed && (
        <div className="flex flex-col min-w-0 flex-1">
          <span className={cn(
            "text-sm font-medium truncate transition-colors",
            isActive ? "text-sidebar-primary" : "text-sidebar-foreground",
            "group-hover:text-sidebar-accent-foreground"
          )}>
            {title}
          </span>
          <span className={cn(
            "text-xs text-sidebar-foreground/60 truncate transition-colors",
            "group-hover:text-sidebar-accent-foreground/70"
          )}>
            {description}
          </span>
        </div>
      )}
      
      {isActive && !isCollapsed && (
        <div className="w-1 h-1 bg-sidebar-primary rounded-full flex-shrink-0" />
      )}
    </Link>
  );
};

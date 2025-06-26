
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ModernNavItemProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  isCollapsed: boolean;
  category?: string;
  badge?: string;
}

export const ModernNavItem: React.FC<ModernNavItemProps> = ({
  href,
  icon: Icon,
  title,
  description,
  isCollapsed,
  badge
}) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
        "hover:bg-gray-100 hover:text-gray-900",
        "dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-700/80",
        isActive && "bg-blue-50 text-blue-700 border border-blue-200",
        isActive && "dark:bg-gray-700 dark:text-white dark:border-gray-600",
        isCollapsed ? "justify-center px-2" : "justify-start"
      )}
      title={isCollapsed ? title : undefined}
    >
      <Icon className={cn(
        "h-4 w-4 flex-shrink-0 transition-colors",
        isActive ? "text-blue-600" : "text-gray-500",
        isActive && "dark:text-white",
        "group-hover:text-gray-700 dark:group-hover:text-white"
      )} />
      
      {!isCollapsed && (
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-sm font-medium truncate transition-colors",
              isActive ? "text-blue-700" : "text-gray-700",
              isActive && "dark:text-white",
              "group-hover:text-gray-900 dark:group-hover:text-white"
            )}>
              {title}
            </span>
            {badge && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <span className={cn(
            "text-xs text-gray-500 truncate transition-colors",
            "group-hover:text-gray-600",
            "dark:text-gray-400 dark:group-hover:text-gray-300"
          )}>
            {description}
          </span>
        </div>
      )}
      
      {isActive && !isCollapsed && (
        <div className="w-1 h-1 bg-blue-600 rounded-full flex-shrink-0 dark:bg-white" />
      )}
    </Link>
  );
};

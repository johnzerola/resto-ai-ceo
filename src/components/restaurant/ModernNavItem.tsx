
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

const categoryColors = {
  overview: "from-blue-500 to-blue-600",
  analytics: "from-purple-500 to-purple-600",
  financial: "from-green-500 to-green-600",
  tools: "from-orange-500 to-orange-600",
  operations: "from-blue-400 to-blue-500",
  management: "from-indigo-500 to-indigo-600",
  ai: "from-pink-500 to-pink-600",
  account: "from-gray-500 to-gray-600",
  support: "from-gray-400 to-gray-500"
};

export function ModernNavItem({ 
  href, 
  icon: Icon, 
  title, 
  description, 
  isCollapsed,
  category 
}: ModernNavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === href;
  const gradientColor = categoryColors[category as keyof typeof categoryColors] || categoryColors.overview;

  const handleClick = () => {
    // Close mobile menu when navigating
    window.dispatchEvent(new CustomEvent('closeMobileMenu'));
  };

  return (
    <Link to={href} onClick={handleClick}>
      <div
        className={cn(
          "group relative flex items-center rounded-xl transition-all duration-200 ease-out",
          isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
          isActive
            ? "bg-gradient-to-r shadow-lg transform scale-[1.02]"
            : "hover:bg-gray-50 hover:shadow-md hover:transform hover:scale-[1.01]",
          isActive && `${gradientColor} text-white`,
          !isActive && "text-gray-700 hover:text-gray-900"
        )}
      >
        {/* Active indicator */}
        {isActive && !isCollapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
        )}
        
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 transition-transform duration-200",
          isCollapsed ? "w-6 h-6" : "w-5 h-5 mr-3",
          "group-hover:scale-110"
        )}>
          <Icon className="w-full h-full" />
        </div>

        {/* Text content */}
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm truncate">
                {title}
              </span>
              {isActive && (
                <div className="w-2 h-2 bg-white rounded-full opacity-80" />
              )}
            </div>
            <p className={cn(
              "text-xs mt-0.5 truncate transition-colors",
              isActive ? "text-white/80" : "text-gray-500 group-hover:text-gray-600"
            )}>
              {description}
            </p>
          </div>
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            <div className="font-medium">{title}</div>
            <div className="text-gray-300 text-xs">{description}</div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        )}

        {/* Microinteraction ripple effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
        </div>
      </div>
    </Link>
  );
}

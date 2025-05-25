
import { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItemProps {
  title: string;
  icon: LucideIcon;
  href: string;
  description: string;
  isCollapsed: boolean;
}

export function NavItem({ title, icon: Icon, href, description, isCollapsed }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100",
        isActive && "bg-blue-100 text-blue-600",
        isCollapsed && "justify-center px-2"
      )}
      title={isCollapsed ? title : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-gray-500">{description}</span>
        </div>
      )}
    </Link>
  );
}

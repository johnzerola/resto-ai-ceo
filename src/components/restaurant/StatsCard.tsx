
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn("stats-card", className)}>
      <div className="flex justify-between items-start">
        <div>
          <div className="stats-label">{title}</div>
          <div className="stats-value mt-2">{value}</div>
        </div>
        {icon && <div className="text-resto-blue-500">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-xs">
          <span
            className={cn(
              "font-medium",
              trend.isPositive ? "text-resto-green-600" : "text-destructive"
            )}
          >
            {trend.isPositive ? "+" : "-"}
            {trend.value}%
          </span>
          <span className="ml-2 text-resto-gray-500">vs. mês anterior</span>
        </div>
      )}
    </div>
  );
}

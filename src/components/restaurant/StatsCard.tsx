
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | { value: number; isPositive: boolean };
  trendDesirable?: "up" | "down";
  className?: string;
}

export function StatsCard({ title, value, description, icon, trend, trendDesirable = "up", className }: StatsCardProps) {
  // Determine if the trend is a string or an object
  const trendValue = typeof trend === 'object' ? trend.value : 5;
  const trendIsPositive = typeof trend === 'object' 
    ? trend.isPositive 
    : trend === 'up' ? true : trend === 'down' ? false : true;

  const showTrend = trend !== undefined;
  
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-2xl font-bold mt-2">{value}</div>
        </div>
        {icon && <div className="text-blue-500">{icon}</div>}
      </div>
      {showTrend && (
        <div className="mt-3 flex items-center text-xs">
          <span
            className={cn(
              "font-medium",
              trendIsPositive === (trendDesirable === "up") 
                ? "text-green-600" 
                : "text-destructive"
            )}
          >
            {trendIsPositive ? "+" : "-"}
            {trendValue}%
          </span>
          {description && <span className="ml-2 text-gray-500">{description}</span>}
        </div>
      )}
      {!showTrend && description && (
        <div className="mt-3 text-xs text-gray-500">{description}</div>
      )}
    </div>
  );
}

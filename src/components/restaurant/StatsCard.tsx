
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

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

  // Determine if the trend is desirable based on the trendDesirable prop
  const isTrendDesirable = trendIsPositive === (trendDesirable === "up");
  
  return (
    <div className={cn("rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-2xl font-bold mt-2">{value}</div>
        </div>
        {icon && <div className="text-blue-500">{icon}</div>}
      </div>
      {showTrend && (
        <div className="mt-3 flex items-center text-xs font-medium">
          <div 
            className={cn(
              "mr-2 flex items-center rounded-full px-2 py-1",
              isTrendDesirable 
                ? "bg-green-50 text-green-600" 
                : "bg-red-50 text-destructive"
            )}
          >
            {trendIsPositive ? (
              <ArrowUp className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDown className="mr-1 h-3 w-3" />
            )}
            {trendValue}%
          </div>
          {description && <span className="text-gray-500">{description}</span>}
        </div>
      )}
      {!showTrend && description && (
        <div className="mt-3 text-xs text-gray-500">{description}</div>
      )}
    </div>
  );
}

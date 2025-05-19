
import { AlertCircle, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type AlertType = "warning" | "error" | "success";

export interface Alert {
  type: AlertType;
  title: string;
  description: string;
  date?: string;
}

interface AlertsProps {
  alerts: Alert[];
  onActionClick?: (alert: Alert) => void;
}

export function Alerts({ alerts, onActionClick }: AlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "warning":
        return (
          <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        );
      case "error":
        return (
          <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
        );
      case "success":
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        );
    }
  };

  const getBorderColor = (type: AlertType) => {
    switch (type) {
      case "warning":
        return "border-l-4 border-amber-500";
      case "error":
        return "border-l-4 border-red-500";
      case "success":
        return "border-l-4 border-green-500";
    }
  };

  const handleDismiss = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedAlerts(prev => [...prev, index]);
  };

  const handleActionClick = (alert: Alert) => {
    if (onActionClick) {
      onActionClick(alert);
    }
  };

  const visibleAlerts = alerts.filter((_, i) => !dismissedAlerts.includes(i));

  return (
    <div className="space-y-3">
      {visibleAlerts.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          Nenhum alerta no momento
        </div>
      ) : (
        visibleAlerts.map((alert, i) => (
          <div
            key={i}
            onClick={() => handleActionClick(alert)}
            className={cn(
              `p-3 bg-white rounded-md flex items-start space-x-3 ${getBorderColor(alert.type)}`,
              onActionClick && "cursor-pointer hover:bg-gray-50 transition-colors"
            )}
          >
            {getAlertIcon(alert.type)}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-medium text-gray-900">{alert.title}</p>
                {alert.date && (
                  <span className="text-xs text-muted-foreground">{alert.date}</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
            </div>
            <button 
              onClick={(e) => handleDismiss(i, e)} 
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              aria-label="Descartar alerta"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}

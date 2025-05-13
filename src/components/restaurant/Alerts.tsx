
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AlertType = "warning" | "error" | "success";

interface Alert {
  type: AlertType;
  title: string;
  description: string;
}

interface AlertsProps {
  alerts: Alert[];
}

export function Alerts({ alerts }: AlertsProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas e Notificações</CardTitle>
        <CardDescription>Atenção necessária</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-3 bg-white rounded-md flex items-center space-x-3 ${getBorderColor(
                alert.type
              )}`}
            >
              {getAlertIcon(alert.type)}
              <div>
                <p className="font-medium text-gray-900">{alert.title}</p>
                <p className="text-sm text-gray-500">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

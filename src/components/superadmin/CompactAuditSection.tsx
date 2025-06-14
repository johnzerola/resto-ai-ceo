
import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  timestamp: string;
  user_id: string;
  additional_data?: any;
}

interface CompactAuditSectionProps {
  logs: AuditLog[];
}

export const CompactAuditSection = memo(function CompactAuditSection({ logs }: CompactAuditSectionProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
          Logs de Auditoria
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Últimas ações dos usuários
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
          {logs.slice(0, 10).map((log, index) => (
            <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 border rounded-lg bg-muted/20">
              <Badge 
                variant={log.action === 'DELETE' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {log.action}
              </Badge>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-medium truncate block">
                  {log.table_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

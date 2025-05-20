
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { getSyncStatus, startSync, getSyncLogs } from "@/services/SyncService";

interface SyncTabProps {
  isLoading: boolean;
  syncStatus: {
    lastSync: string | null;
    inProgress: boolean;
  };
  syncLogs: any[];
  onSync: () => Promise<void>;
}

export function SyncTab({ isLoading, syncStatus, syncLogs, onSync }: SyncTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Status de Sincronização</CardTitle>
              <CardDescription>
                Estado atual da sincronização de dados entre o aplicativo e o Supabase
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSync}
              disabled={isLoading || syncStatus.inProgress}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Sincronizar Agora
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">Status Atual</div>
              <div className="flex items-center">
                {syncStatus.inProgress ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                    Sincronizando...
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Sincronizado
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">Última Sincronização</div>
              <div className="font-medium">
                {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : "Nunca"}
              </div>
            </div>
          </div>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-md">Histórico de Sincronização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mensagem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">{log.source}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              log.type === "success" ? "default" : 
                              log.type === "warning" ? "outline" : 
                              log.type === "error" ? "destructive" : "secondary"
                            }
                            className={log.type === "success" ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {log.type === "success" ? "Sucesso" : 
                             log.type === "warning" ? "Alerta" : 
                             log.type === "error" ? "Erro" : log.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.message}</TableCell>
                      </TableRow>
                    ))}
                    {syncLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          {isLoading ? "Carregando..." : "Nenhum registro de sincronização encontrado"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

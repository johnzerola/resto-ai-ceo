
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface HealthTabProps {
  systemHealth: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
}

export function HealthTab({ systemHealth }: HealthTabProps) {
  return (
    <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Saúde do Sistema</CardTitle>
          <CardDescription>
            Status atual dos recursos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">CPU</span>
              <span className="text-sm font-medium">{systemHealth.cpu}%</span>
            </div>
            <Progress value={systemHealth.cpu} />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Memória</span>
              <span className="text-sm font-medium">{systemHealth.memory}%</span>
            </div>
            <Progress value={systemHealth.memory} />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Armazenamento</span>
              <span className="text-sm font-medium">{systemHealth.storage}%</span>
            </div>
            <Progress value={systemHealth.storage} />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Rede</span>
              <span className="text-sm font-medium">{systemHealth.network}%</span>
            </div>
            <Progress value={systemHealth.network} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Logs do Sistema</CardTitle>
          <CardDescription>
            Últimos eventos registrados
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-64 overflow-auto">
          <div className="font-mono text-xs space-y-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
              [INFO] {new Date().toISOString()} - Sistema inicializado com sucesso
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
              [INFO] {new Date(Date.now() - 500000).toISOString()} - Backup automático executado
            </div>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              [WARN] {new Date(Date.now() - 1000000).toISOString()} - Tentativas de login múltiplas
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
              [INFO] {new Date(Date.now() - 2000000).toISOString()} - Atualização de dados concluída
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
              [INFO] {new Date(Date.now() - 3000000).toISOString()} - Novo usuário registrado
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
              [ERROR] {new Date(Date.now() - 5000000).toISOString()} - Falha na sincronização
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Status da Integração</CardTitle>
          <CardDescription>
            Status da conexão com serviços externos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Verificação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Supabase Auth</TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Operacional
                  </Badge>
                </TableCell>
                <TableCell>{new Date().toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Supabase Database</TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Operacional
                  </Badge>
                </TableCell>
                <TableCell>{new Date().toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Supabase Storage</TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Operacional
                  </Badge>
                </TableCell>
                <TableCell>{new Date().toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Supabase Functions</TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Operacional
                  </Badge>
                </TableCell>
                <TableCell>{new Date().toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

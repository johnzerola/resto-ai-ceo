
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backupService, BackupData, BackupSchedule } from "@/services/BackupService";
import { HardDrive, Download, Upload, Settings, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export function BackupDashboard() {
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    loadBackupData();
  }, []);

  const loadBackupData = () => {
    setBackups(backupService.getBackups());
    setSchedules(backupService.getSchedules());
  };

  const createManualBackup = async () => {
    setIsCreatingBackup(true);
    try {
      await backupService.createManualBackup();
      loadBackupData();
    } catch (error) {
      toast.error("Erro ao criar backup");
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    try {
      const success = await backupService.restoreBackup(backupId);
      if (success) {
        loadBackupData();
      }
    } catch (error) {
      toast.error("Erro ao restaurar backup");
    }
  };

  const exportBackup = (backupId: string) => {
    backupService.exportBackup(backupId);
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Estatísticas
  const stats = {
    totalBackups: backups.length,
    successfulBackups: backups.filter(b => b.status === 'completed').length,
    failedBackups: backups.filter(b => b.status === 'failed').length,
    totalSize: backups.reduce((acc, backup) => acc + backup.size, 0),
    activeSchedules: schedules.filter(s => s.enabled).length
  };

  const lastBackup = backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Backup</h2>
          <p className="text-muted-foreground">
            Gerencie backups automáticos e manuais dos dados do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={createManualBackup} 
            disabled={isCreatingBackup}
          >
            <HardDrive className="h-4 w-4 mr-2" />
            {isCreatingBackup ? 'Criando...' : 'Criar Backup'}
          </Button>
        </div>
      </div>

      {/* Estatísticas de Backup */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Backups</p>
                <p className="text-2xl font-bold">{stats.totalBackups}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Bem-sucedidos</p>
                <p className="text-2xl font-bold">{stats.successfulBackups}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Falharam</p>
                <p className="text-2xl font-bold">{stats.failedBackups}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tamanho Total</p>
                <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Agendamentos Ativos</p>
                <p className="text-2xl font-bold">{stats.activeSchedules}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status do Último Backup */}
      {lastBackup && (
        <Card>
          <CardHeader>
            <CardTitle>Último Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(lastBackup.status)}
                <div>
                  <p className="font-medium">
                    Backup {lastBackup.type === 'automatic' ? 'Automático' : 'Manual'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(lastBackup.timestamp).toLocaleString()} • {formatFileSize(lastBackup.size)}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(lastBackup.status)}>
                {lastBackup.status === 'completed' ? 'Concluído' : 
                 lastBackup.status === 'failed' ? 'Falhou' : 'Em Progresso'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos de Backup</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Execução</TableHead>
                  <TableHead>Próxima Execução</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      {schedule.frequency === 'daily' ? 'Diário' : 
                       schedule.frequency === 'weekly' ? 'Semanal' : 'Mensal'}
                    </TableCell>
                    <TableCell>{schedule.time}</TableCell>
                    <TableCell>
                      <Badge variant={schedule.enabled ? 'default' : 'secondary'}>
                        {schedule.enabled ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {schedule.last_run ? new Date(schedule.last_run).toLocaleString() : 'Nunca'}
                    </TableCell>
                    <TableCell>{new Date(schedule.next_run).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum agendamento configurado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
        </CardHeader>
        <CardContent>
          {backups.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.slice(0, 10).map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>{new Date(backup.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(backup.status)}
                        <Badge className={getStatusColor(backup.status)}>
                          {backup.status === 'completed' ? 'Concluído' : 
                           backup.status === 'failed' ? 'Falhou' : 'Em Progresso'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(backup.size)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportBackup(backup.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {backup.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreBackup(backup.id)}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum backup encontrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

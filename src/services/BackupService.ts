
import { toast } from "sonner";

// Tipos para backup
export interface BackupData {
  id: string;
  timestamp: string;
  type: 'manual' | 'automatic';
  size: number;
  status: 'completed' | 'failed' | 'in_progress';
  data: {
    security_logs: any[];
    lgpd_data: any[];
    user_data: any[];
    configuration: any;
    compliance_data: any[];
  };
  checksum?: string;
}

export interface BackupSchedule {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
  last_run?: string;
  next_run: string;
}

// Classe para backup automatizado
export class BackupService {
  private static instance: BackupService;
  private backups: BackupData[] = [];
  private schedules: BackupSchedule[] = [];

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.initializeSchedules();
    this.startAutomaticBackup();
  }

  private loadFromStorage(): void {
    try {
      const backups = localStorage.getItem('system_backups');
      if (backups) this.backups = JSON.parse(backups);

      const schedules = localStorage.getItem('backup_schedules');
      if (schedules) this.schedules = JSON.parse(schedules);
    } catch (error) {
      console.error("Erro ao carregar dados de backup:", error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('system_backups', JSON.stringify(this.backups));
      localStorage.setItem('backup_schedules', JSON.stringify(this.schedules));
    } catch (error) {
      console.error("Erro ao salvar dados de backup:", error);
    }
  }

  private initializeSchedules(): void {
    if (this.schedules.length === 0) {
      const defaultSchedule: BackupSchedule = {
        id: crypto.randomUUID(),
        frequency: 'daily',
        time: '02:00',
        enabled: true,
        next_run: this.calculateNextRun('daily', '02:00')
      };

      this.schedules.push(defaultSchedule);
      this.saveToStorage();
    }
  }

  private calculateNextRun(frequency: string, time: string): string {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case 'weekly':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;
      case 'monthly':
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
    }

    return nextRun.toISOString();
  }

  // Backup manual
  async createManualBackup(): Promise<BackupData> {
    console.log("Iniciando backup manual...");

    const backup: BackupData = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'manual',
      size: 0,
      status: 'in_progress',
      data: {
        security_logs: [],
        lgpd_data: [],
        user_data: [],
        configuration: {},
        compliance_data: []
      }
    };

    try {
      // Coletar dados de segurança
      backup.data.security_logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      
      // Coletar dados LGPD
      backup.data.lgpd_data = [
        JSON.parse(localStorage.getItem('consent_records') || '[]'),
        JSON.parse(localStorage.getItem('data_subject_requests') || '[]')
      ];

      // Coletar dados do usuário
      backup.data.user_data = [
        JSON.parse(localStorage.getItem('users') || '[]'),
        JSON.parse(localStorage.getItem('currentUser') || 'null')
      ];

      // Coletar configurações
      backup.data.configuration = {
        consent_given: localStorage.getItem('lgpd_consent_given'),
        data_initialized: localStorage.getItem('dataInitialized'),
        backup_schedules: this.schedules
      };

      // Coletar dados de conformidade
      backup.data.compliance_data = [
        JSON.parse(localStorage.getItem('lgpd_compliance_checks') || '[]'),
        JSON.parse(localStorage.getItem('dpo_reports') || '[]'),
        JSON.parse(localStorage.getItem('privacy_incidents') || '[]')
      ];

      // Calcular tamanho
      const dataString = JSON.stringify(backup.data);
      backup.size = new Blob([dataString]).size;
      backup.checksum = await this.generateChecksum(dataString);
      backup.status = 'completed';

      this.backups.push(backup);
      this.saveToStorage();

      toast.success("Backup manual criado com sucesso!");
      return backup;

    } catch (error) {
      console.error("Erro ao criar backup:", error);
      backup.status = 'failed';
      this.backups.push(backup);
      this.saveToStorage();
      toast.error("Falha ao criar backup");
      throw error;
    }
  }

  // Backup automático
  async createAutomaticBackup(): Promise<BackupData> {
    console.log("Executando backup automático...");
    
    const backup = await this.createManualBackup();
    backup.type = 'automatic';
    
    // Limpar backups antigos (manter apenas os últimos 30)
    this.cleanOldBackups();
    
    return backup;
  }

  // Restaurar backup
  async restoreBackup(backupId: string): Promise<boolean> {
    const backup = this.backups.find(b => b.id === backupId);
    
    if (!backup || backup.status !== 'completed') {
      toast.error("Backup não encontrado ou inválido");
      return false;
    }

    try {
      // Verificar integridade
      const dataString = JSON.stringify(backup.data);
      const currentChecksum = await this.generateChecksum(dataString);
      
      if (backup.checksum && currentChecksum !== backup.checksum) {
        toast.error("Backup corrompido - checksum inválido");
        return false;
      }

      // Confirmar restauração
      const confirmed = confirm(
        `Tem certeza que deseja restaurar o backup de ${new Date(backup.timestamp).toLocaleString()}? ` +
        "Todos os dados atuais serão substituídos."
      );

      if (!confirmed) return false;

      // Restaurar dados
      localStorage.setItem('security_logs', JSON.stringify(backup.data.security_logs));
      localStorage.setItem('consent_records', JSON.stringify(backup.data.lgpd_data[0]));
      localStorage.setItem('data_subject_requests', JSON.stringify(backup.data.lgpd_data[1]));
      localStorage.setItem('users', JSON.stringify(backup.data.user_data[0]));
      
      if (backup.data.user_data[1]) {
        localStorage.setItem('currentUser', JSON.stringify(backup.data.user_data[1]));
      }

      // Restaurar configurações
      Object.entries(backup.data.configuration).forEach(([key, value]) => {
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      });

      toast.success("Backup restaurado com sucesso! Recarregue a página.");
      return true;

    } catch (error) {
      console.error("Erro ao restaurar backup:", error);
      toast.error("Falha ao restaurar backup");
      return false;
    }
  }

  // Exportar backup
  exportBackup(backupId: string): void {
    const backup = this.backups.find(b => b.id === backupId);
    
    if (!backup) {
      toast.error("Backup não encontrado");
      return;
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${backup.timestamp.split('T')[0]}_${backup.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Backup exportado com sucesso!");
  }

  // Iniciar backup automático
  private startAutomaticBackup(): void {
    // Verificar agendamentos a cada hora
    setInterval(() => {
      this.checkScheduledBackups();
    }, 60 * 60 * 1000);

    // Verificar imediatamente
    setTimeout(() => {
      this.checkScheduledBackups();
    }, 5000);
  }

  private async checkScheduledBackups(): Promise<void> {
    const now = new Date();

    for (const schedule of this.schedules) {
      if (schedule.enabled && new Date(schedule.next_run) <= now) {
        try {
          await this.createAutomaticBackup();
          
          // Atualizar próxima execução
          schedule.last_run = now.toISOString();
          schedule.next_run = this.calculateNextRun(schedule.frequency, schedule.time);
          
          this.saveToStorage();
          
        } catch (error) {
          console.error("Erro no backup automático:", error);
        }
      }
    }
  }

  private cleanOldBackups(): void {
    // Manter apenas os últimos 30 backups
    if (this.backups.length > 30) {
      this.backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      this.backups = this.backups.slice(0, 30);
      this.saveToStorage();
    }
  }

  private async generateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Getters
  getBackups(): BackupData[] {
    return [...this.backups];
  }

  getSchedules(): BackupSchedule[] {
    return [...this.schedules];
  }

  // Configurar agendamento
  updateSchedule(scheduleId: string, updates: Partial<BackupSchedule>): void {
    const schedule = this.schedules.find(s => s.id === scheduleId);
    if (schedule) {
      Object.assign(schedule, updates);
      
      if (updates.frequency || updates.time) {
        schedule.next_run = this.calculateNextRun(
          schedule.frequency, 
          schedule.time
        );
      }
      
      this.saveToStorage();
      toast.success("Agendamento de backup atualizado");
    }
  }
}

export const backupService = BackupService.getInstance();


import { toast } from "sonner";

export interface UptimeRecord {
  id: string;
  timestamp: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  endpoint: string;
  errorMessage?: string;
}

export interface PerformanceMetric {
  id: string;
  timestamp: string;
  metric: 'page_load' | 'api_response' | 'memory_usage' | 'cpu_usage';
  value: number;
  unit: string;
  threshold?: number;
}

export interface Alert {
  id: string;
  type: 'uptime' | 'performance' | 'security' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private uptimeRecords: UptimeRecord[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private alerts: Alert[] = [];
  private monitoringInterval?: number;
  private isMonitoring = false;

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.startMonitoring();
  }

  private loadFromStorage(): void {
    try {
      const uptime = localStorage.getItem('uptime_records');
      if (uptime) this.uptimeRecords = JSON.parse(uptime);

      const performance = localStorage.getItem('performance_metrics');
      if (performance) this.performanceMetrics = JSON.parse(performance);

      const alerts = localStorage.getItem('monitoring_alerts');
      if (alerts) this.alerts = JSON.parse(alerts);
    } catch (error) {
      console.error("Erro ao carregar dados de monitoramento:", error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('uptime_records', JSON.stringify(this.uptimeRecords));
      localStorage.setItem('performance_metrics', JSON.stringify(this.performanceMetrics));
      localStorage.setItem('monitoring_alerts', JSON.stringify(this.alerts));
    } catch (error) {
      console.error("Erro ao salvar dados de monitoramento:", error);
    }
  }

  // Monitoramento de uptime
  async checkUptime(): Promise<UptimeRecord> {
    const startTime = performance.now();
    const endpoint = window.location.origin;

    try {
      const response = await fetch(endpoint + '/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      const record: UptimeRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        status: response.ok ? 'up' : 'degraded',
        responseTime,
        endpoint
      };

      this.uptimeRecords.push(record);
      this.cleanOldRecords();

      // Verificar alertas
      if (responseTime > 2000) {
        this.createAlert('performance', 'medium', `Tempo de resposta alto: ${Math.round(responseTime)}ms`);
      }

      if (!response.ok) {
        this.createAlert('uptime', 'high', `Serviço indisponível: ${response.status}`);
      }

      this.saveToStorage();
      return record;

    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      const record: UptimeRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        status: 'down',
        responseTime,
        endpoint,
        errorMessage: (error as Error).message
      };

      this.uptimeRecords.push(record);
      this.createAlert('uptime', 'critical', `Serviço offline: ${(error as Error).message}`);
      this.saveToStorage();
      return record;
    }
  }

  // Monitoramento de performance
  recordPerformanceMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const performanceMetric: PerformanceMetric = {
      ...metric,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    this.performanceMetrics.push(performanceMetric);

    // Verificar thresholds
    if (metric.threshold && metric.value > metric.threshold) {
      this.createAlert('performance', 'medium', 
        `Métrica ${metric.metric} excedeu limite: ${metric.value}${metric.unit}`);
    }

    this.cleanOldRecords();
    this.saveToStorage();
  }

  // Sistema de alertas
  private createAlert(type: Alert['type'], severity: Alert['severity'], message: string): void {
    const alert: Alert = {
      id: crypto.randomUUID(),
      type,
      severity,
      message,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.push(alert);

    // Notificar usuário para alertas críticos
    if (severity === 'critical' || severity === 'high') {
      toast.error(`Alerta ${severity}: ${message}`);
    }

    this.saveToStorage();
  }

  // Iniciar monitoramento automático
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Verificar uptime a cada 5 minutos
    this.monitoringInterval = window.setInterval(() => {
      this.checkUptime();
    }, 5 * 60 * 1000);

    // Monitorar performance da página
    this.monitorPagePerformance();

    console.log("Monitoramento iniciado");
  }

  private monitorPagePerformance(): void {
    // Monitorar tempo de carregamento
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      if (loadTime > 0) {
        this.recordPerformanceMetric({
          metric: 'page_load',
          value: loadTime,
          unit: 'ms',
          threshold: 3000
        });
      }
    }

    // Monitorar uso de memória (se disponível)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordPerformanceMetric({
        metric: 'memory_usage',
        value: memory.usedJSHeapSize / 1024 / 1024,
        unit: 'MB',
        threshold: 100
      });
    }
  }

  // Parar monitoramento
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log("Monitoramento parado");
  }

  // Limpar registros antigos (manter apenas 7 dias)
  private cleanOldRecords(): void {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    this.uptimeRecords = this.uptimeRecords.filter(record => 
      new Date(record.timestamp) > sevenDaysAgo
    );

    this.performanceMetrics = this.performanceMetrics.filter(metric => 
      new Date(metric.timestamp) > sevenDaysAgo
    );

    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) > sevenDaysAgo
    );
  }

  // Calcular uptime percentage
  calculateUptime(): number {
    if (this.uptimeRecords.length === 0) return 100;

    const upRecords = this.uptimeRecords.filter(record => record.status === 'up').length;
    return Math.round((upRecords / this.uptimeRecords.length) * 100 * 100) / 100;
  }

  // Calcular tempo médio de resposta
  getAverageResponseTime(): number {
    if (this.uptimeRecords.length === 0) return 0;

    const totalTime = this.uptimeRecords.reduce((sum, record) => sum + record.responseTime, 0);
    return Math.round(totalTime / this.uptimeRecords.length);
  }

  // Getters
  getUptimeRecords(): UptimeRecord[] {
    return [...this.uptimeRecords];
  }

  getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Resolver alerta
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      this.saveToStorage();
    }
  }

  // Teste de carga
  async runLoadTest(concurrent: number = 10, duration: number = 30): Promise<any> {
    console.log(`Iniciando teste de carga: ${concurrent} requisições simultâneas por ${duration}s`);

    const results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      responseTimes: [] as number[]
    };

    const startTime = Date.now();
    const promises: Promise<any>[] = [];

    const makeRequest = async () => {
      const requestStart = performance.now();
      try {
        const response = await fetch(window.location.origin, { cache: 'no-cache' });
        const requestEnd = performance.now();
        const responseTime = requestEnd - requestStart;

        results.totalRequests++;
        results.responseTimes.push(responseTime);
        
        if (response.ok) {
          results.successfulRequests++;
        } else {
          results.failedRequests++;
        }

        results.minResponseTime = Math.min(results.minResponseTime, responseTime);
        results.maxResponseTime = Math.max(results.maxResponseTime, responseTime);

      } catch (error) {
        results.totalRequests++;
        results.failedRequests++;
      }
    };

    // Executar requisições concorrentes
    const interval = setInterval(() => {
      for (let i = 0; i < concurrent; i++) {
        promises.push(makeRequest());
      }
    }, 1000);

    // Parar após duração especificada
    setTimeout(() => {
      clearInterval(interval);
    }, duration * 1000);

    // Aguardar conclusão
    await new Promise(resolve => setTimeout(resolve, (duration + 5) * 1000));
    await Promise.all(promises);

    // Calcular estatísticas
    if (results.responseTimes.length > 0) {
      results.averageResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
    }

    // Registrar resultado
    this.recordPerformanceMetric({
      metric: 'api_response',
      value: results.averageResponseTime,
      unit: 'ms'
    });

    console.log("Teste de carga concluído:", results);
    toast.success(`Teste de carga concluído: ${results.successfulRequests}/${results.totalRequests} sucessos`);

    return results;
  }
}

export const monitoringService = MonitoringService.getInstance();

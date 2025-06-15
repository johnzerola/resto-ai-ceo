
import { supabase } from '@/integrations/supabase/client';
import { SystemLogService } from './SystemLogService';

export interface SystemMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  planDistribution: { [plan: string]: number };
  dailyAIUsage: number;
  errorRate: number;
  webhookSuccessRate: number;
  lastUpdated: string;
}

export interface AlertConfig {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export class MonitoringService {
  static async getSystemMetrics(): Promise<SystemMetrics | null> {
    try {
      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true });

      // Assinaturas ativas
      const { count: activeSubscriptions } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true)
        .eq('plan_status', 'active');

      // Distribuição de planos
      const { data: planData } = await supabase
        .from('subscribers')
        .select('subscription_tier')
        .eq('subscribed', true);

      const planDistribution: { [plan: string]: number } = {};
      planData?.forEach(sub => {
        const plan = sub.subscription_tier || 'free';
        planDistribution[plan] = (planDistribution[plan] || 0) + 1;
      });

      // Uso diário de IA
      const today = new Date().toISOString().split('T')[0];
      const { data: aiUsage } = await supabase
        .from('ia_usage')
        .select('messages_sent')
        .eq('date', today);

      const dailyAIUsage = aiUsage?.reduce((sum, usage) => sum + (usage.messages_sent || 0), 0) || 0;

      // Taxa de erro (últimas 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count: totalLogs } = await supabase
        .from('system_logs')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', yesterday.toISOString());

      const { count: errorLogs } = await supabase
        .from('system_logs')
        .select('*', { count: 'exact', head: true })
        .in('severity', ['error', 'critical'])
        .gte('timestamp', yesterday.toISOString());

      const errorRate = totalLogs ? (errorLogs || 0) / totalLogs * 100 : 0;

      // Taxa de sucesso de webhooks (últimas 24h)
      const { count: totalWebhooks } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', yesterday.toISOString());

      const { count: successWebhooks } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'success')
        .gte('timestamp', yesterday.toISOString());

      const webhookSuccessRate = totalWebhooks ? (successWebhooks || 0) / totalWebhooks * 100 : 100;

      return {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        planDistribution,
        dailyAIUsage,
        errorRate,
        webhookSuccessRate,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      await SystemLogService.log(
        'Monitoring',
        'metrics_error',
        `Erro ao obter métricas do sistema: ${error}`,
        'error'
      );
      return null;
    }
  }

  static async checkAlerts(): Promise<string[]> {
    const alerts: string[] = [];
    
    try {
      const metrics = await this.getSystemMetrics();
      if (!metrics) return ['Falha ao obter métricas do sistema'];

      // Verificar taxa de erro alta
      if (metrics.errorRate > 5) {
        alerts.push(`Taxa de erro alta: ${metrics.errorRate.toFixed(2)}%`);
        await SystemLogService.log(
          'Monitoring',
          'alert_error_rate',
          `Taxa de erro crítica detectada: ${metrics.errorRate.toFixed(2)}%`,
          'critical'
        );
      }

      // Verificar taxa de sucesso de webhooks baixa
      if (metrics.webhookSuccessRate < 90) {
        alerts.push(`Taxa de sucesso de webhooks baixa: ${metrics.webhookSuccessRate.toFixed(2)}%`);
        await SystemLogService.log(
          'Monitoring',
          'alert_webhook_failure',
          `Taxa de sucesso de webhooks baixa: ${metrics.webhookSuccessRate.toFixed(2)}%`,
          'warning'
        );
      }

      // Verificar uso excessivo de IA
      if (metrics.dailyAIUsage > 10000) {
        alerts.push(`Uso diário de IA muito alto: ${metrics.dailyAIUsage} mensagens`);
        await SystemLogService.log(
          'Monitoring',
          'alert_ai_usage',
          `Uso diário de IA excedendo limite esperado: ${metrics.dailyAIUsage}`,
          'warning'
        );
      }

      return alerts;

    } catch (error) {
      await SystemLogService.log(
        'Monitoring',
        'alert_check_error',
        `Erro ao verificar alertas: ${error}`,
        'error'
      );
      return [`Erro ao verificar alertas: ${error}`];
    }
  }

  static async logPerformanceMetric(metric: string, value: number, context?: any): Promise<void> {
    await SystemLogService.log(
      'Performance',
      'metric',
      `${metric}: ${value}`,
      'info',
      { metric, value, ...context }
    );
  }

  static async getSystemHealth(): Promise<{ status: 'healthy' | 'warning' | 'critical'; details: string[] }> {
    const alerts = await this.checkAlerts();
    const metrics = await this.getSystemMetrics();

    if (!metrics) {
      return { status: 'critical', details: ['Falha ao obter métricas do sistema'] };
    }

    if (alerts.length === 0) {
      return { status: 'healthy', details: ['Todos os sistemas operando normalmente'] };
    }

    // Determinar severidade baseada nos alertas
    const hasCriticalIssues = alerts.some(alert => 
      alert.includes('Taxa de erro alta') || alert.includes('Falha ao obter métricas')
    );

    return {
      status: hasCriticalIssues ? 'critical' : 'warning',
      details: alerts
    };
  }
}

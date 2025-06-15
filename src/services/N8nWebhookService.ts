
import { supabase } from '@/integrations/supabase/client';
import { WebhookService } from './WebhookService';
import { SystemLogService } from './SystemLogService';

export interface N8nWebhookConfig {
  baseUrl: string;
  authToken?: string;
  endpoints: {
    userRegistration: string;
    planUpgrade: string;
    planDowngrade: string;
    usageLimitReached: string;
    paymentReceived: string;
    subscriptionExpired: string;
  };
}

export interface WebhookPayload {
  event: string;
  userId: string;
  email?: string;
  planType?: string;
  previousPlan?: string;
  timestamp: string;
  metadata?: any;
}

export class N8nWebhookService {
  private static config: N8nWebhookConfig = {
    baseUrl: process.env.N8N_WEBHOOK_BASE_URL || 'https://n8n.yourcompany.com/webhook',
    authToken: process.env.N8N_WEBHOOK_TOKEN,
    endpoints: {
      userRegistration: '/user-registration',
      planUpgrade: '/plan-upgrade',
      planDowngrade: '/plan-downgrade',
      usageLimitReached: '/usage-limit-reached',
      paymentReceived: '/payment-received',
      subscriptionExpired: '/subscription-expired'
    }
  };

  static async triggerUserRegistration(userId: string, email: string, planType: string = 'free'): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'user_registration',
      userId,
      email,
      planType,
      timestamp: new Date().toISOString()
    };

    return await this.sendWebhook('userRegistration', payload);
  }

  static async triggerPlanUpgrade(userId: string, email: string, previousPlan: string, newPlan: string): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'plan_upgrade',
      userId,
      email,
      planType: newPlan,
      previousPlan,
      timestamp: new Date().toISOString(),
      metadata: { 
        upgradeType: 'manual',
        source: 'dashboard'
      }
    };

    return await this.sendWebhook('planUpgrade', payload);
  }

  static async triggerPlanDowngrade(userId: string, email: string, previousPlan: string, newPlan: string): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'plan_downgrade',
      userId,
      email,
      planType: newPlan,
      previousPlan,
      timestamp: new Date().toISOString(),
      metadata: { 
        downgradeType: 'manual',
        source: 'dashboard'
      }
    };

    return await this.sendWebhook('planDowngrade', payload);
  }

  static async triggerUsageLimitReached(userId: string, email: string, limitType: string, currentUsage: number, limit: number): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'usage_limit_reached',
      userId,
      email,
      timestamp: new Date().toISOString(),
      metadata: {
        limitType,
        currentUsage,
        limit,
        percentageUsed: Math.round((currentUsage / limit) * 100)
      }
    };

    return await this.sendWebhook('usageLimitReached', payload);
  }

  static async triggerPaymentReceived(userId: string, email: string, amount: number, planType: string): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'payment_received',
      userId,
      email,
      planType,
      timestamp: new Date().toISOString(),
      metadata: {
        amount,
        currency: 'BRL',
        paymentMethod: 'stripe'
      }
    };

    return await this.sendWebhook('paymentReceived', payload);
  }

  static async triggerSubscriptionExpired(userId: string, email: string, expiredPlan: string): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'subscription_expired',
      userId,
      email,
      planType: 'free',
      previousPlan: expiredPlan,
      timestamp: new Date().toISOString(),
      metadata: {
        autoDowngrade: true,
        reason: 'subscription_expired'
      }
    };

    return await this.sendWebhook('subscriptionExpired', payload);
  }

  private static async sendWebhook(endpoint: keyof N8nWebhookConfig['endpoints'], payload: WebhookPayload): Promise<boolean> {
    try {
      const webhookUrl = `${this.config.baseUrl}${this.config.endpoints[endpoint]}`;
      
      // Registrar tentativa de webhook
      const logId = await WebhookService.logWebhook(
        payload.event,
        payload,
        payload.userId,
        webhookUrl
      );

      if (!logId) {
        console.error('Falha ao registrar webhook log');
        return false;
      }

      // Preparar headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'RestaurIA-Webhook/1.0'
      };

      if (this.config.authToken) {
        headers['Authorization'] = `Bearer ${this.config.authToken}`;
      }

      // Enviar webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const responseData = await response.text();
      const success = response.ok;

      // Atualizar status do webhook
      await WebhookService.updateWebhookStatus(
        logId,
        success ? 'success' : 'failed',
        {
          statusCode: response.status,
          response: responseData,
          headers: Object.fromEntries(response.headers.entries())
        }
      );

      if (success) {
        await SystemLogService.log(
          'N8nWebhook',
          'webhook_success',
          `Webhook ${payload.event} enviado com sucesso para ${webhookUrl}`,
          'info',
          { payload, response: responseData },
          payload.userId
        );
      } else {
        await SystemLogService.log(
          'N8nWebhook',
          'webhook_failed',
          `Webhook ${payload.event} falhou: ${response.status} ${response.statusText}`,
          'error',
          { payload, response: responseData, statusCode: response.status },
          payload.userId
        );
      }

      return success;

    } catch (error) {
      await SystemLogService.log(
        'N8nWebhook',
        'webhook_error',
        `Erro ao enviar webhook ${payload.event}: ${error}`,
        'error',
        { payload, error: String(error) },
        payload.userId
      );

      console.error('Erro ao enviar webhook:', error);
      return false;
    }
  }

  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const testPayload = {
        event: 'connection_test',
        userId: 'test-user',
        timestamp: new Date().toISOString(),
        metadata: { test: true }
      };

      const webhookUrl = `${this.config.baseUrl}/test`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.authToken && { 'Authorization': `Bearer ${this.config.authToken}` })
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        return { 
          success: true, 
          message: `Conexão com n8n estabelecida com sucesso (${response.status})` 
        };
      } else {
        return { 
          success: false, 
          message: `Falha na conexão: ${response.status} ${response.statusText}` 
        };
      }

    } catch (error) {
      return { 
        success: false, 
        message: `Erro de conexão: ${error}` 
      };
    }
  }

  static updateConfig(newConfig: Partial<N8nWebhookConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  static getConfig(): N8nWebhookConfig {
    return { ...this.config };
  }
}

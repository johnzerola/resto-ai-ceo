
import { supabase } from '@/integrations/supabase/client';

export interface WebhookLog {
  id: string;
  user_id?: string;
  event: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  payload?: any;
  response?: any;
  webhook_url?: string;
  timestamp: string;
  processed_at?: string;
}

export class WebhookService {
  static async logWebhook(
    event: string,
    payload: any,
    userId?: string,
    webhookUrl?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .insert({
          user_id: userId,
          event,
          status: 'pending',
          payload,
          webhook_url: webhookUrl
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Erro ao registrar webhook:', error);
      return null;
    }
  }

  static async updateWebhookStatus(
    id: string,
    status: WebhookLog['status'],
    response?: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('webhook_logs')
        .update({
          status,
          response,
          processed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do webhook:', error);
      return false;
    }
  }

  static async getPendingWebhooks(): Promise<WebhookLog[]> {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('status', 'pending')
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Erro ao buscar webhooks pendentes:', error);
      return [];
    }

    return data || [];
  }

  static async getUserWebhooks(userId: string, limit: number = 50): Promise<WebhookLog[]> {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar webhooks do usuário:', error);
      return [];
    }

    return data || [];
  }
}

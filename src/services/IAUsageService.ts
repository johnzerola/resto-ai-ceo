
import { supabase } from '@/integrations/supabase/client';

export interface IAUsageRecord {
  id: string;
  user_id: string;
  date: string;
  tokens_used: number;
  messages_sent: number;
  plan_limit: number;
  feature_used?: string;
  created_at: string;
}

export class IAUsageService {
  static async recordUsage(
    userId: string, 
    tokensUsed: number = 0, 
    messagesSent: number = 1,
    featureUsed?: string
  ): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Verificar se já existe registro para hoje
      const { data: existing } = await supabase
        .from('ia_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (existing) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('ia_usage')
          .update({
            tokens_used: existing.tokens_used + tokensUsed,
            messages_sent: existing.messages_sent + messagesSent,
            feature_used: featureUsed || existing.feature_used
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('ia_usage')
          .insert({
            user_id: userId,
            date: today,
            tokens_used: tokensUsed,
            messages_sent: messagesSent,
            feature_used: featureUsed
          });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao registrar uso da IA:', error);
      return false;
    }
  }

  static async getUserDailyUsage(userId: string, date?: string): Promise<IAUsageRecord | null> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('ia_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('date', targetDate)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar uso da IA:', error);
      return null;
    }

    return data;
  }

  static async getUserMonthlyUsage(userId: string, year: number, month: number): Promise<IAUsageRecord[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    const { data, error } = await supabase
      .from('ia_usage')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar uso mensal da IA:', error);
      return [];
    }

    return data || [];
  }

  static async checkUserLimit(userId: string, planLimit: number): Promise<boolean> {
    if (planLimit === -1) return true; // Ilimitado

    const usage = await this.getUserDailyUsage(userId);
    const currentUsage = usage?.messages_sent || 0;

    return currentUsage < planLimit;
  }
}

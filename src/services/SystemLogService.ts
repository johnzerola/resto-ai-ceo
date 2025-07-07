import { supabase } from '@/integrations/supabase/client';

export interface SystemLog {
  id: string;
  user_id?: string;
  source: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metadata?: any;
  timestamp: string;
}

export class SystemLogService {
  static async log(
    source: string,
    type: string,
    message: string,
    severity: SystemLog['severity'] = 'info',
    metadata?: any,
    userId?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('system_logs')
        .insert({
          user_id: userId,
          source,
          type,
          message,
          severity,
          metadata
        });

      if (error) throw error;
      return true;
    } catch (error) {
      // System logging silently fails in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao registrar log do sistema:', error);
      }
      return false;
    }
  }

  static async getLogs(
    limit: number = 100,
    severity?: SystemLog['severity'],
    source?: string
  ): Promise<SystemLog[]> {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (source) {
      query = query.eq('source', source);
    }

    const { data, error } = await query;

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar logs do sistema:', error);
      }
      return [];
    }

    return (data || []).map(log => ({
      ...log,
      severity: log.severity as SystemLog['severity']
    }));
  }

  static async getUserLogs(userId: string, limit: number = 50): Promise<SystemLog[]> {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar logs do usuário:', error);
      }
      return [];
    }

    return (data || []).map(log => ({
      ...log,
      severity: log.severity as SystemLog['severity']
    }));
  }

  static async getErrorLogs(limit: number = 50): Promise<SystemLog[]> {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .in('severity', ['error', 'critical'])
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar logs de erro:', error);  
      }
      return [];
    }

    return (data || []).map(log => ({
      ...log,
      severity: log.severity as SystemLog['severity']
    }));
  }
}
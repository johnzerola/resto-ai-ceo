
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AuditLog {
  id: string;
  restaurant_id: string;
  user_id?: string;
  action: 'create' | 'update' | 'delete';
  table_name: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export class AuditService {
  static async getAuditLogs(restaurantId: string, limit = 100): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar histórico de alterações');
      return [];
    }
  }

  static async performHealthcheck(restaurantId: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('system_healthcheck', {
        restaurant_uuid: restaurantId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro no healthcheck:', error);
      toast.error('Erro na verificação do sistema');
      return null;
    }
  }

  static formatLogAction(log: AuditLog): string {
    const actionMap = {
      create: 'Criado',
      update: 'Atualizado', 
      delete: 'Excluído'
    };

    const tableMap = {
      cash_flow: 'Fluxo de Caixa',
      contas_a_pagar: 'Contas a Pagar',
      contas_a_receber: 'Contas a Receber',
      pratos: 'Pratos',
      insumos: 'Insumos'
    };

    return `${actionMap[log.action] || log.action} em ${tableMap[log.table_name] || log.table_name}`;
  }

  static formatLogDetails(log: AuditLog): string {
    if (log.action === 'delete' && log.old_values) {
      return `Registro excluído: ${JSON.stringify(log.old_values, null, 2)}`;
    }
    
    if (log.action === 'create' && log.new_values) {
      return `Novo registro: ${JSON.stringify(log.new_values, null, 2)}`;
    }
    
    if (log.action === 'update' && log.old_values && log.new_values) {
      return `Alteração de:\n${JSON.stringify(log.old_values, null, 2)}\nPara:\n${JSON.stringify(log.new_values, null, 2)}`;
    }
    
    return 'Detalhes não disponíveis';
  }
}

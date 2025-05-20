
import { supabase, getTableQueryBuilder } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Tipos para pagamentos
export interface Payment {
  id: string;
  restaurant_id: string;
  user_id?: string;
  amount: number;
  payment_method: string;
  description: string;
  due_date: Date | string;
  payment_date?: Date | string;
  status: 'pending' | 'paid' | 'overdue' | 'canceled';
  type: 'payable' | 'receivable';
  category: string;
  created_at?: string;
  metadata?: Record<string, any>;
}

export type PaymentInsert = Omit<Payment, 'id' | 'created_at'>;
export type PaymentUpdate = Partial<Omit<Payment, 'id' | 'created_at'>>;

// Listas de status e tipos para uso em componentes
export const PAYMENT_STATUS = ['pending', 'paid', 'overdue', 'canceled'];
export const PAYMENT_TYPES = ['payable', 'receivable'];
export const PAYMENT_CATEGORIES = [
  'aluguel',
  'fornecedores',
  'salários',
  'impostos',
  'serviços',
  'vendas',
  'outros'
];

/**
 * Serviço para gerenciar contas a pagar e receber
 */
export class PaymentService {
  /**
   * Obter todas as contas (pagar/receber) com filtros opcionais
   */
  async getPayments(
    restaurantId: string,
    filters: {
      type?: 'payable' | 'receivable';
      status?: string;
      startDate?: Date | string;
      endDate?: Date | string;
      category?: string;
    } = {}
  ): Promise<Payment[]> {
    try {
      let query = getTableQueryBuilder('payments')
        .select()
        .eq('restaurant_id', restaurantId);
      
      // Aplicar filtros
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.startDate) {
        query = query.gte('due_date', new Date(filters.startDate).toISOString());
      }
      
      if (filters.endDate) {
        query = query.lte('due_date', new Date(filters.endDate).toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return (data as unknown) as Payment[];
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast.error(`Erro ao carregar dados de pagamentos: ${(error as Error).message}`);
      return [];
    }
  }
  
  /**
   * Criar um novo pagamento
   */
  async createPayment(payment: PaymentInsert): Promise<Payment | null> {
    try {
      const newPayment = {
        ...payment,
        id: uuidv4(),
      };
      
      const { data, error } = await getTableQueryBuilder('payments')
        .insert(newPayment)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success(
        payment.type === 'payable' 
          ? 'Conta a pagar registrada com sucesso' 
          : 'Conta a receber registrada com sucesso'
      );
      
      return ((data && data[0]) as unknown) as Payment;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast.error(`Erro ao registrar ${payment.type === 'payable' ? 'conta a pagar' : 'conta a receber'}: ${(error as Error).message}`);
      return null;
    }
  }
  
  /**
   * Atualizar um pagamento existente
   */
  async updatePayment(id: string, updates: PaymentUpdate): Promise<Payment | null> {
    try {
      const { data, error } = await getTableQueryBuilder('payments')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success('Registro atualizado com sucesso');
      return ((data && data[0]) as unknown) as Payment;
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast.error(`Erro ao atualizar registro: ${(error as Error).message}`);
      return null;
    }
  }
  
  /**
   * Marcar um pagamento como pago
   */
  async markAsPaid(id: string, paymentDate = new Date()): Promise<Payment | null> {
    try {
      const { data, error } = await getTableQueryBuilder('payments')
        .update({
          status: 'paid',
          payment_date: paymentDate instanceof Date ? paymentDate.toISOString() : paymentDate
        })
        .eq('id', id)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success('Pagamento confirmado com sucesso');
      
      // Disparar evento para atualização de dados financeiros
      this.dispatchPaymentEvent();
      
      return ((data && data[0]) as unknown) as Payment;
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error(`Erro ao confirmar pagamento: ${(error as Error).message}`);
      return null;
    }
  }
  
  /**
   * Excluir um pagamento
   */
  async deletePayment(id: string): Promise<boolean> {
    try {
      const { error } = await getTableQueryBuilder('payments')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Registro excluído com sucesso');
      
      // Disparar evento para atualização de dados financeiros
      this.dispatchPaymentEvent();
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      toast.error(`Erro ao excluir registro: ${(error as Error).message}`);
      return false;
    }
  }
  
  /**
   * Verificar contas vencidas e atualizar status
   */
  async checkOverduePayments(restaurantId: string): Promise<number> {
    try {
      // Obter todas as contas pendentes
      const { data, error } = await getTableQueryBuilder('payments')
        .select()
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString());
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        return 0;
      }
      
      // Atualizar status para 'overdue'
      const { error: updateError } = await getTableQueryBuilder('payments')
        .update({ status: 'overdue' })
        .in('id', data.map(item => item.id));
      
      if (updateError) {
        throw updateError;
      }
      
      return data.length;
    } catch (error) {
      console.error('Erro ao verificar contas vencidas:', error);
      return 0;
    }
  }
  
  /**
   * Obter resumo de contas a pagar e receber
   */
  async getPaymentSummary(restaurantId: string): Promise<{
    payables: { pending: number; overdue: number; total: number };
    receivables: { pending: number; overdue: number; total: number };
  }> {
    try {
      const payments = await this.getPayments(restaurantId);
      
      const summary = {
        payables: { pending: 0, overdue: 0, total: 0 },
        receivables: { pending: 0, overdue: 0, total: 0 }
      };
      
      payments.forEach(payment => {
        if (payment.type === 'payable') {
          summary.payables.total += payment.amount;
          if (payment.status === 'pending') {
            summary.payables.pending += payment.amount;
          } else if (payment.status === 'overdue') {
            summary.payables.overdue += payment.amount;
          }
        } else if (payment.type === 'receivable') {
          summary.receivables.total += payment.amount;
          if (payment.status === 'pending') {
            summary.receivables.pending += payment.amount;
          } else if (payment.status === 'overdue') {
            summary.receivables.overdue += payment.amount;
          }
        }
      });
      
      return summary;
    } catch (error) {
      console.error('Erro ao carregar resumo de pagamentos:', error);
      return {
        payables: { pending: 0, overdue: 0, total: 0 },
        receivables: { pending: 0, overdue: 0, total: 0 }
      };
    }
  }
  
  /**
   * Disparar evento de atualização de pagamentos
   */
  dispatchPaymentEvent(): void {
    // Disparar evento para notificar sobre alterações nos pagamentos
    const event = new CustomEvent('paymentDataUpdated', {
      detail: { timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(event);
    
    // Também disparar evento financeiro geral para atualizar DRE e CMV
    const financialEvent = new CustomEvent('financialDataUpdated');
    window.dispatchEvent(financialEvent);
  }
}

// Exportar instância singleton do serviço
export const paymentService = new PaymentService();

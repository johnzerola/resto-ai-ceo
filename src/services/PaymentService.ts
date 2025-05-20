
import { getTableQueryBuilder } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Payment interface
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

// Payment status and types for use in components
export const PAYMENT_STATUS = ['pending', 'paid', 'overdue', 'canceled'] as const;
export const PAYMENT_TYPES = ['payable', 'receivable'] as const;
export const PAYMENT_CATEGORIES = [
  'aluguel',
  'fornecedores',
  'salários',
  'impostos',
  'serviços',
  'vendas',
  'outros'
] as const;

/**
 * Service for managing payments
 */
export class PaymentService {
  /**
   * Get all payments with optional filters
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
        .select();
      
      // Apply restaurant filter
      query = query.eq('restaurant_id', restaurantId);
      
      // Apply filters
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
      
      // Use explicit type assertion to avoid deep type instantiation
      return (data || []) as Payment[];
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error(`Error loading payment data: ${(error as Error).message}`);
      return [];
    }
  }
  
  /**
   * Create a new payment
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
          ? 'Payable account registered successfully' 
          : 'Receivable account registered successfully'
      );
      
      // Use explicit type assertion to avoid deep type instantiation
      return data && data[0] ? (data[0] as Payment) : null;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(`Error registering ${payment.type === 'payable' ? 'payable' : 'receivable'}: ${(error as Error).message}`);
      return null;
    }
  }
  
  /**
   * Update an existing payment
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
      
      toast.success('Record updated successfully');
      // Use explicit type assertion to avoid deep type instantiation
      return data && data[0] ? (data[0] as Payment) : null;
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error(`Error updating record: ${(error as Error).message}`);
      return null;
    }
  }
  
  /**
   * Mark a payment as paid
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
      
      toast.success('Payment confirmed successfully');
      
      // Dispatch event to update financial data
      this.dispatchPaymentEvent();
      
      // Use explicit type assertion to avoid deep type instantiation
      return data && data[0] ? (data[0] as Payment) : null;
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error(`Error confirming payment: ${(error as Error).message}`);
      return null;
    }
  }
  
  /**
   * Delete a payment
   */
  async deletePayment(id: string): Promise<boolean> {
    try {
      const { error } = await getTableQueryBuilder('payments')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Record deleted successfully');
      
      // Dispatch event to update financial data
      this.dispatchPaymentEvent();
      
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error(`Error deleting record: ${(error as Error).message}`);
      return false;
    }
  }
  
  /**
   * Check overdue payments and update their status
   */
  async checkOverduePayments(restaurantId: string): Promise<number> {
    try {
      // Get all pending payments
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
      
      // Update status to 'overdue'
      const ids = data.map((item: any) => item.id);
      const { error: updateError } = await getTableQueryBuilder('payments')
        .update({ status: 'overdue' })
        .in('id', ids);
      
      if (updateError) {
        throw updateError;
      }
      
      return data.length;
    } catch (error) {
      console.error('Error checking overdue payments:', error);
      return 0;
    }
  }
  
  /**
   * Get payment summary
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
      console.error('Error loading payment summary:', error);
      return {
        payables: { pending: 0, overdue: 0, total: 0 },
        receivables: { pending: 0, overdue: 0, total: 0 }
      };
    }
  }
  
  /**
   * Dispatch payment event
   */
  dispatchPaymentEvent(): void {
    // Dispatch event to notify about payment changes
    const event = new CustomEvent('paymentDataUpdated', {
      detail: { timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(event);
    
    // Also dispatch general financial event to update DRE and CMV
    const financialEvent = new CustomEvent('financialDataUpdated');
    window.dispatchEvent(financialEvent);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

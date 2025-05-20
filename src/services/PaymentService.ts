
import { supabase, VALID_TABLES, ExtendedTableName } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/client";

// Payment status types
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

// Payment types
export type PaymentType = 'income' | 'expense';

// Payment method types
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'other';

// Payment category types
export type PaymentCategory = 
  'food' | 'beverage' | 'rent' | 'utilities' | 
  'salary' | 'marketing' | 'equipment' | 'supplies' | 
  'maintenance' | 'taxes' | 'insurance' | 'sales' | 'other';

// Payment interface that follows the Supabase table structure
export interface Payment {
  id?: string;
  restaurant_id: string;
  user_id?: string;
  amount: number;
  due_date: string;
  payment_date?: string | null;
  created_at?: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  description: string;
  type: PaymentType;
  category: PaymentCategory;
  metadata?: any;
}

// Type for payment report
export interface PaymentReport {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pendingIncome: number;
  pendingExpense: number;
  overdueAmount: number;
  byCategory: Record<string, number>;
  byMonth: {
    month: string;
    income: number;
    expense: number;
  }[];
}

// Service for handling payment operations
export const PaymentService = {
  // Create a new payment
  async createPayment(payment: Payment): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Payment created successfully');
      return data as Payment;
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast.error(`Error creating payment: ${error.message}`);
      return null;
    }
  },
  
  // Get all payments for a restaurant
  async getPayments(restaurantId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('due_date', { ascending: false });
      
      if (error) throw error;
      
      return data as Payment[];
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast.error(`Error fetching payments: ${error.message}`);
      return [];
    }
  },
  
  // Get a payment by ID
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();
      
      if (error) throw error;
      
      return data as Payment;
    } catch (error: any) {
      console.error('Error fetching payment:', error);
      return null;
    }
  },
  
  // Update a payment
  async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Payment updated successfully');
      return data as Payment;
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.error(`Error updating payment: ${error.message}`);
      return null;
    }
  },
  
  // Delete a payment
  async deletePayment(paymentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);
      
      if (error) throw error;
      
      toast.success('Payment deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      toast.error(`Error deleting payment: ${error.message}`);
      return false;
    }
  },
  
  // Mark a payment as paid
  async markAsPaid(paymentId: string): Promise<Payment | null> {
    return this.updatePayment(paymentId, {
      status: 'paid',
      payment_date: new Date().toISOString()
    });
  },
  
  // Get payments by status
  async getPaymentsByStatus(restaurantId: string, status: PaymentStatus): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', status);
      
      if (error) throw error;
      
      return data as Payment[];
    } catch (error: any) {
      console.error(`Error fetching ${status} payments:`, error);
      return [];
    }
  },
  
  // Get payments by type
  async getPaymentsByType(restaurantId: string, type: PaymentType): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('type', type);
      
      if (error) throw error;
      
      return data as Payment[];
    } catch (error: any) {
      console.error(`Error fetching ${type} payments:`, error);
      return [];
    }
  },
  
  // Generate a payment report
  async generateReport(restaurantId: string): Promise<PaymentReport> {
    try {
      const payments = await this.getPayments(restaurantId);
      
      // Initialize report structure
      const report: PaymentReport = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        pendingIncome: 0,
        pendingExpense: 0,
        overdueAmount: 0,
        byCategory: {},
        byMonth: []
      };
      
      // Process each payment
      payments.forEach(payment => {
        // Process by payment type
        if (payment.type === 'income') {
          report.totalIncome += payment.amount;
          if (payment.status === 'pending') {
            report.pendingIncome += payment.amount;
          }
        } else if (payment.type === 'expense') {
          report.totalExpense += payment.amount;
          if (payment.status === 'pending') {
            report.pendingExpense += payment.amount;
          }
        }
        
        // Process overdue payments
        if (payment.status === 'overdue') {
          report.overdueAmount += payment.amount;
        }
        
        // Process by category
        const category = payment.category;
        if (!report.byCategory[category]) {
          report.byCategory[category] = 0;
        }
        if (payment.type === 'income') {
          report.byCategory[category] += payment.amount;
        } else {
          report.byCategory[category] -= payment.amount;
        }
        
        // Process by month
        const month = new Date(payment.due_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short'
        });
        
        let monthData = report.byMonth.find(m => m.month === month);
        if (!monthData) {
          monthData = { month, income: 0, expense: 0 };
          report.byMonth.push(monthData);
        }
        
        if (payment.type === 'income') {
          monthData.income += payment.amount;
        } else {
          monthData.expense += payment.amount;
        }
      });
      
      // Calculate balance
      report.balance = report.totalIncome - report.totalExpense;
      
      // Sort months chronologically
      report.byMonth.sort((a, b) => {
        return new Date(a.month).getTime() - new Date(b.month).getTime();
      });
      
      return report;
    } catch (error) {
      console.error('Error generating payment report:', error);
      throw error;
    }
  }
};


import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AccountPayable {
  id: string;
  restaurant_id: string;
  fornecedor: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  categoria: string;
  observacoes?: string;
  documento?: string;
  forma_pagamento?: string;
  notificacao_enviada_1_dia: boolean;
  notificacao_enviada_vencimento: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountReceivable {
  id: string;
  restaurant_id: string;
  cliente?: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_recebimento?: string;
  status: 'pendente' | 'recebido' | 'vencido' | 'cancelado';
  categoria: string;
  observacoes?: string;
  forma_recebimento?: string;
  notificacao_enviada_1_dia: boolean;
  notificacao_enviada_vencimento: boolean;
  created_at: string;
  updated_at: string;
}

export class AccountsService {
  // Contas a Pagar
  static async getAccountsPayable(restaurantId: string): Promise<AccountPayable[]> {
    try {
      const { data, error } = await supabase
        .from('contas_a_pagar')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao carregar contas a pagar:', error);
      toast.error('Erro ao carregar contas a pagar');
      return [];
    }
  }

  static async createAccountPayable(account: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'notificacao_enviada_1_dia' | 'notificacao_enviada_vencimento'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contas_a_pagar')
        .insert([account]);

      if (error) throw error;
      
      toast.success('Conta a pagar criada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao criar conta a pagar:', error);
      toast.error('Erro ao criar conta a pagar');
      return false;
    }
  }

  static async payAccount(id: string, formaPagamento: string): Promise<boolean> {
    try {
      // Buscar a conta primeiro
      const { data: account, error: fetchError } = await supabase
        .from('contas_a_pagar')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !account) throw fetchError || new Error('Conta não encontrada');

      // Atualizar status da conta
      const { error: updateError } = await supabase
        .from('contas_a_pagar')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0],
          forma_pagamento: formaPagamento,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Adicionar entrada no fluxo de caixa
      const { error: cashFlowError } = await supabase
        .from('cash_flow')
        .insert([{
          restaurant_id: account.restaurant_id,
          type: 'expense',
          amount: account.valor,
          date: new Date().toISOString().split('T')[0],
          description: `Pagamento: ${account.descricao}`,
          category: account.categoria,
          payment_method: formaPagamento,
          status: 'completed',
          conta_origem_id: id
        }]);

      if (cashFlowError) throw cashFlowError;
      
      toast.success('Conta paga e registrada no fluxo de caixa');
      return true;
    } catch (error) {
      console.error('Erro ao pagar conta:', error);
      toast.error('Erro ao processar pagamento');
      return false;
    }
  }

  // Contas a Receber
  static async getAccountsReceivable(restaurantId: string): Promise<AccountReceivable[]> {
    try {
      const { data, error } = await supabase
        .from('contas_a_receber')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao carregar contas a receber:', error);
      toast.error('Erro ao carregar contas a receber');
      return [];
    }
  }

  static async createAccountReceivable(account: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at' | 'notificacao_enviada_1_dia' | 'notificacao_enviada_vencimento'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contas_a_receber')
        .insert([account]);

      if (error) throw error;
      
      toast.success('Conta a receber criada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao criar conta a receber:', error);
      toast.error('Erro ao criar conta a receber');
      return false;
    }
  }

  static async receiveAccount(id: string, formaRecebimento: string): Promise<boolean> {
    try {
      // Buscar a conta primeiro
      const { data: account, error: fetchError } = await supabase
        .from('contas_a_receber')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !account) throw fetchError || new Error('Conta não encontrada');

      // Atualizar status da conta
      const { error: updateError } = await supabase
        .from('contas_a_receber')
        .update({
          status: 'recebido',
          data_recebimento: new Date().toISOString().split('T')[0],
          forma_recebimento: formaRecebimento,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Adicionar entrada no fluxo de caixa
      const { error: cashFlowError } = await supabase
        .from('cash_flow')
        .insert([{
          restaurant_id: account.restaurant_id,
          type: 'income',
          amount: account.valor,
          date: new Date().toISOString().split('T')[0],
          description: `Recebimento: ${account.descricao}`,
          category: account.categoria,
          payment_method: formaRecebimento,
          status: 'completed',
          conta_origem_id: id
        }]);

      if (cashFlowError) throw cashFlowError;
      
      toast.success('Valor recebido e registrado no fluxo de caixa');
      return true;
    } catch (error) {
      console.error('Erro ao receber conta:', error);
      toast.error('Erro ao processar recebimento');
      return false;
    }
  }

  // Função para verificar contas vencidas
  static async checkOverdueAccounts(restaurantId: string): Promise<{payable: number, receivable: number}> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [payableResponse, receivableResponse] = await Promise.all([
        supabase
          .from('contas_a_pagar')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .eq('status', 'pendente')
          .lt('data_vencimento', today),
        
        supabase
          .from('contas_a_receber')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .eq('status', 'pendente')
          .lt('data_vencimento', today)
      ]);

      return {
        payable: payableResponse.data?.length || 0,
        receivable: receivableResponse.data?.length || 0
      };
    } catch (error) {
      console.error('Erro ao verificar contas vencidas:', error);
      return { payable: 0, receivable: 0 };
    }
  }
}

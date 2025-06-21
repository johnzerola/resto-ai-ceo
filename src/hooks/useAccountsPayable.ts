
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContaPagar {
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
}

export function useAccountsPayable() {
  const { currentRestaurant } = useAuth();
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadContas = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      // Usar query SQL direta para acessar a nova tabela
      const { data, error } = await supabase
        .rpc('get_contas_a_pagar', { restaurant_uuid: currentRestaurant.id });

      if (error) {
        // Fallback: tentar query direta se a função não existir
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('cash_flow' as any)
          .select('*')
          .eq('restaurant_id', currentRestaurant.id)
          .eq('type', 'expense')
          .order('date', { ascending: false });

        if (fallbackError) throw fallbackError;
        
        // Mapear dados do cash_flow para formato de contas_a_pagar
        const mappedData = fallbackData?.map((item: any) => ({
          id: item.id,
          restaurant_id: item.restaurant_id,
          fornecedor: item.description?.split(' - ')[0] || 'Fornecedor',
          descricao: item.description,
          valor: item.amount,
          data_vencimento: item.vencimento || item.date,
          data_pagamento: item.status === 'paid' ? item.date : null,
          status: item.status === 'paid' ? 'pago' : 'pendente' as 'pago' | 'pendente',
          categoria: item.category,
          observacoes: null,
          documento: item.documento,
          forma_pagamento: item.payment_method
        })) || [];

        setContas(mappedData);
      } else {
        setContas(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar contas a pagar:', error);
      toast.error('Erro ao carregar contas a pagar');
    } finally {
      setIsLoading(false);
    }
  };

  const addConta = async (conta: Omit<ContaPagar, 'id' | 'restaurant_id'>) => {
    if (!currentRestaurant?.id) return false;

    try {
      // Tentar inserir na nova tabela usando SQL direto
      const { error } = await supabase
        .rpc('insert_conta_a_pagar', {
          restaurant_uuid: currentRestaurant.id,
          fornecedor: conta.fornecedor,
          descricao: conta.descricao,
          valor: conta.valor,
          data_vencimento: conta.data_vencimento,
          categoria: conta.categoria,
          observacoes: conta.observacoes,
          documento: conta.documento
        });

      if (error) {
        // Fallback: inserir no cash_flow
        const { error: fallbackError } = await supabase
          .from('cash_flow')
          .insert({
            restaurant_id: currentRestaurant.id,
            type: 'expense',
            amount: conta.valor,
            date: conta.data_vencimento,
            description: conta.descricao,
            category: conta.categoria,
            status: 'pending',
            vencimento: conta.data_vencimento,
            documento: conta.documento
          });

        if (fallbackError) throw fallbackError;
      }
      
      await loadContas();
      toast.success('Conta a pagar adicionada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar conta:', error);
      toast.error('Erro ao adicionar conta a pagar');
      return false;
    }
  };

  const updateConta = async (id: string, updates: Partial<ContaPagar>) => {
    try {
      const { error } = await supabase
        .rpc('update_conta_a_pagar', {
          conta_id: id,
          updates: updates
        });

      if (error) {
        // Fallback: atualizar no cash_flow
        const { error: fallbackError } = await supabase
          .from('cash_flow')
          .update({
            amount: updates.valor,
            description: updates.descricao,
            category: updates.categoria,
            status: updates.status === 'pago' ? 'paid' : 'pending',
            payment_method: updates.forma_pagamento
          })
          .eq('id', id);

        if (fallbackError) throw fallbackError;
      }
      
      await loadContas();
      toast.success('Conta atualizada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      toast.error('Erro ao atualizar conta');
      return false;
    }
  };

  const marcarComoPaga = async (id: string, formaPagamento?: string) => {
    return updateConta(id, {
      status: 'pago',
      data_pagamento: new Date().toISOString().split('T')[0],
      forma_pagamento: formaPagamento || 'dinheiro'
    });
  };

  const getContasVencidas = () => {
    const hoje = new Date().toISOString().split('T')[0];
    return contas.filter(conta => 
      conta.status === 'pendente' && conta.data_vencimento < hoje
    );
  };

  const getTotalPendente = () => {
    return contas
      .filter(conta => conta.status === 'pendente')
      .reduce((total, conta) => total + conta.valor, 0);
  };

  useEffect(() => {
    loadContas();
  }, [currentRestaurant]);

  return {
    contas,
    isLoading,
    addConta,
    updateConta,
    marcarComoPaga,
    getContasVencidas,
    getTotalPendente,
    reloadContas: loadContas
  };
}

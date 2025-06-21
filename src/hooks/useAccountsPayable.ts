
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
      const { data, error } = await supabase
        .from('contas_a_pagar')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      setContas(data || []);
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
      const { error } = await supabase
        .from('contas_a_pagar')
        .insert({
          ...conta,
          restaurant_id: currentRestaurant.id
        });

      if (error) throw error;
      
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
        .from('contas_a_pagar')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
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

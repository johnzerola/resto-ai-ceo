
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContaReceber {
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
}

export function useAccountsReceivable() {
  const { currentRestaurant } = useAuth();
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadContas = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contas_a_receber')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      setContas(data || []);
    } catch (error) {
      console.error('Erro ao carregar contas a receber:', error);
      toast.error('Erro ao carregar contas a receber');
    } finally {
      setIsLoading(false);
    }
  };

  const addConta = async (conta: Omit<ContaReceber, 'id' | 'restaurant_id'>) => {
    if (!currentRestaurant?.id) return false;

    try {
      const { error } = await supabase
        .from('contas_a_receber')
        .insert({
          ...conta,
          restaurant_id: currentRestaurant.id
        });

      if (error) throw error;
      
      await loadContas();
      toast.success('Conta a receber adicionada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar conta:', error);
      toast.error('Erro ao adicionar conta a receber');
      return false;
    }
  };

  const marcarComoRecebida = async (id: string, formaRecebimento?: string) => {
    try {
      const { error } = await supabase
        .from('contas_a_receber')
        .update({
          status: 'recebido',
          data_recebimento: new Date().toISOString().split('T')[0],
          forma_recebimento: formaRecebimento || 'dinheiro'
        })
        .eq('id', id);

      if (error) throw error;
      
      await loadContas();
      toast.success('Conta marcada como recebida');
      return true;
    } catch (error) {
      console.error('Erro ao marcar conta como recebida:', error);
      toast.error('Erro ao atualizar conta');
      return false;
    }
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
    marcarComoRecebida,
    getTotalPendente,
    reloadContas: loadContas
  };
}

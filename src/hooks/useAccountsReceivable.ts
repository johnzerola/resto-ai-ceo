
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
      // Usar cash_flow como fonte principal
      const { data: cashFlowData, error } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .eq('type', 'income')
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Mapear dados do cash_flow para formato de contas_a_receber
      const mappedData: ContaReceber[] = cashFlowData?.map((item: any) => ({
        id: item.id,
        restaurant_id: item.restaurant_id,
        cliente: item.description?.split(' - ')[1] || 'Cliente',
        descricao: item.description,
        valor: item.amount,
        data_vencimento: item.vencimento || item.date,
        data_recebimento: item.status === 'paid' ? item.date : undefined,
        status: item.status === 'paid' ? 'recebido' : 'pendente' as 'recebido' | 'pendente',
        categoria: item.category,
        observacoes: item.documento,
        forma_recebimento: item.payment_method
      })) || [];

      setContas(mappedData);
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
      // Inserir no cash_flow
      const { error } = await supabase
        .from('cash_flow')
        .insert({
          restaurant_id: currentRestaurant.id,
          type: 'income',
          amount: conta.valor,
          date: conta.data_vencimento,
          description: conta.descricao,
          category: conta.categoria,
          status: 'pending',
          vencimento: conta.data_vencimento
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
      // Atualizar no cash_flow
      const { error } = await supabase
        .from('cash_flow')
        .update({
          status: 'paid',
          payment_method: formaRecebimento || 'dinheiro'
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

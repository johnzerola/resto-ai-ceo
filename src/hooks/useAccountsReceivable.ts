
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
      // Usar query SQL direta para acessar a nova tabela
      const { data, error } = await supabase
        .rpc('get_contas_a_receber', { restaurant_uuid: currentRestaurant.id });

      if (error) {
        // Fallback: tentar query usando cash_flow
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('cash_flow' as any)
          .select('*')
          .eq('restaurant_id', currentRestaurant.id)
          .eq('type', 'income')
          .order('date', { ascending: false });

        if (fallbackError) throw fallbackError;
        
        // Mapear dados do cash_flow para formato de contas_a_receber
        const mappedData = fallbackData?.map((item: any) => ({
          id: item.id,
          restaurant_id: item.restaurant_id,
          cliente: item.description?.split(' - ')[1] || 'Cliente',
          descricao: item.description,
          valor: item.amount,
          data_vencimento: item.vencimento || item.date,
          data_recebimento: item.status === 'paid' ? item.date : null,
          status: item.status === 'paid' ? 'recebido' : 'pendente' as 'recebido' | 'pendente',
          categoria: item.category,
          observacoes: null,
          forma_recebimento: item.payment_method
        })) || [];

        setContas(mappedData);
      } else {
        setContas(data || []);
      }
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
      // Tentar inserir na nova tabela usando SQL direto
      const { error } = await supabase
        .rpc('insert_conta_a_receber', {
          restaurant_uuid: currentRestaurant.id,
          cliente: conta.cliente,
          descricao: conta.descricao,
          valor: conta.valor,
          data_vencimento: conta.data_vencimento,
          categoria: conta.categoria,
          observacoes: conta.observacoes
        });

      if (error) {
        // Fallback: inserir no cash_flow
        const { error: fallbackError } = await supabase
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

        if (fallbackError) throw fallbackError;
      }
      
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
        .rpc('update_conta_a_receber', {
          conta_id: id,
          updates: {
            status: 'recebido',
            data_recebimento: new Date().toISOString().split('T')[0],
            forma_recebimento: formaRecebimento || 'dinheiro'
          }
        });

      if (error) {
        // Fallback: atualizar no cash_flow
        const { error: fallbackError } = await supabase
          .from('cash_flow')
          .update({
            status: 'paid',
            payment_method: formaRecebimento || 'dinheiro'
          })
          .eq('id', id);

        if (fallbackError) throw fallbackError;
      }
      
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


import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class AutoCalculationService {
  /**
   * Recalcula automaticamente os dados financeiros baseados nos dados reais existentes
   */
  static async recalculateFinancialData(restaurantId: string) {
    try {
      console.log('🔄 [AutoCalculation] Recalculando dados financeiros para:', restaurantId);

      // Buscar todas as transações reais do cash flow
      const { data: cashFlowData } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (!cashFlowData || cashFlowData.length === 0) {
        console.log('ℹ️ [AutoCalculation] Nenhuma transação encontrada');
        return;
      }

      // Calcular totais baseados em dados reais
      const totalReceitas = cashFlowData
        .filter(item => item.type === 'receita')
        .reduce((sum, item) => sum + Number(item.amount), 0);

      const totalDespesas = cashFlowData
        .filter(item => item.type === 'despesa')
        .reduce((sum, item) => sum + Number(item.amount), 0);

      // Atualizar configurações do restaurante com valores calculados
      await supabase
        .from('configuracoes_restaurante')
        .upsert({
          restaurant_id: restaurantId,
          receita_mensal_esperada: totalReceitas,
          despesas_fixas_mensais: totalDespesas * 0.7, // Estimativa de 70% como despesas fixas
          despesas_variaveis_mensais: totalDespesas * 0.3, // Estimativa de 30% como despesas variáveis
          updated_at: new Date().toISOString()
        });

      console.log('✅ [AutoCalculation] Dados financeiros recalculados');
      return { totalReceitas, totalDespesas };
    } catch (error) {
      console.error('❌ [AutoCalculation] Erro ao recalcular dados financeiros:', error);
      throw error;
    }
  }

  /**
   * Recalcula custos de pratos baseados nos ingredientes reais
   */
  static async recalculateRecipeCosts(restaurantId: string) {
    try {
      console.log('🔄 [AutoCalculation] Recalculando custos de pratos para:', restaurantId);

      // Buscar todos os pratos do restaurante
      const { data: pratos } = await supabase
        .from('pratos')
        .select('id, nome_prato')
        .eq('restaurant_id', restaurantId);

      if (!pratos || pratos.length === 0) {
        console.log('ℹ️ [AutoCalculation] Nenhum prato encontrado');
        return;
      }

      // Recalcular cada prato usando a função existente do banco
      for (const prato of pratos) {
        try {
          await supabase.rpc('calcular_cmv_inteligente', { 
            prato_uuid: prato.id 
          });
          console.log(`✅ [AutoCalculation] Prato "${prato.nome_prato}" recalculado`);
        } catch (error) {
          console.error(`❌ [AutoCalculation] Erro ao recalcular prato ${prato.nome_prato}:`, error);
        }
      }

      console.log('✅ [AutoCalculation] Todos os pratos recalculados');
    } catch (error) {
      console.error('❌ [AutoCalculation] Erro ao recalcular custos de pratos:', error);
      throw error;
    }
  }

  /**
   * Atualiza progresso das metas baseado nos dados reais
   */
  static async updateGoalsProgress(restaurantId: string) {
    try {
      console.log('🔄 [AutoCalculation] Atualizando progresso das metas para:', restaurantId);

      // Buscar metas existentes
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (!goals || goals.length === 0) {
        console.log('ℹ️ [AutoCalculation] Nenhuma meta encontrada');
        return;
      }

      // Buscar dados reais para calcular progresso
      const { data: cashFlowData } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', restaurantId);

      const totalReceitas = cashFlowData
        ?.filter(item => item.type === 'receita')
        .reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      // Atualizar progresso das metas baseado nos dados reais
      for (const goal of goals) {
        let current = 0;

        if (goal.category === 'vendas' || goal.category === 'receita') {
          current = totalReceitas;
        }

        const completed = current >= goal.target;

        await supabase
          .from('goals')
          .update({
            current,
            completed,
            updated_at: new Date().toISOString()
          })
          .eq('id', goal.id);

        console.log(`✅ [AutoCalculation] Meta "${goal.title}" atualizada: ${current}/${goal.target}`);
      }

      console.log('✅ [AutoCalculation] Progresso das metas atualizado');
    } catch (error) {
      console.error('❌ [AutoCalculation] Erro ao atualizar progresso das metas:', error);
      throw error;
    }
  }

  /**
   * Executa todos os cálculos automáticos
   */
  static async recalculateAllData(restaurantId: string, userId: string) {
    try {
      console.log('🚀 [AutoCalculation] Iniciando recálculo completo dos dados');
      
      await Promise.all([
        this.recalculateFinancialData(restaurantId),
        this.recalculateRecipeCosts(restaurantId),
        this.updateGoalsProgress(restaurantId)
      ]);

      console.log('✅ [AutoCalculation] Recálculo completo finalizado');
      toast.success('Dados recalculados com base nos dados reais existentes!');
    } catch (error) {
      console.error('❌ [AutoCalculation] Erro no recálculo completo:', error);
      toast.error('Erro ao recalcular dados');
      throw error;
    }
  }
}

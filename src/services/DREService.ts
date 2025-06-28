
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DREMensal {
  id?: string;
  restaurant_id: string;
  mes: number;
  ano: number;
  receita_bruta: number;
  deducoes_vendas: number;
  receita_liquida: number;
  cmv_total: number;
  cmv_alimentos: number;
  cmv_bebidas: number;
  lucro_bruto: number;
  despesas_pessoal: number;
  despesas_aluguel: number;
  despesas_marketing: number;
  despesas_delivery: number;
  despesas_administrativas: number;
  despesas_outras: number;
  ebitda: number;
  resultado_liquido: number;
  margem_bruta_percentual: number;
  margem_liquida_percentual: number;
  created_at?: string;
  updated_at?: string;
}

export class DREService {
  static async getDREMensal(restaurantId: string, mes: number, ano: number): Promise<DREMensal | null> {
    try {
      const { data, error } = await supabase
        .from('dre_mensal')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('mes', mes)
        .eq('ano', ano)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar DRE:', error);
      return null;
    }
  }

  static async calcularDREAutomatico(restaurantId: string, mes: number, ano: number): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('calcular_dre_mensal', {
        restaurant_uuid: restaurantId,
        mes_param: mes,
        ano_param: ano
      });

      if (error) throw error;

      toast.success('DRE calculado automaticamente');
      return true;
    } catch (error) {
      console.error('Erro ao calcular DRE:', error);
      toast.error('Erro ao calcular DRE');
      return false;
    }
  }

  static async getDREComparativo(restaurantId: string, meses: number = 6): Promise<DREMensal[]> {
    try {
      const { data, error } = await supabase
        .from('dre_mensal')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .limit(meses);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar DRE comparativo:', error);
      return [];
    }
  }

  // Análise de tendências (Harvard Business School)
  static analisarTendencias(dres: DREMensal[]): {
    tendencia_receita: 'crescimento' | 'declinio' | 'estavel';
    tendencia_margem: 'melhorando' | 'piorando' | 'estavel';
    alertas: string[];
    recomendacoes: string[];
  } {
    if (dres.length < 2) {
      return {
        tendencia_receita: 'estavel',
        tendencia_margem: 'estavel',
        alertas: ['Dados insuficientes para análise de tendência'],
        recomendacoes: ['Registre dados por pelo menos 2 meses para análises precisas']
      };
    }

    const dreAtual = dres[0];
    const dreAnterior = dres[1];
    const alertas: string[] = [];
    const recomendacoes: string[] = [];

    // Análise de receita
    const crescimentoReceita = ((dreAtual.receita_liquida - dreAnterior.receita_liquida) / dreAnterior.receita_liquida) * 100;
    const tendencia_receita = crescimentoReceita > 5 ? 'crescimento' : crescimentoReceita < -5 ? 'declinio' : 'estavel';

    // Análise de margem
    const mudancaMargem = dreAtual.margem_liquida_percentual - dreAnterior.margem_liquida_percentual;
    const tendencia_margem = mudancaMargem > 2 ? 'melhorando' : mudancaMargem < -2 ? 'piorando' : 'estavel';

    // Alertas críticos
    if (dreAtual.margem_liquida_percentual < 5) {
      alertas.push('🚨 CRÍTICO: Margem líquida abaixo de 5%');
      recomendacoes.push('Revise imediatamente preços e custos - negócio pode estar inviável');
    }

    if (dreAtual.cmv_total / dreAtual.receita_liquida > 0.35) {
      alertas.push('⚠️ CMV muito alto (>35%)');
      recomendacoes.push('Otimize fornecedores e reduza desperdícios para melhorar CMV');
    }

    if (tendencia_receita === 'declinio') {
      alertas.push('📉 Receita em declínio');
      recomendacoes.push('Invista em marketing e revise estratégia de vendas');
    }

    // Benchmarks da indústria
    if (dreAtual.margem_bruta_percentual < 60) {
      recomendacoes.push('Margem bruta pode ser melhorada - benchmark da indústria: 60-70%');
    }

    return {
      tendencia_receita,
      tendencia_margem,
      alertas,
      recomendacoes
    };
  }
}

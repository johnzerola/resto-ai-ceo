
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface KPIDiario {
  id?: string;
  restaurant_id: string;
  data: string;
  receita_total: number;
  quantidade_pratos_vendidos: number;
  ticket_medio: number;
  cmv_dia: number;
  cmv_percentual: number;
  despesas_dia: number;
  lucro_dia: number;
  margem_dia: number;
  receita_delivery: number;
  taxa_delivery_paga: number;
  meta_receita: number;
  percentual_meta_atingido: number;
  created_at?: string;
  updated_at?: string;
}

export class KPIService {
  static async getKPIDiario(restaurantId: string, data: string): Promise<KPIDiario | null> {
    try {
      const { data: kpi, error } = await supabase
        .from('kpis_diarios')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('data', data)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return kpi;
    } catch (error) {
      console.error('Erro ao buscar KPI:', error);
      return null;
    }
  }

  static async salvarKPIDiario(kpi: Omit<KPIDiario, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      // Calcular métricas automaticamente
      const kpiCalculado = {
        ...kpi,
        ticket_medio: kpi.quantidade_pratos_vendidos > 0 ? kpi.receita_total / kpi.quantidade_pratos_vendidos : 0,
        cmv_percentual: kpi.receita_total > 0 ? (kpi.cmv_dia / kpi.receita_total) * 100 : 0,
        lucro_dia: kpi.receita_total - kpi.cmv_dia - kpi.despesas_dia,
        margem_dia: kpi.receita_total > 0 ? ((kpi.receita_total - kpi.cmv_dia - kpi.despesas_dia) / kpi.receita_total) * 100 : 0,
        percentual_meta_atingido: kpi.meta_receita > 0 ? (kpi.receita_total / kpi.meta_receita) * 100 : 0
      };

      const { error } = await supabase
        .from('kpis_diarios')
        .upsert([kpiCalculado], { 
          onConflict: 'restaurant_id,data',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Erro ao salvar KPI:', error);
      toast.error('Erro ao salvar KPI do dia');
      return false;
    }
  }

  static async getKPIsPeriodo(restaurantId: string, diasAtras: number = 30): Promise<KPIDiario[]> {
    try {
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - diasAtras);

      const { data, error } = await supabase
        .from('kpis_diarios')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .gte('data', dataInicio.toISOString().split('T')[0])
        .order('data', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar KPIs do período:', error);
      return [];
    }
  }

  // Análise de performance (Oxford Business School)
  static analisarPerformance(kpis: KPIDiario[]): {
    media_ticket: number;
    crescimento_receita: number;
    eficiencia_operacional: number;
    status_negocio: 'excelente' | 'bom' | 'atencao' | 'critico';
    insights: string[];
    acoes_recomendadas: string[];
  } {
    if (kpis.length === 0) {
      return {
        media_ticket: 0,
        crescimento_receita: 0,
        eficiencia_operacional: 0,
        status_negocio: 'critico',
        insights: ['Sem dados para análise'],
        acoes_recomendadas: ['Registre vendas diárias para análises precisas']
      };
    }

    const mediaTicket = kpis.reduce((acc, kpi) => acc + kpi.ticket_medio, 0) / kpis.length;
    const mediaReceita = kpis.reduce((acc, kpi) => acc + kpi.receita_total, 0) / kpis.length;
    const mediaMargem = kpis.reduce((acc, kpi) => acc + kpi.margem_dia, 0) / kpis.length;

    // Calcular crescimento (últimos 7 dias vs 7 dias anteriores)
    let crescimentoReceita = 0;
    if (kpis.length >= 14) {
      const ultimosSete = kpis.slice(0, 7).reduce((acc, kpi) => acc + kpi.receita_total, 0);
      const seteDiasAnteriores = kpis.slice(7, 14).reduce((acc, kpi) => acc + kpi.receita_total, 0);
      if (seteDiasAnteriores > 0) {
        crescimentoReceita = ((ultimosSete - seteDiasAnteriores) / seteDiasAnteriores) * 100;
      }
    }

    // Eficiência operacional (margem média)
    const eficienciaOperacional = mediaMargem;

    // Determinar status do negócio
    let status_negocio: 'excelente' | 'bom' | 'atencao' | 'critico';
    if (mediaMargem > 20 && crescimentoReceita > 5) {
      status_negocio = 'excelente';
    } else if (mediaMargem > 15 && crescimentoReceita > 0) {
      status_negocio = 'bom';
    } else if (mediaMargem > 5) {
      status_negocio = 'atencao';
    } else {
      status_negocio = 'critico';
    }

    // Insights específicos
    const insights: string[] = [];
    const acoes_recomendadas: string[] = [];

    if (mediaTicket < 25) {
      insights.push('Ticket médio baixo (R$ ' + mediaTicket.toFixed(2) + ')');
      acoes_recomendadas.push('Implemente estratégias de upselling para aumentar ticket médio');
    }

    if (mediaMargem < 10) {
      insights.push('Margem de lucro preocupante (' + mediaMargem.toFixed(1) + '%)');
      acoes_recomendadas.push('URGENTE: Revise custos e preços - negócio pode estar inviável');
    }

    if (crescimentoReceita < 0) {
      insights.push('Receita em declínio (' + crescimentoReceita.toFixed(1) + '%)');
      acoes_recomendadas.push('Invista em marketing e promoções para recuperar vendas');
    }

    // Benchmarks da indústria
    const percentualMetasAtingidas = kpis.filter(kpi => kpi.percentual_meta_atingido >= 100).length / kpis.length * 100;
    if (percentualMetasAtingidas < 70) {
      insights.push('Metas sendo atingidas em apenas ' + percentualMetasAtingidas.toFixed(0) + '% dos dias');
      acoes_recomendadas.push('Revisar metas ou intensificar esforços de vendas');
    }

    return {
      media_ticket: mediaTicket,
      crescimento_receita: crescimentoReceita,
      eficiencia_operacional: eficienciaOperacional,
      status_negocio,
      insights,
      acoes_recomendadas
    };
  }
}

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AlertaSistema {
  id?: string;
  restaurant_id: string;
  tipo_alerta: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  titulo: string;
  mensagem: string;
  dados_contexto?: any;
  resolvido: boolean;
  data_criacao?: string;
  data_resolucao?: string;
  created_at?: string;
}

export class AlertaService {
  static async getAlertasAtivos(restaurantId: string): Promise<AlertaSistema[]> {
    try {
      const { data, error } = await supabase
        .from('alertas_sistema')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('resolvido', false)
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        prioridade: item.prioridade as 'baixa' | 'media' | 'alta' | 'critica'
      }));
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return [];
    }
  }

  static async criarAlerta(alerta: Omit<AlertaSistema, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('alertas_sistema')
        .insert([alerta]);

      if (error) throw error;

      if (alerta.prioridade === 'critica') {
        toast.error(alerta.titulo + ': ' + alerta.mensagem);
      } else if (alerta.prioridade === 'alta') {
        toast.warning(alerta.titulo);
      }

      return true;
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      return false;
    }
  }

  static async resolverAlerta(alertaId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('alertas_sistema')
        .update({ 
          resolvido: true, 
          data_resolucao: new Date().toISOString() 
        })
        .eq('id', alertaId);

      if (error) throw error;

      toast.success('Alerta resolvido');
      return true;
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
      return false;
    }
  }

  static async gerarAlertasAutomaticos(restaurantId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('gerar_alertas_automaticos', {
        restaurant_uuid: restaurantId
      });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Erro ao gerar alertas automáticos:', error);
      return false;
    }
  }

  static async analisarRiscosProativos(restaurantId: string): Promise<{
    riscos_identificados: string[];
    probabilidade_problemas: number;
    acoes_preventivas: string[];
  }> {
    try {
      const { data: kpis } = await supabase
        .from('kpis_diarios')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('data', { ascending: false })
        .limit(30);

      const { data: dres } = await supabase
        .from('dre_mensal')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .limit(3);

      const riscos_identificados: string[] = [];
      const acoes_preventivas: string[] = [];
      let probabilidade_problemas = 0;

      if (kpis && kpis.length >= 7) {
        const ultimaSemana = kpis.slice(0, 7);
        const margemMedia = ultimaSemana.reduce((acc, kpi) => acc + kpi.margem_dia, 0) / 7;
        
        if (margemMedia < 15) {
          riscos_identificados.push('Margem de lucro em declínio consistente');
          acoes_preventivas.push('Revisar estrutura de custos urgentemente');
          probabilidade_problemas += 30;
        }

        const receitaDeclinante = ultimaSemana.every((kpi, index) => 
          index === 0 || kpi.receita_total <= ultimaSemana[index - 1].receita_total
        );

        if (receitaDeclinante) {
          riscos_identificados.push('Receita em queda livre por 7 dias consecutivos');
          acoes_preventivas.push('Implementar promoções e campanha de marketing imediata');
          probabilidade_problemas += 40;
        }
      }

      if (dres && dres.length >= 2) {
        const dreAtual = dres[0];
        const dreAnterior = dres[1];

        if (dreAtual.margem_liquida_percentual < dreAnterior.margem_liquida_percentual - 5) {
          riscos_identificados.push('Deterioração significativa da margem líquida');
          acoes_preventivas.push('Auditoria completa de custos e renegociação com fornecedores');
          probabilidade_problemas += 25;
        }
      }

      probabilidade_problemas = Math.min(probabilidade_problemas, 100);

      return {
        riscos_identificados,
        probabilidade_problemas,
        acoes_preventivas
      };

    } catch (error) {
      console.error('Erro na análise preditiva:', error);
      return {
        riscos_identificados: ['Erro na análise preditiva'],
        probabilidade_problemas: 0,
        acoes_preventivas: ['Verificar dados e tentar novamente']
      };
    }
  }
}


import { useMemo } from 'react';

interface Ingrediente {
  quantidade_liquida: number;
  preco_unitario: number;
  custo_total: number;
}

interface ConfiguracoesCalculo {
  markup_padrao: number;
  despesa_fixa_mensal: number;
  total_pratos_vendidos_mensal: number;
}

interface CalculosResult {
  custo_ingredientes: number;
  custo_total: number;
  custo_por_porcao: number;
  preco_sugerido: number;
  lucro_estimado: number;
  margem_percentual: number;
  status_viabilidade: 'prejuizo' | 'margem_baixa' | 'saudavel';
}

export function useMemoizedCalculations(
  ingredientes: Ingrediente[],
  rendimento: number,
  margemSeguranca: number,
  configuracoes: ConfiguracoesCalculo
): CalculosResult {
  return useMemo(() => {
    // Custo dos ingredientes
    const custo_ingredientes = ingredientes.reduce((total, ing) => total + ing.custo_total, 0);
    
    // Aplicar margem de segurança
    const custo_com_margem = custo_ingredientes * (1 + margemSeguranca / 100);
    
    // Despesas fixas rateadas
    const despesa_fixa_por_prato = configuracoes.despesa_fixa_mensal / configuracoes.total_pratos_vendidos_mensal;
    
    // Custo total antes do markup
    const custo_total = custo_com_margem + despesa_fixa_por_prato;
    
    // Custo por porção
    const custo_por_porcao = custo_total / rendimento;
    
    // Preço sugerido com markup
    const preco_sugerido = custo_por_porcao * (configuracoes.markup_padrao / 100);
    
    // Lucro estimado
    const lucro_estimado = preco_sugerido - custo_por_porcao;
    
    // Margem percentual
    const margem_percentual = preco_sugerido > 0 ? (lucro_estimado / preco_sugerido) * 100 : 0;
    
    // Status de viabilidade
    let status_viabilidade: 'prejuizo' | 'margem_baixa' | 'saudavel' = 'saudavel';
    if (lucro_estimado < 0) {
      status_viabilidade = 'prejuizo';
    } else if (margem_percentual < 20) {
      status_viabilidade = 'margem_baixa';
    }

    return {
      custo_ingredientes,
      custo_total,
      custo_por_porcao,
      preco_sugerido,
      lucro_estimado,
      margem_percentual,
      status_viabilidade
    };
  }, [ingredientes, rendimento, margemSeguranca, configuracoes]);
}

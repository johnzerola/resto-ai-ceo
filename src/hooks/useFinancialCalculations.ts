
import { useMemo } from 'react';

export interface FinancialConfig {
  markup_padrao: number;
  despesa_fixa_mensal: number;
  total_pratos_vendidos_mensal: number;
  margem_seguranca: number;
  imposto_percentual: number;
  despesa_variavel_percentual: number;
}

export interface IngredienteCost {
  quantidade_liquida: number;
  preco_unitario: number;
  custo_total: number;
}

export interface CalculationResult {
  custo_ingredientes: number;
  custo_total_com_margem: number;
  custo_por_porcao: number;
  despesa_fixa_por_prato: number;
  despesa_variavel: number;
  custo_total_final: number;
  preco_sugerido: number;
  lucro_bruto: number;
  lucro_liquido: number;
  margem_bruta: number;
  margem_liquida: number;
  status_viabilidade: 'saudavel' | 'margem_baixa' | 'prejuizo';
  break_even_quantity: number;
}

export function useFinancialCalculations(
  ingredientes: IngredienteCost[],
  rendimento: number,
  config: FinancialConfig
): CalculationResult {
  return useMemo(() => {
    // 1. Custo dos ingredientes
    const custo_ingredientes = ingredientes.reduce(
      (total, ing) => total + ing.custo_total, 
      0
    );

    // 2. Aplicar margem de segurança
    const custo_total_com_margem = custo_ingredientes * (1 + config.margem_seguranca / 100);

    // 3. Custo por porção
    const custo_por_porcao = custo_total_com_margem / Math.max(rendimento, 1);

    // 4. Despesa fixa por prato
    const despesa_fixa_por_prato = config.despesa_fixa_mensal / 
      Math.max(config.total_pratos_vendidos_mensal, 1);

    // 5. Despesa variável (sobre o custo dos ingredientes)
    const despesa_variavel = custo_por_porcao * (config.despesa_variavel_percentual / 100);

    // 6. Custo total final (ingredientes + despesas)
    const custo_total_final = custo_por_porcao + despesa_fixa_por_prato + despesa_variavel;

    // 7. Preço sugerido com markup
    const preco_base = custo_total_final * (config.markup_padrao / 100);
    
    // 8. Aplicar impostos
    const preco_sugerido = preco_base / (1 - config.imposto_percentual / 100);

    // 9. Cálculos de lucro
    const lucro_bruto = preco_sugerido - custo_por_porcao;
    const lucro_liquido = preco_sugerido - custo_total_final;

    // 10. Margens percentuais
    const margem_bruta = preco_sugerido > 0 ? (lucro_bruto / preco_sugerido) * 100 : 0;
    const margem_liquida = preco_sugerido > 0 ? (lucro_liquido / preco_sugerido) * 100 : 0;

    // 11. Status de viabilidade
    let status_viabilidade: CalculationResult['status_viabilidade'];
    if (lucro_liquido < 0) {
      status_viabilidade = 'prejuizo';
    } else if (margem_liquida < 20) {
      status_viabilidade = 'margem_baixa';
    } else {
      status_viabilidade = 'saudavel';
    }

    // 12. Ponto de equilíbrio (quantos pratos precisa vender para cobrir custos fixos)
    const break_even_quantity = lucro_liquido > 0 
      ? Math.ceil(despesa_fixa_por_prato / lucro_liquido)
      : Infinity;

    return {
      custo_ingredientes,
      custo_total_com_margem,
      custo_por_porcao,
      despesa_fixa_por_prato,
      despesa_variavel,
      custo_total_final,
      preco_sugerido,
      lucro_bruto,
      lucro_liquido,
      margem_bruta,
      margem_liquida,
      status_viabilidade,
      break_even_quantity
    };
  }, [ingredientes, rendimento, config]);
}

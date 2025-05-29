
import { FinancialData } from "@/types/financial-data";

/**
 * Criar dados financeiros vazios
 */
export function createEmptyFinancialData(): FinancialData {
  return {
    receita: 0,
    cmv: 0,
    cmvPercentage: 0,
    profitMargin: 0,
    fixedCosts: 0,
    variableCosts: 0,
    netProfit: 0,
    lastUpdate: new Date().toISOString()
  };
}

/**
 * Disparar evento de atualização de dados financeiros
 */
export function dispatchFinancialDataEvent(): void {
  window.dispatchEvent(new Event('financialDataUpdated'));
}

/**
 * Calcular CMV percentual
 */
export function calculateCMVPercentage(cmv: number, receita: number): number {
  if (receita === 0) return 0;
  return (cmv / receita) * 100;
}

/**
 * Calcular margem de lucro
 */
export function calculateProfitMargin(receita: number, totalCosts: number): number {
  if (receita === 0) return 0;
  return ((receita - totalCosts) / receita) * 100;
}

/**
 * Calcular lucro líquido
 */
export function calculateNetProfit(receita: number, totalCosts: number): number {
  return receita - totalCosts;
}

/**
 * Validar dados financeiros
 */
export function validateFinancialData(data: Partial<FinancialData>): string[] {
  const errors: string[] = [];
  
  if (data.receita !== undefined && data.receita < 0) {
    errors.push('A receita não pode ser negativa');
  }
  
  if (data.cmv !== undefined && data.cmv < 0) {
    errors.push('O CMV não pode ser negativo');
  }
  
  if (data.fixedCosts !== undefined && data.fixedCosts < 0) {
    errors.push('Os custos fixos não podem ser negativos');
  }
  
  if (data.variableCosts !== undefined && data.variableCosts < 0) {
    errors.push('Os custos variáveis não podem ser negativos');
  }
  
  return errors;
}

/**
 * Formatar valores monetários
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formatar percentuais
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

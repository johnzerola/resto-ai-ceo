
import { formatCurrency } from "@/lib/utils";

// Regimes tributários brasileiros
export type TaxRegime = "simples_nacional" | "lucro_presumido" | "lucro_real";

export interface RestaurantConfig {
  businessName: string;
  targetFoodCost: number;
  targetBeverageCost: number;
  averageMonthlyRevenue: number;
  fixedExpenses: number;
  variableExpenses: number;
  desiredProfitMargin: number;
}

export interface TaxCalculation {
  iss: number; // Imposto Sobre Serviços (2-5%)
  icms: number; // ICMS (varia por estado, 7-18%)
  pis: number; // PIS
  cofins: number; // COFINS
  irpj: number; // Imposto de Renda Pessoa Jurídica
  csll: number; // Contribuição Social sobre Lucro Líquido
  total: number;
  regime: TaxRegime;
}

export interface PricingResult {
  baseCost: number;
  costWithWaste: number;
  operationalCost: number;
  fixedCostPerUnit: number;
  totalCostBeforeTax: number;
  taxes: TaxCalculation;
  totalCost: number;
  suggestedPrice: number;
  breakEvenPrice: number;
  netMargin: number;
  grossMargin: number;
  foodCostPercentage: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  contributionMargin: number;
}

/**
 * Calcula impostos baseado no regime tributário
 */
export function calculateTaxes(
  revenue: number, 
  regime: TaxRegime = "simples_nacional",
  stateIcmsRate: number = 12
): TaxCalculation {
  let taxes: TaxCalculation = {
    iss: 0,
    icms: 0,
    pis: 0,
    cofins: 0,
    irpj: 0,
    csll: 0,
    total: 0,
    regime
  };

  switch (regime) {
    case "simples_nacional":
      // Simples Nacional - Anexo III (Serviços)
      // Alíquota varia de 6% a 33% conforme faturamento
      // Usando 12% para faturamento médio
      taxes.total = revenue * 0.12;
      taxes.iss = revenue * 0.02; // ISS já incluso no Simples
      break;

    case "lucro_presumido":
      taxes.iss = revenue * 0.05; // 5%
      taxes.icms = revenue * (stateIcmsRate / 100); // Varia por estado
      taxes.pis = revenue * 0.0065; // 0.65%
      taxes.cofins = revenue * 0.03; // 3%
      taxes.irpj = revenue * 0.015; // 1.5% sobre receita (15% sobre lucro presumido de 10%)
      taxes.csll = revenue * 0.009; // 0.9% sobre receita (9% sobre lucro presumido de 10%)
      taxes.total = taxes.iss + taxes.icms + taxes.pis + taxes.cofins + taxes.irpj + taxes.csll;
      break;

    case "lucro_real":
      taxes.iss = revenue * 0.05; // 5%
      taxes.icms = revenue * (stateIcmsRate / 100);
      taxes.pis = revenue * 0.0165; // 1.65%
      taxes.cofins = revenue * 0.076; // 7.6%
      // IRPJ e CSLL calculados sobre lucro real (não incluídos aqui)
      taxes.total = taxes.iss + taxes.icms + taxes.pis + taxes.cofins;
      break;
  }

  return taxes;
}

/**
 * Carrega configuração do restaurante do localStorage
 */
export function loadRestaurantConfig(): RestaurantConfig {
  const stored = localStorage.getItem("restaurantData");
  if (stored) {
    const data = JSON.parse(stored);
    return {
      businessName: data.businessName || "Meu Restaurante",
      targetFoodCost: data.targetFoodCost || 30,
      targetBeverageCost: data.targetBeverageCost || 25,
      averageMonthlyRevenue: data.averageMonthlyRevenue || 50000,
      fixedExpenses: data.fixedExpenses || 15000,
      variableExpenses: data.variableExpenses || 20000,
      desiredProfitMargin: data.desiredProfitMargin || 25
    };
  }

  // Valores padrão
  return {
    businessName: "Meu Restaurante",
    targetFoodCost: 30,
    targetBeverageCost: 25,
    averageMonthlyRevenue: 50000,
    fixedExpenses: 15000,
    variableExpenses: 20000,
    desiredProfitMargin: 25
  };
}

/**
 * Calcula preço com sincronização total com configurações
 */
export function calculateAdvancedPricing(
  costPerKg: number,
  portionSize: number, // kg por porção (0.3kg para tradicional, 0.8kg para rodízio, 1.0 para buffet peso)
  wastePercentage: number,
  operationalCostPercentage: number,
  desiredMarginPercentage: number,
  monthlySales: number,
  taxRegime: TaxRegime = "simples_nacional",
  model: "rodizio" | "buffet_peso" | "traditional" = "traditional"
): PricingResult {
  
  const config = loadRestaurantConfig();
  
  // Custo base da porção
  const baseCost = costPerKg * portionSize;
  
  // Adicionar desperdício
  const costWithWaste = baseCost * (1 + wastePercentage / 100);
  
  // Adicionar custos operacionais (% sobre o custo)
  const operationalCost = costWithWaste * (operationalCostPercentage / 100);
  
  // Custo fixo por unidade (rateio dos custos fixos)
  const fixedCostPerUnit = monthlySales > 0 ? config.fixedExpenses / monthlySales : 0;
  
  // Custo total antes dos impostos
  const totalCostBeforeTax = costWithWaste + operationalCost + fixedCostPerUnit;
  
  // Calcular preço base com margem desejada
  const basePrice = totalCostBeforeTax / (1 - desiredMarginPercentage / 100);
  
  // Calcular impostos sobre o preço
  const taxes = calculateTaxes(basePrice, taxRegime);
  
  // Preço final incluindo impostos
  const suggestedPrice = basePrice / (1 - taxes.total / basePrice);
  
  // Custo total final
  const totalCost = totalCostBeforeTax + taxes.total;
  
  // Break-even price (preço mínimo para cobrir custos)
  const breakEvenPrice = totalCost * 1.05; // 5% acima do custo total
  
  // Margens
  const grossMargin = ((suggestedPrice - totalCostBeforeTax) / suggestedPrice) * 100;
  const netMargin = ((suggestedPrice - totalCost) / suggestedPrice) * 100;
  
  // Food cost percentage
  const foodCostPercentage = (baseCost / suggestedPrice) * 100;
  
  // Projeções mensais
  const monthlyRevenue = suggestedPrice * monthlySales;
  const monthlyProfit = (suggestedPrice - totalCost) * monthlySales;
  
  // Margem de contribuição
  const contributionMargin = suggestedPrice - (costWithWaste + operationalCost);

  return {
    baseCost,
    costWithWaste,
    operationalCost,
    fixedCostPerUnit,
    totalCostBeforeTax,
    taxes,
    totalCost,
    suggestedPrice,
    breakEvenPrice,
    netMargin,
    grossMargin,
    foodCostPercentage,
    monthlyRevenue,
    monthlyProfit,
    contributionMargin
  };
}

/**
 * Formata resultado para exibição
 */
export function formatPricingResult(result: PricingResult, model: string): string {
  const unit = model === "buffet_peso" ? "/kg" : "";
  return `Preço sugerido: ${formatCurrency(result.suggestedPrice)}${unit}
Food Cost: ${result.foodCostPercentage.toFixed(1)}%
Margem Líquida: ${result.netMargin.toFixed(1)}%
Break-even: ${formatCurrency(result.breakEvenPrice)}${unit}`;
}

/**
 * Valida se a precificação está dentro dos padrões recomendados
 */
export function validatePricing(result: PricingResult): Array<{
  type: "success" | "warning" | "error";
  message: string;
}> {
  const validations = [];

  // Food Cost
  if (result.foodCostPercentage > 35) {
    validations.push({
      type: "error" as const,
      message: `Food Cost de ${result.foodCostPercentage.toFixed(1)}% está muito alto (máx. recomendado: 35%)`
    });
  } else if (result.foodCostPercentage > 30) {
    validations.push({
      type: "warning" as const,
      message: `Food Cost de ${result.foodCostPercentage.toFixed(1)}% está no limite (ideal: até 30%)`
    });
  }

  // Margem líquida
  if (result.netMargin < 15) {
    validations.push({
      type: "error" as const,
      message: `Margem líquida de ${result.netMargin.toFixed(1)}% está muito baixa (mín. recomendado: 15%)`
    });
  } else if (result.netMargin < 20) {
    validations.push({
      type: "warning" as const,
      message: `Margem líquida de ${result.netMargin.toFixed(1)}% está baixa (ideal: acima de 20%)`
    });
  }

  // Break-even safety
  const safetyMargin = ((result.suggestedPrice - result.breakEvenPrice) / result.suggestedPrice) * 100;
  if (safetyMargin < 10) {
    validations.push({
      type: "error" as const,
      message: `Margem de segurança muito baixa (${safetyMargin.toFixed(1)}%)`
    });
  }

  if (validations.length === 0) {
    validations.push({
      type: "success" as const,
      message: "Precificação dentro dos padrões recomendados!"
    });
  }

  return validations;
}

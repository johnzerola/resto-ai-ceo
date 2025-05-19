
import { CategoryMappings } from "@/types/financial-data";

/**
 * Mapeamento de categorias de fluxo de caixa para categorias financeiras
 * Usado para integrar dados entre os diferentes módulos
 */
export const categoryMappings: CategoryMappings = {
  // Receitas
  "Vendas": { type: "income", category: "foodSales" },
  "Delivery": { type: "income", category: "deliverySales" },
  "Eventos": { type: "income", category: "foodSales" },
  "Aplicativos": { type: "income", category: "deliverySales" },
  "Outras receitas": { type: "income", category: "otherSales" },
  
  // Despesas
  "Fornecedores": { type: "expense", category: "foodCost" },
  "Folha de pagamento": { type: "expense", category: "expense" },
  "Aluguel": { type: "expense", category: "expense" },
  "Utilidades": { type: "expense", category: "expense" },
  "Marketing": { type: "expense", category: "expense" },
  "Manutenção": { type: "expense", category: "expense" },
  "Impostos": { type: "expense", category: "expense" },
  "Outras despesas": { type: "expense", category: "otherCosts" },
};


import { z } from 'zod';

// Esquemas de validação robustos para todo o sistema
export const RestaurantConfigSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-Z0-9\s\-.,áéíóúâêîôûàèìòùãõç]+$/, 'Nome contém caracteres inválidos'),
  
  business_type: z.string()
    .min(1, 'Tipo de negócio é obrigatório'),
  
  target_food_cost: z.number()
    .min(10, 'CMV alvo deve ser pelo menos 10%')
    .max(50, 'CMV alvo não pode exceder 50%'),
  
  target_beverage_cost: z.number()
    .min(10, 'CMV alvo deve ser pelo menos 10%')
    .max(50, 'CMV alvo não pode exceder 50%'),
  
  average_monthly_sales: z.number()
    .min(1000, 'Faturamento mensal deve ser pelo menos R$ 1.000')
    .max(10000000, 'Valor muito alto'),
  
  fixed_expenses: z.number()
    .min(0, 'Despesas fixas não podem ser negativas')
    .max(1000000, 'Valor muito alto')
    .optional(),
  
  variable_expenses: z.number()
    .min(0, 'Despesas variáveis não podem ser negativas')
    .max(100, 'Despesas variáveis não podem exceder 100%')
    .optional(),
  
  desired_profit_margin: z.number()
    .min(1, 'Margem de lucro deve ser pelo menos 1%')
    .max(80, 'Margem de lucro não pode exceder 80%')
    .optional()
});

export const FinancialEntrySchema = z.object({
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Tipo deve ser receita ou despesa' })
  }),
  
  amount: z.number()
    .positive('Valor deve ser positivo')
    .max(1000000, 'Valor muito alto')
    .refine(val => Number.isFinite(val), 'Valor deve ser um número válido'),
  
  description: z.string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(200, 'Descrição muito longa')
    .regex(/^[a-zA-Z0-9\s\-.,áéíóúâêîôûàèìòùãõç!?()]+$/, 'Descrição contém caracteres inválidos'),
  
  category: z.string()
    .min(1, 'Categoria é obrigatória')
    .max(50, 'Categoria muito longa'),
  
  date: z.string()
    .refine(val => !isNaN(Date.parse(val)), 'Data inválida'),
  
  payment_method: z.string()
    .max(50, 'Forma de pagamento muito longa')
    .optional(),
  
  restaurant_id: z.string()
    .uuid('ID do restaurante inválido')
});

export const IngredientSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-Z0-9\s\-.,áéíóúâêîôûàèìòùãõç]+$/, 'Nome contém caracteres inválidos'),
  
  preco_pago: z.number()
    .positive('Preço deve ser positivo')
    .max(999999, 'Preço muito alto'),
  
  volume_embalagem: z.number()
    .positive('Volume deve ser positivo')
    .max(999999, 'Volume muito alto'),
  
  unidade_medida: z.string()
    .min(1, 'Unidade de medida é obrigatória')
    .max(20, 'Unidade de medida muito longa'),
  
  categoria: z.string()
    .max(50, 'Categoria muito longa')
    .optional(),
  
  fornecedor: z.string()
    .max(100, 'Nome do fornecedor muito longo')
    .optional(),
  
  restaurant_id: z.string()
    .uuid('ID do restaurante inválido')
});

export const RecipeSchema = z.object({
  nome_prato: z.string()
    .min(3, 'Nome do prato deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-Z0-9\s\-.,áéíóúâêîôûàèìòùãõç]+$/, 'Nome contém caracteres inválidos'),
  
  categoria: z.string()
    .max(50, 'Categoria muito longa')
    .optional(),
  
  rendimento_porcoes: z.number()
    .min(1, 'Rendimento deve ser pelo menos 1 porção')
    .max(1000, 'Rendimento muito alto'),
  
  margem_seguranca: z.number()
    .min(0, 'Margem de segurança não pode ser negativa')
    .max(100, 'Margem de segurança não pode exceder 100%'),
  
  observacoes: z.string()
    .max(1000, 'Observações muito longas')
    .optional(),
  
  restaurant_id: z.string()
    .uuid('ID do restaurante inválido')
});

// Classe para validação avançada
export class EnhancedValidationService {
  // Validação com sanitização
  static validateAndSanitize<T>(schema: z.ZodSchema<T>, data: any): {
    success: boolean;
    data?: T;
    errors: string[];
  } {
    try {
      // Sanitizar strings antes da validação
      const sanitizedData = this.sanitizeObject(data);
      const result = schema.safeParse(sanitizedData);
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          errors: []
        };
      } else {
        return {
          success: false,
          errors: result.error.errors.map(e => e.message)
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: ['Erro interno de validação']
      };
    }
  }
  
  // Sanitização recursiva de objetos
  private static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    } else if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  }
  
  // Sanitização segura de strings
  private static sanitizeString(str: string): string {
    return str
      .trim()
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/['"]/g, '') // Remove quotes perigosas
      .replace(/--/g, '') // Remove comentários SQL
      .replace(/\/\*/g, '') // Remove comentários SQL em bloco
      .replace(/\*\//g, '')
      .substring(0, 1000); // Limita tamanho
  }
  
  // Validação específica para cálculos financeiros
  static validateFinancialCalculation(values: {
    revenue: number;
    costs: number;
    expenses: number;
  }): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validações críticas
    if (!Number.isFinite(values.revenue) || values.revenue < 0) {
      errors.push('Receita deve ser um número válido e não negativo');
    }
    
    if (!Number.isFinite(values.costs) || values.costs < 0) {
      errors.push('Custos devem ser um número válido e não negativo');
    }
    
    if (!Number.isFinite(values.expenses) || values.expenses < 0) {
      errors.push('Despesas devem ser um número válido e não negativo');
    }
    
    // Validações de aviso
    if (values.revenue > 0) {
      const cmvPercentage = (values.costs / values.revenue) * 100;
      if (cmvPercentage > 40) {
        warnings.push(`CMV muito alto: ${cmvPercentage.toFixed(1)}%`);
      }
      
      const expensePercentage = (values.expenses / values.revenue) * 100;
      if (expensePercentage > 60) {
        warnings.push(`Despesas muito altas: ${expensePercentage.toFixed(1)}%`);
      }
      
      const profit = values.revenue - values.costs - values.expenses;
      const profitMargin = (profit / values.revenue) * 100;
      if (profitMargin < 5) {
        warnings.push(`Margem de lucro baixa: ${profitMargin.toFixed(1)}%`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  // Rate limiting avançado
  static checkAdvancedRateLimit(
    userId: string,
    action: string,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const key = `rate_limit_${userId}_${action}`;
    const now = Date.now();
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      const data = { requests: [now], resetTime: now + windowMs };
      localStorage.setItem(key, JSON.stringify(data));
      return { allowed: true, remaining: maxRequests - 1, resetTime: data.resetTime };
    }
    
    try {
      const data = JSON.parse(stored);
      const validRequests = data.requests.filter((timestamp: number) => now - timestamp < windowMs);
      
      if (validRequests.length < maxRequests) {
        validRequests.push(now);
        const newData = { requests: validRequests, resetTime: data.resetTime };
        localStorage.setItem(key, JSON.stringify(newData));
        return { 
          allowed: true, 
          remaining: maxRequests - validRequests.length, 
          resetTime: data.resetTime 
        };
      }
      
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: data.resetTime 
      };
    } catch {
      const data = { requests: [now], resetTime: now + windowMs };
      localStorage.setItem(key, JSON.stringify(data));
      return { allowed: true, remaining: maxRequests - 1, resetTime: data.resetTime };
    }
  }
}

// Funções de utilidade para validação
export const validateRestaurantConfig = (data: any) => 
  EnhancedValidationService.validateAndSanitize(RestaurantConfigSchema, data);

export const validateFinancialEntry = (data: any) => 
  EnhancedValidationService.validateAndSanitize(FinancialEntrySchema, data);

export const validateIngredient = (data: any) => 
  EnhancedValidationService.validateAndSanitize(IngredientSchema, data);

export const validateRecipe = (data: any) => 
  EnhancedValidationService.validateAndSanitize(RecipeSchema, data);

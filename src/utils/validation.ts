
import { z } from 'zod';

// Security-focused validation schemas
export const secureTextSchema = z.string()
  .min(1, 'Campo obrigatório')
  .max(255, 'Texto muito longo')
  .regex(/^[a-zA-Z0-9\s\-_.,!?áéíóúâêîôûàèìòùãõç]*$/, 'Caracteres inválidos detectados')
  .transform(str => str.trim());

export const financialValueSchema = z.number()
  .min(0, 'Valor deve ser positivo')
  .max(999999999, 'Valor muito alto')
  .finite('Valor deve ser um número válido');

export const percentageSchema = z.number()
  .min(0, 'Percentual deve ser positivo')
  .max(1000, 'Percentual muito alto')
  .finite('Percentual deve ser um número válido');

export const emailSchema = z.string()
  .email('Email inválido')
  .max(255, 'Email muito longo')
  .toLowerCase();

// Business validation schemas
export const ingredientSchema = z.object({
  nome_insumo: secureTextSchema,
  quantidade_bruta: financialValueSchema,
  quantidade_liquida: financialValueSchema,
  fator_correcao: z.number().min(0.1).max(10),
  preco_unitario: financialValueSchema,
  custo_total: financialValueSchema,
  unidade_medida: secureTextSchema
});

export const pratoSchema = z.object({
  nome_prato: secureTextSchema,
  categoria: secureTextSchema.optional(),
  rendimento_porcoes: z.number().min(1).max(1000),
  observacoes: z.string().max(1000).optional(),
  margem_seguranca: percentageSchema
});

export const restaurantSchema = z.object({
  name: secureTextSchema,
  business_type: secureTextSchema.optional(),
  target_food_cost: percentageSchema.optional(),
  target_beverage_cost: percentageSchema.optional(),
  desired_profit_margin: percentageSchema.optional(),
  fixed_expenses: financialValueSchema.optional(),
  variable_expenses: financialValueSchema.optional(),
  average_monthly_sales: financialValueSchema.optional()
});

// Input sanitization functions
export class InputSanitizer {
  static sanitizeText(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/['"]/g, '') // Remove quotes
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove SQL block comments
      .replace(/\*\//g, '')
      .substring(0, 1000); // Limit length
  }

  static sanitizeNumber(input: any): number {
    const num = parseFloat(input);
    if (isNaN(num) || !isFinite(num)) return 0;
    return Math.max(0, Math.min(999999999, num));
  }

  static sanitizePercentage(input: any): number {
    const num = parseFloat(input);
    if (isNaN(num) || !isFinite(num)) return 0;
    return Math.max(0, Math.min(1000, num));
  }
}

// Rate limiting for security
export class RateLimiter {
  private static actions = new Map<string, number[]>();

  static canPerformAction(
    action: string, 
    maxRequests: number, 
    windowMs: number,
    identifier: string = 'default'
  ): boolean {
    const key = `${action}_${identifier}`;
    const now = Date.now();
    
    if (!this.actions.has(key)) {
      this.actions.set(key, [now]);
      return true;
    }

    const timestamps = this.actions.get(key)!;
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
    
    if (validTimestamps.length < maxRequests) {
      validTimestamps.push(now);
      this.actions.set(key, validTimestamps);
      return true;
    }
    
    return false;
  }

  static getRemainingRequests(
    action: string, 
    maxRequests: number, 
    windowMs: number,
    identifier: string = 'default'
  ): number {
    const key = `${action}_${identifier}`;
    const now = Date.now();
    
    if (!this.actions.has(key)) return maxRequests;

    const timestamps = this.actions.get(key)!;
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
    
    return Math.max(0, maxRequests - validTimestamps.length);
  }
}

// XSS Protection
export class XSSProtection {
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /data:text\/html/gi
  ];

  static containsMaliciousContent(input: string): boolean {
    return this.DANGEROUS_PATTERNS.some(pattern => pattern.test(input));
  }

  static sanitizeForDisplay(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}

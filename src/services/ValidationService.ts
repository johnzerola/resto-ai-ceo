
import { z } from 'zod';

// Schemas de validação para segurança de dados
export const InsumoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  preco_pago: z.number().positive('Preço deve ser positivo').max(999999),
  volume_embalagem: z.number().positive('Volume deve ser positivo').max(999999),
  unidade_medida: z.string().min(1).max(20),
  restaurant_id: z.string().uuid('ID do restaurante inválido')
});

export const PratoSchema = z.object({
  nome_prato: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(200),
  categoria: z.string().max(50).optional(),
  rendimento_porcoes: z.number().positive('Rendimento deve ser positivo').max(1000),
  margem_seguranca: z.number().min(0).max(100),
  observacoes: z.string().max(1000).optional(),
  restaurant_id: z.string().uuid('ID do restaurante inválido')
});

export const IngredienteSchema = z.object({
  quantidade_bruta: z.number().positive('Quantidade deve ser positiva').max(999999),
  fator_correcao: z.number().positive('Fator deve ser positivo').max(10),
  insumo_id: z.string().uuid('ID do insumo inválido'),
  prato_id: z.string().uuid('ID do prato inválido')
});

// Função para sanitizar dados
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres perigosos
    .substring(0, 1000); // Limita tamanho
}

// Validação de números financeiros
export function validateFinancialValue(value: number): boolean {
  return !isNaN(value) && 
         isFinite(value) && 
         value >= 0 && 
         value <= 999999999;
}

// Rate limiting simples (localStorage based)
export class RateLimiter {
  private static getKey(action: string): string {
    return `rate_limit_${action}`;
  }

  static canPerformAction(action: string, maxRequests: number, windowMs: number): boolean {
    const key = this.getKey(action);
    const now = Date.now();
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      localStorage.setItem(key, JSON.stringify([now]));
      return true;
    }

    try {
      const timestamps: number[] = JSON.parse(stored);
      const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
      
      if (validTimestamps.length < maxRequests) {
        validTimestamps.push(now);
        localStorage.setItem(key, JSON.stringify(validTimestamps));
        return true;
      }
      
      return false;
    } catch {
      localStorage.setItem(key, JSON.stringify([now]));
      return true;
    }
  }
}

export default {
  InsumoSchema,
  PratoSchema,
  IngredienteSchema,
  sanitizeInput,
  validateFinancialValue,
  RateLimiter
};

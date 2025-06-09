
import { useState, useCallback } from 'react';
import { z } from 'zod';

interface ValidationConfig {
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  allowedChars?: string[];
  sanitize?: boolean;
}

class SecurityValidator {
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
  ];

  private static readonly SQL_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(['"])\s*(OR|AND)\s*\1\s*=\s*\1/gi,
    /(-{2}|\/\*|\*\/)/g
  ];

  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/['"]/g, '') // Remove quotes
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove SQL block comments start
      .replace(/\*\//g, '') // Remove SQL block comments end
      .substring(0, 1000); // Limit length
  }

  static validateInput(input: string, config: ValidationConfig = {}): boolean {
    if (typeof input !== 'string') return false;
    
    // Length validation
    if (config.maxLength && input.length > config.maxLength) return false;
    if (config.minLength && input.length < config.minLength) return false;
    
    // Pattern validation
    if (config.pattern && !config.pattern.test(input)) return false;
    
    // XSS detection
    if (this.XSS_PATTERNS.some(pattern => pattern.test(input))) return false;
    
    // SQL injection detection
    if (this.SQL_PATTERNS.some(pattern => pattern.test(input))) return false;
    
    return true;
  }

  static validateFinancialValue(value: number): boolean {
    return !isNaN(value) && 
           isFinite(value) && 
           value >= 0 && 
           value <= 999999999;
  }
}

export function useSecureValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((
    fieldName: string,
    value: any,
    schema?: z.ZodSchema,
    config?: ValidationConfig
  ) => {
    try {
      // Zod validation if provided
      if (schema) {
        schema.parse(value);
      }

      // Security validation for strings
      if (typeof value === 'string') {
        if (!SecurityValidator.validateInput(value, config)) {
          setErrors(prev => ({
            ...prev,
            [fieldName]: 'Entrada contém caracteres inválidos ou é insegura'
          }));
          return false;
        }
      }

      // Financial validation for numbers
      if (typeof value === 'number' && fieldName.includes('preco') || fieldName.includes('custo')) {
        if (!SecurityValidator.validateFinancialValue(value)) {
          setErrors(prev => ({
            ...prev,
            [fieldName]: 'Valor financeiro inválido'
          }));
          return false;
        }
      }

      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error instanceof z.ZodError 
          ? error.errors[0]?.message || 'Valor inválido'
          : 'Erro de validação'
      }));
      return false;
    }
  }, []);

  const sanitizeInput = useCallback((input: string): string => {
    return SecurityValidator.sanitizeInput(input);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    sanitizeInput,
    clearErrors
  };
}

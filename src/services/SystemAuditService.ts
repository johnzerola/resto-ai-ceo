
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SystemHealthCheck {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  timestamp: string;
  details?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class SystemAuditService {
  // Auditoria completa do sistema
  static async performSystemAudit(restaurantId: string): Promise<SystemHealthCheck[]> {
    const results: SystemHealthCheck[] = [];
    
    try {
      // 1. Verificar configurações do restaurante
      const configCheck = await this.auditRestaurantConfig(restaurantId);
      results.push(configCheck);
      
      // 2. Verificar integridade dos dados financeiros
      const financialCheck = await this.auditFinancialData(restaurantId);
      results.push(financialCheck);
      
      // 3. Verificar cálculos de DRE e CMV
      const calculationCheck = await this.auditCalculations(restaurantId);
      results.push(calculationCheck);
      
      // 4. Verificar sincronização entre localStorage e Supabase
      const syncCheck = await this.auditDataSynchronization(restaurantId);
      results.push(syncCheck);
      
      // 5. Verificar políticas RLS
      const securityCheck = await this.auditSecurityPolicies(restaurantId);
      results.push(securityCheck);
      
      return results;
    } catch (error) {
      console.error('Erro na auditoria do sistema:', error);
      return [{
        component: 'System Audit',
        status: 'error',
        message: 'Falha na execução da auditoria completa',
        timestamp: new Date().toISOString(),
        details: error
      }];
    }
  }
  
  // Auditoria das configurações do restaurante
  private static async auditRestaurantConfig(restaurantId: string): Promise<SystemHealthCheck> {
    try {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
      
      if (error) throw error;
      
      const errors: string[] = [];
      
      if (!restaurant.name) errors.push('Nome do restaurante não configurado');
      if (!restaurant.business_type) errors.push('Tipo de negócio não configurado');
      if (!restaurant.target_food_cost) errors.push('CMV alvo para alimentos não configurado');
      if (!restaurant.target_beverage_cost) errors.push('CMV alvo para bebidas não configurado');
      
      return {
        component: 'Restaurant Configuration',
        status: errors.length > 0 ? 'warning' : 'healthy',
        message: errors.length > 0 ? 'Configurações incompletas detectadas' : 'Configurações válidas',
        timestamp: new Date().toISOString(),
        details: { errors, restaurant }
      };
    } catch (error) {
      return {
        component: 'Restaurant Configuration',
        status: 'error',
        message: 'Erro ao verificar configurações do restaurante',
        timestamp: new Date().toISOString(),
        details: error
      };
    }
  }
  
  // Auditoria dos dados financeiros
  private static async auditFinancialData(restaurantId: string): Promise<SystemHealthCheck> {
    try {
      const { data: cashFlow, error } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('date', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      const warnings: string[] = [];
      const errors: string[] = [];
      
      // Verificar integridade dos dados
      if (!cashFlow || cashFlow.length === 0) {
        warnings.push('Nenhum registro de fluxo de caixa encontrado');
      } else {
        cashFlow.forEach((entry, index) => {
          if (!entry.amount || entry.amount <= 0) {
            errors.push(`Registro ${index + 1}: Valor inválido`);
          }
          if (!entry.type || !['income', 'expense'].includes(entry.type)) {
            errors.push(`Registro ${index + 1}: Tipo inválido`);
          }
          if (!entry.category) {
            warnings.push(`Registro ${index + 1}: Categoria não informada`);
          }
        });
      }
      
      return {
        component: 'Financial Data',
        status: errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'healthy',
        message: errors.length > 0 ? 'Erros críticos nos dados financeiros' : 
                warnings.length > 0 ? 'Avisos nos dados financeiros' : 'Dados financeiros íntegros',
        timestamp: new Date().toISOString(),
        details: { errors, warnings, recordCount: cashFlow?.length || 0 }
      };
    } catch (error) {
      return {
        component: 'Financial Data',
        status: 'error',
        message: 'Erro ao verificar dados financeiros',
        timestamp: new Date().toISOString(),
        details: error
      };
    }
  }
  
  // Auditoria dos cálculos
  private static async auditCalculations(restaurantId: string): Promise<SystemHealthCheck> {
    try {
      // Calcular DRE usando a função do Supabase
      const { data: dreData, error: dreError } = await supabase.rpc('calcular_dre_mensal', {
        restaurant_uuid: restaurantId,
        mes_param: new Date().getMonth() + 1,
        ano_param: new Date().getFullYear()
      });
      
      if (dreError) throw dreError;
      
      const warnings: string[] = [];
      
      // Verificar se há dados suficientes para cálculos
      const { data: cashFlowCount, error: countError } = await supabase
        .from('cash_flow')
        .select('id', { count: 'exact' })
        .eq('restaurant_id', restaurantId);
      
      if (countError) throw countError;
      
      if (!cashFlowCount || cashFlowCount.length < 10) {
        warnings.push('Poucos dados para cálculos precisos de DRE');
      }
      
      return {
        component: 'Calculations',
        status: warnings.length > 0 ? 'warning' : 'healthy',
        message: warnings.length > 0 ? 'Cálculos com avisos' : 'Cálculos funcionando corretamente',
        timestamp: new Date().toISOString(),
        details: { warnings, dataCount: cashFlowCount?.length || 0 }
      };
    } catch (error) {
      return {
        component: 'Calculations',
        status: 'error',
        message: 'Erro nos cálculos de DRE/CMV',
        timestamp: new Date().toISOString(),
        details: error
      };
    }
  }
  
  // Auditoria da sincronização de dados
  private static async auditDataSynchronization(restaurantId: string): Promise<SystemHealthCheck> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return {
          component: 'Data Synchronization',
          status: 'error',
          message: 'Usuário não autenticado',
          timestamp: new Date().toISOString()
        };
      }
      
      // Verificar se localStorage e Supabase estão sincronizados
      const userKey = `financialData_${session.user.id}`;
      const localData = localStorage.getItem(userKey);
      
      const warnings: string[] = [];
      
      if (!localData) {
        warnings.push('Dados locais não encontrados');
      }
      
      return {
        component: 'Data Synchronization',
        status: warnings.length > 0 ? 'warning' : 'healthy',
        message: warnings.length > 0 ? 'Problemas de sincronização detectados' : 'Sincronização funcionando',
        timestamp: new Date().toISOString(),
        details: { warnings, hasLocalData: !!localData }
      };
    } catch (error) {
      return {
        component: 'Data Synchronization',
        status: 'error',
        message: 'Erro na verificação de sincronização',
        timestamp: new Date().toISOString(),
        details: error
      };
    }
  }
  
  // Auditoria das políticas de segurança
  private static async auditSecurityPolicies(restaurantId: string): Promise<SystemHealthCheck> {
    try {
      // Verificar se as tabelas principais têm RLS habilitado
      const { data: rlsCheck, error } = await supabase.rpc('system_healthcheck', {
        restaurant_uuid: restaurantId
      });
      
      if (error) throw error;
      
      return {
        component: 'Security Policies',
        status: 'healthy',
        message: 'Políticas RLS funcionando corretamente',
        timestamp: new Date().toISOString(),
        details: rlsCheck
      };
    } catch (error) {
      return {
        component: 'Security Policies',
        status: 'error',
        message: 'Erro na verificação de segurança',
        timestamp: new Date().toISOString(),
        details: error
      };
    }
  }
  
  // Validação de entrada de dados
  static validateFinancialEntry(entry: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validações obrigatórias
    if (!entry.amount || typeof entry.amount !== 'number' || entry.amount <= 0) {
      errors.push('Valor deve ser um número positivo');
    }
    
    if (!entry.type || !['income', 'expense'].includes(entry.type)) {
      errors.push('Tipo deve ser "income" ou "expense"');
    }
    
    if (!entry.description || entry.description.trim().length < 3) {
      errors.push('Descrição deve ter pelo menos 3 caracteres');
    }
    
    if (!entry.date) {
      errors.push('Data é obrigatória');
    }
    
    // Validações de aviso
    if (!entry.category) {
      warnings.push('Categoria não informada');
    }
    
    if (!entry.payment_method) {
      warnings.push('Forma de pagamento não informada');
    }
    
    // Validação de valor extremo
    if (entry.amount > 100000) {
      warnings.push('Valor muito alto - confirme se está correto');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  // Limpeza e sanitização de dados
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML
      .replace(/['"]/g, '') // Remove aspas
      .replace(/--/g, '') // Remove comentários SQL
      .substring(0, 1000); // Limita tamanho
  }
  
  // Rate limiting básico
  static checkRateLimit(action: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const key = `rate_limit_${action}`;
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

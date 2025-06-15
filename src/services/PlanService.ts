
import { supabase } from '@/integrations/supabase/client';

export interface PlanFeatures {
  hasAdvancedReports: boolean;
  hasFullAIAssistant: boolean;
  hasInventoryManagement: boolean;
  hasFinancialAnalysis: boolean;
  hasTeamManagement: boolean;
  hasPrioritySupport: boolean;
  hasSimuladorCenarios: boolean;
}

export interface PlanLimits {
  maxRestaurants: number;
  menuItems: number;
  cashFlowEntries: number;
  teamMembers: number;
  aiMessages: number;
}

export interface Plan {
  id: string;
  plan_id: string;
  name: string;
  price: number;
  features: PlanFeatures;
  limits: PlanLimits;
  access_level: number;
  is_active: boolean;
}

export class PlanService {
  static async getAllPlans(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('access_level', { ascending: true });

    if (error) {
      console.error('Erro ao buscar planos:', error);
      throw error;
    }

    return (data || []).map(plan => ({
      ...plan,
      features: plan.features as unknown as PlanFeatures,
      limits: plan.limits as unknown as PlanLimits
    }));
  }

  static async getPlanById(planId: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('plan_id', planId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Erro ao buscar plano:', error);
      return null;
    }

    return data ? {
      ...data,
      features: data.features as unknown as PlanFeatures,
      limits: data.limits as unknown as PlanLimits
    } : null;
  }

  static async getUserPlan(userId: string): Promise<Plan | null> {
    // Buscar subscriber primeiro
    const { data: subscriber, error: subError } = await supabase
      .from('subscribers')
      .select('subscription_tier')
      .eq('user_id', userId)
      .single();

    if (subError || !subscriber) {
      console.log('Usuário sem plano encontrado, retornando plano gratuito');
      return await this.getPlanById('free');
    }

    return await this.getPlanById(subscriber.subscription_tier || 'free');
  }

  static async updateUserPlan(userId: string, planId: string): Promise<boolean> {
    // Primeiro, buscar o email do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    const { error } = await supabase
      .from('subscribers')
      .upsert({
        user_id: userId,
        email: profile?.email || '',
        subscription_tier: planId,
        plan_status: 'active',
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao atualizar plano do usuário:', error);
      return false;
    }

    return true;
  }

  static hasFeature(plan: Plan, feature: keyof PlanFeatures): boolean {
    return plan?.features?.[feature] || false;
  }

  static getLimit(plan: Plan, limitType: keyof PlanLimits): number {
    return plan?.limits?.[limitType] || 0;
  }

  static canAccess(currentPlan: Plan, requiredPlan: string): boolean {
    const planHierarchy: { [key: string]: number } = {
      'free': 1,
      'essencial': 2,
      'profissional': 3
    };

    const currentLevel = planHierarchy[currentPlan.plan_id] || 0;
    const requiredLevel = planHierarchy[requiredPlan] || 999;

    return currentLevel >= requiredLevel;
  }
}

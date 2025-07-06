import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface BusinessProfile {
  id?: string;
  restaurant_id: string;
  owner_name?: string;
  cnpj?: string;
  average_monthly_revenue: number;
  average_ticket: number;
  desired_profit_margin: number;
  fixed_monthly_costs: number;
  variable_monthly_costs: number;
  weekly_operating_days: number;
  daily_operating_hours: string;
  break_even_point: number;
  ideal_cmv_percentage: number;
  monthly_sales_target: number;
  ideal_net_margin: number;
  motivational_insights: any; // Json type from Supabase
}

export const useBusinessProfile = () => {
  const { currentRestaurant } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateBusinessMetrics = (data: Partial<BusinessProfile>): Partial<BusinessProfile> => {
    const {
      average_monthly_revenue = 0,
      fixed_monthly_costs = 0,
      variable_monthly_costs = 0,
      desired_profit_margin = 30,
      weekly_operating_days = 6,
      average_ticket = 0
    } = data;

    // Calcular ponto de equilíbrio
    const monthlyVariableCosts = (average_monthly_revenue * variable_monthly_costs) / 100;
    const totalMonthlyCosts = fixed_monthly_costs + monthlyVariableCosts;
    const break_even_point = totalMonthlyCosts;

    // Calcular CMV ideal (30% é uma boa referência para restaurantes)
    const ideal_cmv_percentage = 30;

    // Calcular meta de vendas mensais considerando margem desejada
    const monthly_sales_target = totalMonthlyCosts / (1 - desired_profit_margin / 100);

    // Calcular margem líquida ideal
    const ideal_net_margin = desired_profit_margin * 0.7; // Considerando impostos e outras deduções

    // Gerar insights motivacionais
    const motivational_insights = generateMotivationalInsights({
      average_monthly_revenue,
      break_even_point,
      ideal_cmv_percentage,
      monthly_sales_target,
      ideal_net_margin,
      weekly_operating_days,
      average_ticket
    });

    return {
      break_even_point,
      ideal_cmv_percentage,
      monthly_sales_target,
      ideal_net_margin,
      motivational_insights
    };
  };

  const generateMotivationalInsights = (data: any): string[] => {
    const insights = [];
    const {
      average_monthly_revenue,
      break_even_point,
      ideal_cmv_percentage,
      monthly_sales_target,
      weekly_operating_days,
      average_ticket
    } = data;

    if (break_even_point > 0) {
      insights.push(`🎯 Seu ponto de equilíbrio está estimado em R$ ${break_even_point.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} mensais.`);
    }

    if (ideal_cmv_percentage > 0) {
      insights.push(`📊 Seu CMV ideal é de até ${ideal_cmv_percentage}%. Vamos trabalhar para manter seus custos nesse patamar!`);
    }

    if (monthly_sales_target > average_monthly_revenue) {
      const gap = ((monthly_sales_target - average_monthly_revenue) / average_monthly_revenue * 100).toFixed(0);
      insights.push(`📈 Para atingir sua margem desejada, você precisa aumentar o faturamento em ${gap}%. Vamos juntos nessa jornada!`);
    }

    if (weekly_operating_days && average_ticket > 0) {
      const dailyTarget = monthly_sales_target / (weekly_operating_days * 4.33);
      const dailyTickets = Math.ceil(dailyTarget / average_ticket);
      insights.push(`🎯 Meta diária: aproximadamente ${dailyTickets} atendimentos de R$ ${average_ticket.toFixed(2)} cada.`);
    }

    insights.push(`💪 Com dedicação e as ferramentas certas, seu negócio tem potencial para crescer muito!`);

    return insights;
  };

  const loadProfile = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      console.log('🔍 Carregando perfil para restaurante:', currentRestaurant.id);
      
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar perfil:', error);
        return;
      }

      if (data) {
        console.log('✅ Perfil carregado:', data);
        // Convert Json to string array if needed
        const profile = {
          ...data,
          motivational_insights: Array.isArray(data.motivational_insights) 
            ? data.motivational_insights 
            : (data.motivational_insights ? [data.motivational_insights] : [])
        };
        setProfile(profile);
      } else {
        console.log('ℹ️ Nenhum perfil encontrado para este restaurante');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (profileData: Partial<BusinessProfile>): Promise<boolean> => {
    if (!currentRestaurant?.id) {
      toast.error('Restaurante não selecionado');
      return false;
    }

    setIsLoading(true);
    try {
      console.log('💾 Salvando perfil:', profileData);
      console.log('🏪 Restaurante ID:', currentRestaurant.id);
      
      // Calcular métricas automáticas
      const calculatedMetrics = calculateBusinessMetrics(profileData);
      const fullProfileData = {
        ...profileData,
        ...calculatedMetrics,
        restaurant_id: currentRestaurant.id
      };

      console.log('📊 Dados completos para salvar:', fullProfileData);

      const { data, error } = await supabase
        .from('business_profiles')
        .upsert([fullProfileData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar perfil:', error);
        toast.error('Erro ao salvar perfil empresarial');
        return false;
      }

      console.log('✅ Perfil salvo com sucesso:', data);
      setProfile(data);
      toast.success('Perfil empresarial salvo com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil empresarial');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRestaurantData = async (restaurantData: { owner_name?: string; cnpj?: string }) => {
    if (!currentRestaurant?.id) return false;

    try {
      const { error } = await supabase
        .from('restaurants')
        .update(restaurantData)
        .eq('id', currentRestaurant.id);

      if (error) {
        console.error('Erro ao atualizar dados do restaurante:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar dados do restaurante:', error);
      return false;
    }
  };

  useEffect(() => {
    loadProfile();
  }, [currentRestaurant]);

  return {
    profile,
    isLoading,
    saveProfile,
    updateRestaurantData,
    calculateBusinessMetrics,
    generateMotivationalInsights
  };
};
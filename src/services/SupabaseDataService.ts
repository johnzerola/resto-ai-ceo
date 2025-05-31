
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RestaurantFinancialData {
  id?: string;
  restaurant_id: string;
  daily_sales: number;
  monthly_sales: number;
  dishes_sold: number;
  average_ticket: number;
  cmv_percentage: number;
  profit_margin: number;
  labor_cost_percentage: number;
  fixed_costs: number;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface PricingModel {
  id?: string;
  restaurant_id: string;
  channel: 'salon' | 'delivery' | 'buffet' | 'rodizio' | 'ifood';
  markup_percentage: number;
  delivery_fee?: number;
  platform_commission?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Serviço para dados financeiros reais
export class SupabaseDataService {
  
  // Obter dados financeiros do restaurante
  static async getRestaurantFinancialData(restaurantId: string): Promise<RestaurantFinancialData[]> {
    try {
      const { data, error } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Erro ao carregar dados financeiros:', error);
        return [];
      }

      // Transformar dados do cash_flow em métricas financeiras
      return this.transformCashFlowToFinancialData(data || []);
    } catch (error) {
      console.error('Erro na consulta financeira:', error);
      return [];
    }
  }

  // Transformar dados de cash flow em métricas
  private static transformCashFlowToFinancialData(cashFlowData: any[]): RestaurantFinancialData[] {
    const groupedByDate = cashFlowData.reduce((acc, transaction) => {
      const date = transaction.date;
      if (!acc[date]) {
        acc[date] = {
          revenue: 0,
          costs: 0,
          transactions: 0
        };
      }

      if (transaction.type === 'income') {
        acc[date].revenue += Number(transaction.amount);
      } else {
        acc[date].costs += Number(transaction.amount);
      }
      acc[date].transactions++;

      return acc;
    }, {});

    return Object.entries(groupedByDate).map(([date, data]: [string, any]) => ({
      restaurant_id: cashFlowData[0]?.restaurant_id || '',
      daily_sales: data.revenue,
      monthly_sales: data.revenue * 30, // Estimativa
      dishes_sold: Math.floor(data.transactions * 2.5), // Estimativa
      average_ticket: data.transactions > 0 ? data.revenue / data.transactions : 0,
      cmv_percentage: data.revenue > 0 ? (data.costs / data.revenue) * 100 : 0,
      profit_margin: data.revenue > 0 ? ((data.revenue - data.costs) / data.revenue) * 100 : 0,
      labor_cost_percentage: 25, // Valor padrão, deve ser configurável
      fixed_costs: data.costs,
      date: date
    }));
  }

  // Obter dados de estoque
  static async getInventoryData(restaurantId: string) {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) {
        console.error('Erro ao carregar estoque:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro na consulta de estoque:', error);
      return [];
    }
  }

  // Obter metas do restaurante
  static async getRestaurantGoals(restaurantId: string) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar metas:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro na consulta de metas:', error);
      return [];
    }
  }

  // Salvar modelo de precificação
  static async savePricingModel(pricingData: Omit<PricingModel, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('pricing_models' as any)
        .upsert(pricingData, {
          onConflict: 'restaurant_id,channel'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar modelo de precificação:', error);
        toast.error('Erro ao salvar modelo de precificação');
        return null;
      }

      toast.success('Modelo de precificação salvo com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao salvar precificação:', error);
      toast.error('Erro interno ao salvar precificação');
      return null;
    }
  }

  // Obter modelos de precificação
  static async getPricingModels(restaurantId: string): Promise<PricingModel[]> {
    try {
      const { data, error } = await supabase
        .from('pricing_models' as any)
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) {
        console.error('Erro ao carregar modelos de precificação:', error);
        return [];
      }

      return (data || []) as PricingModel[];
    } catch (error) {
      console.error('Erro na consulta de precificação:', error);
      return [];
    }
  }

  // Calcular precificação inteligente baseada no canal
  static calculateChannelPricing(baseCost: number, channel: PricingModel['channel'], pricingModel?: PricingModel) {
    const defaultMarkups = {
      salon: 250,      // 250% markup para salão
      delivery: 280,   // 280% markup para delivery (custos maiores)
      buffet: 200,     // 200% markup para buffet por kg
      rodizio: 300,    // 300% markup para rodízio (valor fixo)
      ifood: 320       // 320% markup para iFood (comissão da plataforma)
    };

    const markup = pricingModel?.markup_percentage || defaultMarkups[channel];
    const basePrice = baseCost * (markup / 100);
    
    // Adicionar taxa de entrega se for delivery
    const deliveryFee = channel === 'delivery' ? (pricingModel?.delivery_fee || 5.00) : 0;
    
    // Considerar comissão da plataforma (iFood, por exemplo)
    const platformCommission = pricingModel?.platform_commission || 0;
    const finalPrice = basePrice + deliveryFee;
    
    return {
      basePrice,
      deliveryFee,
      platformCommission,
      finalPrice: finalPrice * (1 + platformCommission / 100),
      markup
    };
  }

  // Sincronizar dados entre módulos
  static async syncModuleData(restaurantId: string) {
    try {
      console.log('Iniciando sincronização de dados para restaurante:', restaurantId);
      
      // Disparar evento de sincronização
      window.dispatchEvent(new CustomEvent('dataSync', { 
        detail: { restaurantId, timestamp: new Date().toISOString() }
      }));

      return true;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return false;
    }
  }
}

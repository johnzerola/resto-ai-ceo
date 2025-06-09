import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RestaurantFinancialData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  restaurant_id: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  completed: boolean;
  restaurant_id: string;
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

export class SupabaseDataService {
  static async getRestaurantFinancialData(restaurantId: string): Promise<RestaurantFinancialData[]> {
    try {
      const { data, error } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar dados financeiros:', error);
        toast.error('Erro ao carregar dados financeiros');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      toast.error('Erro ao carregar dados financeiros');
      return [];
    }
  }

  static async getInventoryData(restaurantId: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) {
        console.error('Erro ao buscar dados de inventário:', error);
        toast.error('Erro ao carregar dados de inventário');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar dados de inventário:', error);
      toast.error('Erro ao carregar dados de inventário');
      return [];
    }
  }

  static async getRestaurantGoals(restaurantId: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) {
        console.error('Erro ao buscar metas:', error);
        toast.error('Erro ao carregar metas');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      toast.error('Erro ao carregar metas');
      return [];
    }
  }

  static async getPricingModels(restaurantId: string): Promise<PricingModel[]> {
    try {
      const { data, error } = await supabase
        .from('pricing_models')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('channel');

      if (error) {
        console.error('Erro ao buscar modelos de precificação:', error);
        toast.error('Erro ao carregar modelos de precificação');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar modelos de precificação:', error);
      toast.error('Erro ao carregar modelos de precificação');
      return [];
    }
  }

  static async savePricingModel(modelData: Omit<PricingModel, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      // Verificar se já existe um modelo para este canal
      const { data: existing } = await supabase
        .from('pricing_models')
        .select('id')
        .eq('restaurant_id', modelData.restaurant_id)
        .eq('channel', modelData.channel)
        .single();

      if (existing) {
        // Atualizar modelo existente
        const { error } = await supabase
          .from('pricing_models')
          .update({
            markup_percentage: modelData.markup_percentage,
            delivery_fee: modelData.delivery_fee || 0,
            platform_commission: modelData.platform_commission || 0,
            is_active: modelData.is_active
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Erro ao atualizar modelo de precificação:', error);
          toast.error('Erro ao salvar modelo de precificação');
          return false;
        }
      } else {
        // Criar novo modelo
        const { error } = await supabase
          .from('pricing_models')
          .insert([modelData]);

        if (error) {
          console.error('Erro ao criar modelo de precificação:', error);
          toast.error('Erro ao salvar modelo de precificação');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar modelo de precificação:', error);
      toast.error('Erro ao salvar modelo de precificação');
      return false;
    }
  }

  static calculateChannelPricing(
    baseCost: number, 
    channel: PricingModel['channel'], 
    model?: PricingModel
  ): {
    basePrice: number;
    deliveryFee: number;
    platformCommission: number;
    finalPrice: number;
    markup: number;
  } {
    const markup = model?.markup_percentage || 250;
    const deliveryFee = (channel === 'delivery' && model?.delivery_fee) ? model.delivery_fee : 0;
    const commissionRate = model?.platform_commission || 0;

    // Preço base com markup
    const basePrice = baseCost * (markup / 100);
    
    // Aplicar comissão da plataforma se houver
    const priceAfterCommission = commissionRate > 0 
      ? basePrice / (1 - commissionRate / 100)
      : basePrice;
    
    // Preço final incluindo taxa de entrega
    const finalPrice = priceAfterCommission + deliveryFee;

    return {
      basePrice,
      deliveryFee,
      platformCommission: commissionRate,
      finalPrice,
      markup
    };
  }
}

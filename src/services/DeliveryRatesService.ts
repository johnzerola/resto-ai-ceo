
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DeliveryRate {
  id: string;
  restaurant_id: string;
  plataforma: string;
  tipo_taxa: 'percentual' | 'valor_fixo';
  valor_taxa: number;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export class DeliveryRatesService {
  static async getDeliveryRates(restaurantId: string): Promise<DeliveryRate[]> {
    try {
      const { data, error } = await supabase
        .from('taxas_delivery')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('ativa', true)
        .order('plataforma');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao carregar taxas de delivery:', error);
      toast.error('Erro ao carregar taxas de delivery');
      return [];
    }
  }

  static async createDeliveryRate(rate: Omit<DeliveryRate, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('taxas_delivery')
        .insert([rate]);

      if (error) throw error;
      
      toast.success('Taxa de delivery criada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao criar taxa de delivery:', error);
      toast.error('Erro ao criar taxa de delivery');
      return false;
    }
  }

  static async updateDeliveryRate(id: string, updates: Partial<DeliveryRate>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('taxas_delivery')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Taxa de delivery atualizada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar taxa de delivery:', error);
      toast.error('Erro ao atualizar taxa de delivery');
      return false;
    }
  }

  static async deleteDeliveryRate(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('taxas_delivery')
        .update({ ativa: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Taxa de delivery removida com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao remover taxa de delivery:', error);
      toast.error('Erro ao remover taxa de delivery');
      return false;
    }
  }

  static calculatePriceWithDelivery(baseCost: number, markup: number, deliveryRate?: DeliveryRate): {
    basePrice: number;
    deliveryFee: number;
    finalPrice: number;
    commission: number;
  } {
    const basePrice = baseCost * (markup / 100);
    
    if (!deliveryRate) {
      return {
        basePrice,
        deliveryFee: 0,
        finalPrice: basePrice,
        commission: 0
      };
    }

    let commission = 0;
    let finalPrice = basePrice;

    if (deliveryRate.tipo_taxa === 'percentual') {
      commission = basePrice * (deliveryRate.valor_taxa / 100);
      finalPrice = basePrice + commission;
    } else {
      commission = deliveryRate.valor_taxa;
      finalPrice = basePrice + commission;
    }

    return {
      basePrice,
      deliveryFee: commission,
      finalPrice,
      commission
    };
  }
}

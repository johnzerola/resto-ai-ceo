
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

// Enhanced error handling utility
class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string,
    public hint?: string
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Serviço para dados financeiros reais com tratamento de erros aprimorado
export class SupabaseDataService {
  
  private static handleError(error: any, operation: string): never {
    console.error(`Erro em ${operation}:`, error);
    
    let userMessage = 'Ocorreu um erro inesperado';
    
    if (error?.code === '22P02') {
      userMessage = 'ID do restaurante inválido. Verifique se você está logado corretamente.';
    } else if (error?.code === 'PGRST116') {
      userMessage = 'Dados não encontrados para este restaurante.';
    } else if (error?.message?.includes('network')) {
      userMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
    } else if (error?.message) {
      userMessage = error.message;
    }

    toast.error('Erro ao carregar dados', {
      description: userMessage
    });

    throw new SupabaseError(
      userMessage,
      error?.code,
      error?.details,
      error?.hint
    );
  }

  // Obter dados financeiros do restaurante
  static async getRestaurantFinancialData(restaurantId: string): Promise<RestaurantFinancialData[]> {
    try {
      if (!restaurantId || restaurantId === 'default') {
        console.warn('ID do restaurante inválido:', restaurantId);
        return [];
      }

      const { data, error } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        this.handleError(error, 'carregar dados financeiros');
      }

      // Transformar dados do cash_flow em métricas financeiras
      return this.transformCashFlowToFinancialData(data || []);
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      this.handleError(error, 'consulta financeira');
    }
  }

  // Transformar dados de cash flow em métricas
  private static transformCashFlowToFinancialData(cashFlowData: any[]): RestaurantFinancialData[] {
    try {
      if (!Array.isArray(cashFlowData) || cashFlowData.length === 0) {
        return [];
      }

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
          acc[date].revenue += Number(transaction.amount) || 0;
        } else {
          acc[date].costs += Number(transaction.amount) || 0;
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
    } catch (error) {
      console.error('Erro ao transformar dados financeiros:', error);
      return [];
    }
  }

  // Obter dados de estoque
  static async getInventoryData(restaurantId: string) {
    try {
      if (!restaurantId || restaurantId === 'default') {
        console.warn('ID do restaurante inválido para estoque:', restaurantId);
        return [];
      }

      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) {
        this.handleError(error, 'carregar estoque');
      }

      return data || [];
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      this.handleError(error, 'consulta de estoque');
    }
  }

  // Obter metas do restaurante
  static async getRestaurantGoals(restaurantId: string) {
    try {
      if (!restaurantId || restaurantId === 'default') {
        console.warn('ID do restaurante inválido para metas:', restaurantId);
        return [];
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'carregar metas');
      }

      return data || [];
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      this.handleError(error, 'consulta de metas');
    }
  }

  // Salvar modelo de precificação
  static async savePricingModel(pricingData: Omit<PricingModel, 'id' | 'created_at' | 'updated_at'>) {
    try {
      if (!pricingData.restaurant_id) {
        throw new Error('ID do restaurante é obrigatório');
      }

      // Primeiro, tentar atualizar um registro existente
      const { data: existingData, error: selectError } = await supabase
        .from('pricing_models')
        .select('id')
        .eq('restaurant_id', pricingData.restaurant_id)
        .eq('channel', pricingData.channel)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        this.handleError(selectError, 'verificar modelo existente');
      }

      let result;
      if (existingData) {
        // Atualizar registro existente
        const { data, error } = await supabase
          .from('pricing_models')
          .update({
            markup_percentage: pricingData.markup_percentage,
            delivery_fee: pricingData.delivery_fee || 0,
            platform_commission: pricingData.platform_commission || 0,
            is_active: pricingData.is_active
          })
          .eq('id', existingData.id)
          .select()
          .single();

        if (error) {
          this.handleError(error, 'atualizar modelo de precificação');
        }
        result = data;
      } else {
        // Inserir novo registro
        const { data, error } = await supabase
          .from('pricing_models')
          .insert([pricingData])
          .select()
          .single();

        if (error) {
          this.handleError(error, 'inserir modelo de precificação');
        }
        result = data;
      }

      toast.success('Modelo de precificação salvo com sucesso');
      return result;
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      this.handleError(error, 'salvar precificação');
    }
  }

  // Obter modelos de precificação
  static async getPricingModels(restaurantId: string): Promise<PricingModel[]> {
    try {
      if (!restaurantId || restaurantId === 'default') {
        console.warn('ID do restaurante inválido para modelos de precificação:', restaurantId);
        return [];
      }

      const { data, error } = await supabase
        .from('pricing_models')
        .select(`
          id,
          restaurant_id,
          channel,
          markup_percentage,
          delivery_fee,
          platform_commission,
          is_active,
          created_at,
          updated_at
        `)
        .eq('restaurant_id', restaurantId);

      if (error) {
        this.handleError(error, 'carregar modelos de precificação');
      }

      // Mapear os dados para o tipo PricingModel
      return (data || []).map(item => ({
        id: item.id,
        restaurant_id: item.restaurant_id,
        channel: item.channel as PricingModel['channel'],
        markup_percentage: item.markup_percentage,
        delivery_fee: item.delivery_fee,
        platform_commission: item.platform_commission,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      this.handleError(error, 'consulta de precificação');
    }
  }

  // Calcular precificação inteligente baseada no canal
  static calculateChannelPricing(baseCost: number, channel: PricingModel['channel'], pricingModel?: PricingModel) {
    try {
      if (typeof baseCost !== 'number' || baseCost < 0) {
        throw new Error('Custo base deve ser um número positivo');
      }

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
    } catch (error) {
      console.error('Erro no cálculo de precificação:', error);
      toast.error('Erro no cálculo', {
        description: 'Não foi possível calcular o preço. Verifique os dados informados.'
      });
      throw error;
    }
  }

  // Sincronizar dados entre módulos
  static async syncModuleData(restaurantId: string) {
    try {
      if (!restaurantId) {
        throw new Error('ID do restaurante é obrigatório para sincronização');
      }

      console.log('Iniciando sincronização de dados para restaurante:', restaurantId);
      
      // Disparar evento de sincronização
      window.dispatchEvent(new CustomEvent('dataSync', { 
        detail: { restaurantId, timestamp: new Date().toISOString() }
      }));

      return true;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast.error('Erro na sincronização', {
        description: 'Não foi possível sincronizar os dados. Tente novamente.'
      });
      return false;
    }
  }
}

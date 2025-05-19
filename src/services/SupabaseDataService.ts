
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Serviço Base para operações com Supabase
export class SupabaseDataService {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // Função genérica para obter dados de uma tabela
  protected async getAll<T>(restaurantId: string): Promise<T[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('restaurant_id', restaurantId);
      
      if (error) {
        console.error(`Erro ao buscar ${this.tableName}:`, error);
        throw error;
      }
      
      return data as T[];
    } catch (error) {
      console.error(`Erro ao buscar ${this.tableName}:`, error);
      throw error;
    }
  }

  // Função genérica para obter um item por ID
  protected async getById<T>(id: string, restaurantId: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('restaurant_id', restaurantId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return null;
        }
        console.error(`Erro ao buscar ${this.tableName} por ID:`, error);
        throw error;
      }
      
      return data as T;
    } catch (error) {
      console.error(`Erro ao buscar ${this.tableName} por ID:`, error);
      throw error;
    }
  }

  // Função genérica para inserir um item
  protected async insert<T extends { restaurant_id?: string }>(item: T, restaurantId: string): Promise<T> {
    try {
      // Garantir que o item tenha o restaurant_id
      const itemWithRestaurantId = {
        ...item,
        restaurant_id: restaurantId
      };
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([itemWithRestaurantId])
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao inserir ${this.tableName}:`, error);
        throw error;
      }
      
      return data as T;
    } catch (error) {
      console.error(`Erro ao inserir ${this.tableName}:`, error);
      throw error;
    }
  }

  // Função genérica para atualizar um item
  protected async update<T>(id: string, item: Partial<T>, restaurantId: string): Promise<T> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(item)
        .eq('id', id)
        .eq('restaurant_id', restaurantId)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar ${this.tableName}:`, error);
        throw error;
      }
      
      return data as T;
    } catch (error) {
      console.error(`Erro ao atualizar ${this.tableName}:`, error);
      throw error;
    }
  }

  // Função genérica para remover um item
  protected async remove(id: string, restaurantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq('restaurant_id', restaurantId);
      
      if (error) {
        console.error(`Erro ao remover ${this.tableName}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Erro ao remover ${this.tableName}:`, error);
      throw error;
    }
  }
}

// Serviço para gerenciar Fichas Técnicas (receitas)
export class RecipeService extends SupabaseDataService {
  constructor() {
    super('recipes');
  }
  
  async getRecipes(restaurantId: string) {
    return this.getAll(restaurantId);
  }
  
  async getRecipe(id: string, restaurantId: string) {
    return this.getById(id, restaurantId);
  }
  
  async createRecipe(recipe: any, restaurantId: string) {
    return this.insert(recipe, restaurantId);
  }
  
  async updateRecipe(id: string, recipe: any, restaurantId: string) {
    return this.update(id, recipe, restaurantId);
  }
  
  async deleteRecipe(id: string, restaurantId: string) {
    return this.remove(id, restaurantId);
  }
  
  async getRecipeIngredients(recipeId: string, restaurantId: string) {
    try {
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', recipeId);
      
      if (error) {
        console.error('Erro ao buscar ingredientes da receita:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar ingredientes da receita:', error);
      throw error;
    }
  }
  
  async addRecipeIngredient(ingredient: any, recipeId: string) {
    try {
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .insert([{
          ...ingredient,
          recipe_id: recipeId
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao adicionar ingrediente à receita:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao adicionar ingrediente à receita:', error);
      throw error;
    }
  }
  
  async updateRecipeIngredient(id: string, ingredient: any) {
    try {
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .update(ingredient)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar ingrediente:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar ingrediente:', error);
      throw error;
    }
  }
  
  async removeRecipeIngredient(id: string) {
    try {
      const { error } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao remover ingrediente:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao remover ingrediente:', error);
      throw error;
    }
  }
}

// Serviço para gerenciar Estoque
export class InventoryService extends SupabaseDataService {
  constructor() {
    super('inventory');
  }
  
  async getInventoryItems(restaurantId: string) {
    return this.getAll(restaurantId);
  }
  
  async getInventoryItem(id: string, restaurantId: string) {
    return this.getById(id, restaurantId);
  }
  
  async createInventoryItem(item: any, restaurantId: string) {
    return this.insert(item, restaurantId);
  }
  
  async updateInventoryItem(id: string, item: any, restaurantId: string) {
    return this.update(id, item, restaurantId);
  }
  
  async deleteInventoryItem(id: string, restaurantId: string) {
    return this.remove(id, restaurantId);
  }
  
  async getLowStockItems(restaurantId: string) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('restaurant_id', restaurantId)
        .lte('quantity', supabase.raw('minimum_stock'));
      
      if (error) {
        console.error('Erro ao buscar itens com estoque baixo:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar itens com estoque baixo:', error);
      throw error;
    }
  }
}

// Serviço para gerenciar Fluxo de Caixa
export class CashFlowService extends SupabaseDataService {
  constructor() {
    super('cash_flow');
  }
  
  async getCashFlowEntries(restaurantId: string, filters?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    category?: string;
  }) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('restaurant_id', restaurantId);
      
      if (filters) {
        if (filters.startDate) {
          query = query.gte('date', filters.startDate);
        }
        
        if (filters.endDate) {
          query = query.lte('date', filters.endDate);
        }
        
        if (filters.type) {
          query = query.eq('type', filters.type);
        }
        
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
      }
      
      // Ordenar por data (mais recente primeiro)
      query = query.order('date', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar entradas de fluxo de caixa:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar entradas de fluxo de caixa:', error);
      throw error;
    }
  }
  
  async getCashFlowEntry(id: string, restaurantId: string) {
    return this.getById(id, restaurantId);
  }
  
  async createCashFlowEntry(entry: any, restaurantId: string) {
    return this.insert(entry, restaurantId);
  }
  
  async updateCashFlowEntry(id: string, entry: any, restaurantId: string) {
    return this.update(id, entry, restaurantId);
  }
  
  async deleteCashFlowEntry(id: string, restaurantId: string) {
    return this.remove(id, restaurantId);
  }
  
  async getFinancialSummary(restaurantId: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') {
    try {
      let dateFormat = '';
      let groupBy = '';
      
      // Definir formato de data e agrupamento com base no período
      switch (period) {
        case 'daily':
          dateFormat = 'YYYY-MM-DD';
          groupBy = 'date';
          break;
        case 'weekly':
          dateFormat = 'YYYY-"W"IW';
          groupBy = 'to_char(date, \'YYYY-"W"IW\')';
          break;
        case 'monthly':
          dateFormat = 'YYYY-MM';
          groupBy = 'to_char(date, \'YYYY-MM\')';
          break;
        case 'yearly':
          dateFormat = 'YYYY';
          groupBy = 'to_char(date, \'YYYY\')';
          break;
        default:
          dateFormat = 'YYYY-MM';
          groupBy = 'to_char(date, \'YYYY-MM\')';
      }
      
      // Consulta SQL nativa usando a função rpc
      const { data, error } = await supabase.rpc('get_financial_summary', {
        p_restaurant_id: restaurantId,
        p_date_format: dateFormat,
        p_group_by: groupBy
      });
      
      if (error) {
        console.error('Erro ao buscar resumo financeiro:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      throw error;
    }
  }
}

// Serviço para gerenciar Metas e Conquistas
export class GoalsService extends SupabaseDataService {
  constructor() {
    super('goals');
  }
  
  async getGoals(restaurantId: string, category?: string) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('restaurant_id', restaurantId);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar metas:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      throw error;
    }
  }
  
  async getGoal(id: string, restaurantId: string) {
    return this.getById(id, restaurantId);
  }
  
  async createGoal(goal: any, restaurantId: string) {
    return this.insert(goal, restaurantId);
  }
  
  async updateGoal(id: string, goal: any, restaurantId: string) {
    return this.update(id, goal, restaurantId);
  }
  
  async updateGoalProgress(id: string, current: number, restaurantId: string) {
    try {
      const goal = await this.getGoal(id, restaurantId);
      
      if (!goal) {
        throw new Error('Meta não encontrada');
      }
      
      const isCompleted = current >= goal.target;
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ 
          current, 
          completed: isCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('restaurant_id', restaurantId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar progresso da meta:', error);
        throw error;
      }
      
      if (isCompleted && !goal.completed) {
        // Verificar conquistas
        this.checkAchievements(restaurantId);
        toast.success('Meta alcançada!', {
          description: goal.title
        });
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar progresso da meta:', error);
      throw error;
    }
  }
  
  async deleteGoal(id: string, restaurantId: string) {
    return this.remove(id, restaurantId);
  }
  
  async getAchievements(restaurantId: string) {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('restaurant_id', restaurantId);
      
      if (error) {
        console.error('Erro ao buscar conquistas:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error);
      throw error;
    }
  }
  
  async checkAchievements(restaurantId: string) {
    try {
      // Buscar todas as metas completadas
      const { data: completedGoals, error: goalsError } = await supabase
        .from('goals')
        .select('category')
        .eq('restaurant_id', restaurantId)
        .eq('completed', true);
      
      if (goalsError) {
        console.error('Erro ao buscar metas completadas:', goalsError);
        return;
      }
      
      // Buscar todas as conquistas
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('restaurant_id', restaurantId);
      
      if (achievementsError) {
        console.error('Erro ao buscar conquistas:', achievementsError);
        return;
      }
      
      // Contagem de metas completadas por categoria
      const completedByCategory: Record<string, number> = {};
      completedGoals?.forEach(goal => {
        if (!completedByCategory[goal.category]) {
          completedByCategory[goal.category] = 0;
        }
        completedByCategory[goal.category]++;
      });
      
      // Total de metas completadas
      const totalCompleted = completedGoals?.length || 0;
      
      // Verificar conquistas que podem ser desbloqueadas
      let unlocked = false;
      
      for (const achievement of (achievements || [])) {
        if (achievement.is_unlocked) continue;
        
        let shouldUnlock = false;
        
        // Verificar se atende aos critérios
        if (achievement.category === 'financial' && achievement.required_goals && 
            completedByCategory['financial'] >= achievement.required_goals) {
          shouldUnlock = true;
        } else if (achievement.category === 'inventory' && achievement.required_goals && 
                   completedByCategory['inventory'] >= achievement.required_goals) {
          shouldUnlock = true;
        } else if (achievement.category === 'sales' && achievement.required_goals && 
                   completedByCategory['sales'] >= achievement.required_goals) {
          shouldUnlock = true;
        } else if (achievement.category === 'operational' && achievement.required_goals && 
                  totalCompleted >= achievement.required_goals) {
          shouldUnlock = true;
        }
        
        // Desbloquear a conquista se atender aos critérios
        if (shouldUnlock) {
          await supabase
            .from('achievements')
            .update({
              is_unlocked: true,
              date_unlocked: new Date().toISOString()
            })
            .eq('id', achievement.id)
            .eq('restaurant_id', restaurantId);
          
          toast.success('Nova conquista desbloqueada!', {
            description: achievement.name
          });
          
          unlocked = true;
        }
      }
      
      return unlocked;
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      return false;
    }
  }
}

// Serviço para gerenciar configurações do restaurante
export class RestaurantService extends SupabaseDataService {
  constructor() {
    super('restaurants');
  }
  
  async getRestaurantDetails(restaurantId: string) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', restaurantId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar detalhes do restaurante:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar detalhes do restaurante:', error);
      throw error;
    }
  }
  
  async updateRestaurantDetails(restaurantId: string, details: any) {
    try {
      // Adicionar data de atualização
      const updatedDetails = {
        ...details,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updatedDetails)
        .eq('id', restaurantId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar restaurante:', error);
        throw error;
      }
      
      toast.success('Configurações do restaurante atualizadas com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar restaurante:', error);
      toast.error('Erro ao atualizar configurações do restaurante');
      throw error;
    }
  }
  
  async getRestaurantMembers(restaurantId: string) {
    try {
      // Buscar membros do restaurante com informações de perfil
      const { data, error } = await supabase
        .from('restaurant_members')
        .select(`
          id,
          restaurant_id,
          user_id,
          role,
          created_at,
          profiles:user_id (
            name,
            email
          )
        `)
        .eq('restaurant_id', restaurantId);
      
      if (error) {
        console.error('Erro ao buscar membros do restaurante:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar membros do restaurante:', error);
      throw error;
    }
  }
  
  async addRestaurantMember(restaurantId: string, userId: string, role: string) {
    try {
      const { data, error } = await supabase
        .from('restaurant_members')
        .insert([{
          restaurant_id: restaurantId,
          user_id: userId,
          role
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao adicionar membro ao restaurante:', error);
        throw error;
      }
      
      toast.success('Membro adicionado ao restaurante com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao adicionar membro ao restaurante:', error);
      toast.error('Erro ao adicionar membro ao restaurante');
      throw error;
    }
  }
  
  async updateMemberRole(memberId: string, role: string) {
    try {
      const { data, error } = await supabase
        .from('restaurant_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar função do membro:', error);
        throw error;
      }
      
      toast.success('Função do membro atualizada com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar função do membro:', error);
      toast.error('Erro ao atualizar função do membro');
      throw error;
    }
  }
  
  async removeRestaurantMember(memberId: string) {
    try {
      const { error } = await supabase
        .from('restaurant_members')
        .delete()
        .eq('id', memberId);
      
      if (error) {
        console.error('Erro ao remover membro do restaurante:', error);
        throw error;
      }
      
      toast.success('Membro removido do restaurante com sucesso');
    } catch (error) {
      console.error('Erro ao remover membro do restaurante:', error);
      toast.error('Erro ao remover membro do restaurante');
      throw error;
    }
  }
}

// Hook para usar o restaurante atual em componentes
export function useCurrentRestaurant() {
  const { currentRestaurant } = useAuth();
  
  if (!currentRestaurant) {
    throw new Error('Este hook deve ser usado dentro de um componente que tem acesso a um restaurante atual');
  }
  
  return currentRestaurant;
}


import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExpenseCategory {
  id: string;
  restaurant_id: string;
  nome: string;
  tipo: 'despesa_operacional' | 'insumo_cmv' | 'custom';
  impacta_dre: boolean;
  impacta_cmv: boolean;
  cor: string;
  icone: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export class ExpenseCategoriesService {
  static async getCategories(restaurantId: string): Promise<ExpenseCategory[]> {
    try {
      const { data, error } = await supabase
        .from('categorias_despesas')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias de despesas');
      return [];
    }
  }

  static async createCategory(category: Omit<ExpenseCategory, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categorias_despesas')
        .insert([category]);

      if (error) throw error;
      
      toast.success('Categoria criada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
      return false;
    }
  }

  static async updateCategory(id: string, updates: Partial<ExpenseCategory>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categorias_despesas')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Categoria atualizada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
      return false;
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categorias_despesas')
        .update({ ativa: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Categoria removida com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
      toast.error('Erro ao remover categoria');
      return false;
    }
  }
}

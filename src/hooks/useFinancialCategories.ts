import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { createDefaultFinancialCategories } from '@/utils/financial-utils';
import { toast } from 'sonner';

interface FinancialCategory {
  id: string;
  restaurant_id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  impacta_cmv: boolean;
  impacta_dre: boolean;
  cor: string;
  icone: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export function useFinancialCategories() {
  const { currentRestaurant } = useAuth();
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCategories = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;
      
      // Se não há categorias, criar as padrão
      if (!data || data.length === 0) {
        await createDefaultFinancialCategories(currentRestaurant.id);
        
        // Recarregar categorias após criar as padrão
        const { data: newData, error: newError } = await supabase
          .from('categorias_financeiras')
          .select('*')
          .eq('restaurant_id', currentRestaurant.id)
          .eq('ativa', true)
          .order('nome');

        if (newError) throw newError;
        
        const mappedData: FinancialCategory[] = (newData || []).map(item => ({
          ...item,
          tipo: item.tipo as 'receita' | 'despesa'
        }));
        
        setCategories(mappedData);
      } else {
        // Type-safe mapping
        const mappedData: FinancialCategory[] = data.map(item => ({
          ...item,
          tipo: item.tipo as 'receita' | 'despesa'
        }));
        
        setCategories(mappedData);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (category: Omit<FinancialCategory, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>) => {
    if (!currentRestaurant?.id) return false;

    try {
      const { error } = await supabase
        .from('categorias_financeiras')
        .insert({
          restaurant_id: currentRestaurant.id,
          ...category
        });

      if (error) throw error;
      
      await loadCategories();
      toast.success('Categoria adicionada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast.error('Erro ao adicionar categoria');
      return false;
    }
  };

  const updateCategory = async (id: string, updates: Partial<FinancialCategory>) => {
    try {
      const { error } = await supabase
        .from('categorias_financeiras')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await loadCategories();
      toast.success('Categoria atualizada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categorias_financeiras')
        .update({ ativa: false })
        .eq('id', id);

      if (error) throw error;
      
      await loadCategories();
      toast.success('Categoria removida com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
      toast.error('Erro ao remover categoria');
      return false;
    }
  };

  const getIncomeCategories = () => categories.filter(cat => cat.tipo === 'receita');
  const getExpenseCategories = () => categories.filter(cat => cat.tipo === 'despesa');
  const getCMVCategories = () => categories.filter(cat => cat.impacta_cmv);

  useEffect(() => {
    loadCategories();
  }, [currentRestaurant]);

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    getIncomeCategories,
    getExpenseCategories,
    getCMVCategories,
    reloadCategories: loadCategories
  };
}
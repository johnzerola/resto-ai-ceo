
import { useState, useEffect } from 'react';
import { ExpenseCategoriesService, ExpenseCategory } from '@/services/ExpenseCategoriesService';
import { useAuth } from '@/contexts/AuthContext';

export function useExpenseCategories() {
  const { currentRestaurant } = useAuth();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCategories = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      const data = await ExpenseCategoriesService.getCategories(currentRestaurant.id);
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (category: Omit<ExpenseCategory, 'id' | 'created_at' | 'updated_at'>) => {
    const success = await ExpenseCategoriesService.createCategory(category);
    if (success) {
      await loadCategories();
    }
    return success;
  };

  const updateCategory = async (id: string, updates: Partial<ExpenseCategory>) => {
    const success = await ExpenseCategoriesService.updateCategory(id, updates);
    if (success) {
      await loadCategories();
    }
    return success;
  };

  const deleteCategory = async (id: string) => {
    const success = await ExpenseCategoriesService.deleteCategory(id);
    if (success) {
      await loadCategories();
    }
    return success;
  };

  useEffect(() => {
    loadCategories();
  }, [currentRestaurant]);

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    reloadCategories: loadCategories
  };
}

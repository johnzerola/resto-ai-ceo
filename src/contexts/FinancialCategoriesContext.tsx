import React, { createContext, useContext, useCallback } from 'react';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';

interface FinancialCategoriesContextType {
  categories: any[];
  isLoading: boolean;
  getIncomeCategories: () => any[];
  getExpenseCategories: () => any[];
  getCMVCategories: () => any[];
  refreshCategories: () => Promise<void>;
  addCategory: (category: any) => Promise<boolean>;
  updateCategory: (id: string, updates: any) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
}

const FinancialCategoriesContext = createContext<FinancialCategoriesContextType | undefined>(undefined);

export function FinancialCategoriesProvider({ children }: { children: React.ReactNode }) {
  const {
    categories,
    isLoading,
    addCategory: addCategoryHook,
    updateCategory: updateCategoryHook,
    deleteCategory: deleteCategoryHook,
    getIncomeCategories,
    getExpenseCategories,
    getCMVCategories,
    reloadCategories
  } = useFinancialCategories();

  const addCategory = useCallback(async (category: any) => {
    const success = await addCategoryHook(category);
    if (success) {
      // Notificar outros componentes sobre a atualização
      window.dispatchEvent(new CustomEvent('categoriesUpdated'));
    }
    return success;
  }, [addCategoryHook]);

  const updateCategory = useCallback(async (id: string, updates: any) => {
    const success = await updateCategoryHook(id, updates);
    if (success) {
      window.dispatchEvent(new CustomEvent('categoriesUpdated'));
    }
    return success;
  }, [updateCategoryHook]);

  const deleteCategory = useCallback(async (id: string) => {
    const success = await deleteCategoryHook(id);
    if (success) {
      window.dispatchEvent(new CustomEvent('categoriesUpdated'));
    }
    return success;
  }, [deleteCategoryHook]);

  const refreshCategories = useCallback(async () => {
    await reloadCategories();
  }, [reloadCategories]);

  return (
    <FinancialCategoriesContext.Provider
      value={{
        categories,
        isLoading,
        getIncomeCategories,
        getExpenseCategories,
        getCMVCategories,
        refreshCategories,
        addCategory,
        updateCategory,
        deleteCategory
      }}
    >
      {children}
    </FinancialCategoriesContext.Provider>
  );
}

export function useFinancialCategoriesContext() {
  const context = useContext(FinancialCategoriesContext);
  if (context === undefined) {
    throw new Error('useFinancialCategoriesContext must be used within a FinancialCategoriesProvider');
  }
  return context;
}
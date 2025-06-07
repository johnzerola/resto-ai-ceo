
import { useState, useEffect } from "react";

export interface TechnicalSheetData {
  id: string;
  dishName: string;
  dishCode: string;
  category: string;
  description: string;
  ingredients: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    supplier?: string;
  }>;
  wastePercentage: number;
  directOperationalCost: number;
  packagingCost: number;
  fixedCostAllocation: number;
  indirectCosts: number;
  desiredProfitMargin: number;
  currentMenuPrice: number;
  marketComparisonMin: number;
  marketComparisonMax: number;
  preparationTime: number;
  allergens: string[];
  specialInstructions: string;
  notes: string;
  updatedAt: string;
}

export function useTechnicalSheets() {
  const [sheets, setSheets] = useState<Record<string, TechnicalSheetData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = () => {
    try {
      const storedSheets = localStorage.getItem("technicalSheets");
      if (storedSheets) {
        setSheets(JSON.parse(storedSheets));
      }
    } catch (error) {
      console.error("Erro ao carregar fichas técnicas:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSheet = (sheetId: string, data: Omit<TechnicalSheetData, 'id' | 'updatedAt'>) => {
    const sheetData: TechnicalSheetData = {
      ...data,
      id: sheetId,
      updatedAt: new Date().toISOString()
    };

    const updatedSheets = {
      ...sheets,
      [sheetId]: sheetData
    };

    setSheets(updatedSheets);
    localStorage.setItem("technicalSheets", JSON.stringify(updatedSheets));
    
    // Disparar evento para sincronização
    window.dispatchEvent(new CustomEvent('technicalSheetUpdated', { 
      detail: { id: sheetId, data: sheetData }
    }));
  };

  const getSheet = (sheetId: string): TechnicalSheetData | null => {
    return sheets[sheetId] || null;
  };

  const deleteSheet = (sheetId: string) => {
    const updatedSheets = { ...sheets };
    delete updatedSheets[sheetId];
    
    setSheets(updatedSheets);
    localStorage.setItem("technicalSheets", JSON.stringify(updatedSheets));
  };

  const hasSheet = (sheetId: string): boolean => {
    return !!sheets[sheetId];
  };

  const getAllSheets = (): TechnicalSheetData[] => {
    return Object.values(sheets);
  };

  // Calcular estatísticas gerais
  const getStats = () => {
    const allSheets = getAllSheets();
    
    const totalSheets = allSheets.length;
    const averageFoodCost = allSheets.length > 0 
      ? allSheets.reduce((sum, sheet) => {
          const ingredientCost = sheet.ingredients.reduce((iSum, ing) => iSum + ing.totalCost, 0);
          const foodCostPercentage = sheet.currentMenuPrice > 0 ? (ingredientCost / sheet.currentMenuPrice) * 100 : 0;
          return sum + foodCostPercentage;
        }, 0) / allSheets.length
      : 0;

    const highFoodCostItems = allSheets.filter(sheet => {
      const ingredientCost = sheet.ingredients.reduce((sum, ing) => sum + ing.totalCost, 0);
      const foodCostPercentage = sheet.currentMenuPrice > 0 ? (ingredientCost / sheet.currentMenuPrice) * 100 : 0;
      return foodCostPercentage > 30;
    });

    return {
      totalSheets,
      averageFoodCost,
      highFoodCostItems: highFoodCostItems.length,
      completionRate: totalSheets > 0 ? (allSheets.filter(s => s.ingredients.length > 0).length / totalSheets) * 100 : 0
    };
  };

  return {
    sheets,
    loading,
    saveSheet,
    getSheet,
    deleteSheet,
    hasSheet,
    getAllSheets,
    getStats,
    loadSheets
  };
}

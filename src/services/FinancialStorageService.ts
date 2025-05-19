
import { toast } from "sonner";
import { FinancialData } from "@/types/financial-data";
import { createEmptyFinancialData, dispatchFinancialDataEvent } from "@/utils/financial-utils";

/**
 * Obter dados financeiros do localStorage
 */
export function getFinancialData(): FinancialData {
  try {
    const savedData = localStorage.getItem("financialData");
    if (savedData) {
      return JSON.parse(savedData);
    } else {
      return createEmptyFinancialData();
    }
  } catch (error) {
    console.error("Erro ao obter dados financeiros:", error);
    toast.error("Erro ao carregar dados financeiros");
    return createEmptyFinancialData();
  }
}

/**
 * Salvar dados financeiros no localStorage
 */
export function saveFinancialData(data: FinancialData): void {
  try {
    localStorage.setItem("financialData", JSON.stringify(data));
    dispatchFinancialDataEvent();
  } catch (error) {
    console.error("Erro ao salvar dados financeiros:", error);
    toast.error("Erro ao salvar dados financeiros");
  }
}

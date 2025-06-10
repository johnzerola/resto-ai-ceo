
import { dataService } from './DataService';
import { financialValueSchema, secureTextSchema } from '@/utils/validation';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  minimum_stock?: number;
  category?: string;
  restaurant_id: string;
  created_at?: string;
  updated_at?: string;
}

export class InventoryDataService {
  static async getInventoryData(restaurantId: string): Promise<InventoryItem[]> {
    return dataService.query<InventoryItem>('inventory', {
      filters: { restaurant_id: restaurantId },
      orderBy: { column: 'name', ascending: true },
      useCache: true,
      cacheTtl: 60000 // 1 minuto para inventário
    });
  }

  static async addInventoryItem(
    restaurantId: string,
    item: Omit<InventoryItem, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>
  ): Promise<InventoryItem | null> {
    // Validate inputs
    const validatedItem = {
      name: secureTextSchema.parse(item.name),
      quantity: financialValueSchema.parse(item.quantity),
      unit: secureTextSchema.parse(item.unit),
      cost_per_unit: financialValueSchema.parse(item.cost_per_unit),
      minimum_stock: item.minimum_stock ? financialValueSchema.parse(item.minimum_stock) : undefined,
      category: item.category ? secureTextSchema.parse(item.category) : undefined
    };

    return dataService.insert<InventoryItem>('inventory', {
      ...validatedItem,
      restaurant_id: restaurantId
    });
  }

  static async updateInventoryItem(
    id: string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryItem | null> {
    // Validate updates
    const validatedUpdates: Partial<InventoryItem> = {};
    
    if (updates.name) validatedUpdates.name = secureTextSchema.parse(updates.name);
    if (updates.quantity !== undefined) validatedUpdates.quantity = financialValueSchema.parse(updates.quantity);
    if (updates.unit) validatedUpdates.unit = secureTextSchema.parse(updates.unit);
    if (updates.cost_per_unit !== undefined) validatedUpdates.cost_per_unit = financialValueSchema.parse(updates.cost_per_unit);
    if (updates.minimum_stock !== undefined) validatedUpdates.minimum_stock = financialValueSchema.parse(updates.minimum_stock);
    if (updates.category) validatedUpdates.category = secureTextSchema.parse(updates.category);

    return dataService.update<InventoryItem>('inventory', id, validatedUpdates);
  }

  static async deleteInventoryItem(id: string): Promise<boolean> {
    return dataService.delete('inventory', id);
  }

  // Analytics methods
  static getLowStockItems(items: InventoryItem[]): InventoryItem[] {
    return items.filter(item => 
      item.minimum_stock && item.quantity <= item.minimum_stock
    );
  }

  static calculateTotalInventoryValue(items: InventoryItem[]): number {
    return items.reduce((total, item) => 
      total + (item.quantity * item.cost_per_unit), 0
    );
  }

  static getInventoryByCategory(items: InventoryItem[]): Record<string, InventoryItem[]> {
    const categorized: Record<string, InventoryItem[]> = {};
    
    items.forEach(item => {
      const category = item.category || 'Sem Categoria';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(item);
    });

    return categorized;
  }

  // Bulk operations
  static async updateMultipleQuantities(
    updates: Array<{ id: string; quantity: number }>
  ): Promise<boolean> {
    try {
      const promises = updates.map(update => 
        this.updateInventoryItem(update.id, { quantity: update.quantity })
      );
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar quantidades em lote:', error);
      return false;
    }
  }
}

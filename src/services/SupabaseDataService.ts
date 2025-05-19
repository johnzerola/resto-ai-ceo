
import { supabase, TableName, TableRow, TableInsert, TableUpdate, isValidTableName, ValidTableName } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Service for Supabase data operations
 */
class SupabaseDataService {

  /**
   * Fetches all records from a table with optional filters
   */
  async getAll<T extends ValidTableName>(
    table: T,
    filters?: Record<string, any>
  ): Promise<TableRow<T>[]> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }

      let query = supabase.from(table).select();
      
      // Apply filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return (data || []) as TableRow<T>[];
    } catch (error) {
      console.error(`Error fetching data from table ${table}:`, error);
      toast.error(`Error loading data: ${(error as Error).message}`);
      return [];
    }
  }
  
  /**
   * Fetches a record by ID
   */
  async getById<T extends ValidTableName>(
    table: T,
    id: string
  ): Promise<TableRow<T> | null> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      
      const { data, error } = await supabase
        .from(table)
        .select()
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as TableRow<T>;
    } catch (error) {
      console.error(`Error fetching record from table ${table}:`, error);
      toast.error(`Error loading data: ${(error as Error).message}`);
      return null;
    }
  }
  
  /**
   * Creates records
   */
  async create<T extends ValidTableName>(
    table: T,
    records: TableInsert<T> | TableInsert<T>[]
  ): Promise<TableRow<T>[]> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      
      const { data, error } = await supabase
        .from(table)
        .insert(records)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success('Data saved successfully');
      return (data || []) as TableRow<T>[];
    } catch (error) {
      console.error(`Error creating records in table ${table}:`, error);
      toast.error(`Error saving data: ${(error as Error).message}`);
      return [];
    }
  }
  
  /**
   * Updates a record
   */
  async update<T extends ValidTableName>(
    table: T,
    id: string,
    data: TableUpdate<T>
  ): Promise<TableRow<T> | null> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      
      const { data: updatedData, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success('Data updated successfully');
      return updatedData as TableRow<T>;
    } catch (error) {
      console.error(`Error updating record in table ${table}:`, error);
      toast.error(`Error updating data: ${(error as Error).message}`);
      return null;
    }
  }
  
  /**
   * Deletes a record
   */
  async delete<T extends ValidTableName>(table: T, id: string): Promise<boolean> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Record deleted successfully');
      return true;
    } catch (error) {
      console.error(`Error deleting record from table ${table}:`, error);
      toast.error(`Error deleting record: ${(error as Error).message}`);
      return false;
    }
  }
}

// Export singleton instance
export const supabaseDataService = new SupabaseDataService();

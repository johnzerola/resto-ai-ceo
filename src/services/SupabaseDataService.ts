
import { supabase, isValidTableName } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables, TableName } from "@/integrations/supabase/client";

// Error handling function for Supabase operations
function handleSupabaseError(operation: string, error: any) {
  console.error(`Error ${operation}:`, error);
  toast.error(`Error ${operation}: ${error.message || 'Unknown error'}`);
  return null;
}

// Define interfaces for reusable SupabaseDataService operations
export interface Entity {
  id?: string;
  [key: string]: any;
}

// Service for basic CRUD operations with Supabase
export const SupabaseDataService = {
  /**
   * Fetches all records from a table
   * @param tableName The name of the table
   * @param options Query options like filters
   * @returns Array of records or empty array on error
   */
  async getAll<T extends TableName>(
    tableName: T, 
    options: {
      filters?: Array<{column: string; value: any}>;
      orderBy?: {column: string; ascending?: boolean};
    } = {}
  ): Promise<Array<Tables[T]['Row']>> {
    try {
      if (!isValidTableName(tableName)) {
        throw new Error(`Invalid table name: ${tableName}`);
      }

      let query = supabase
        .from(tableName)
        .select('*');

      // Apply filters if provided
      if (options.filters && options.filters.length > 0) {
        options.filters.forEach(filter => {
          query = query.eq(filter.column, filter.value);
        });
      }

      // Apply ordering if provided
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Use type assertion with unknown as intermediate step to satisfy TypeScript
      return (data as unknown) as Array<Tables[T]['Row']>;
    } catch (error: any) {
      console.error(`Error fetching records from ${tableName}:`, error);
      return [];
    }
  },

  /**
   * Fetches a single record by ID
   * @param tableName The name of the table
   * @param id The ID of the record
   * @returns The record or null on error
   */
  async getById<T extends TableName>(
    tableName: T, 
    id: string
  ): Promise<Tables[T]['Row'] | null> {
    try {
      if (!isValidTableName(tableName)) {
        throw new Error(`Invalid table name: ${tableName}`);
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id as any) // Use type assertion to fix the string assignment error
        .maybeSingle();
      
      if (error) throw error;
      
      // Use type assertion with unknown as intermediate step to satisfy TypeScript
      return (data as unknown) as Tables[T]['Row'] | null;
    } catch (error: any) {
      return handleSupabaseError(`fetching record from ${tableName}`, error);
    }
  },

  /**
   * Creates a new record
   * @param tableName The name of the table
   * @param record The record to create
   * @returns The created record or null on error
   */
  async create<T extends TableName>(
    tableName: T, 
    record: Tables[T]['Insert']
  ): Promise<Tables[T]['Row'] | null> {
    try {
      if (!isValidTableName(tableName)) {
        throw new Error(`Invalid table name: ${tableName}`);
      }

      // Force any type here to handle complex nested typings
      const { data, error } = await supabase
        .from(tableName)
        .insert([record as any])
        .select()
        .maybeSingle();
      
      if (error) throw error;
      
      toast.success('Record created successfully');
      // Use type assertion with unknown as intermediate step to satisfy TypeScript
      return (data as unknown) as Tables[T]['Row'] | null;
    } catch (error: any) {
      return handleSupabaseError(`creating record in ${tableName}`, error);
    }
  },

  /**
   * Updates an existing record
   * @param tableName The name of the table
   * @param id The ID of the record to update
   * @param updates The updates to apply
   * @returns The updated record or null on error
   */
  async update<T extends TableName>(
    tableName: T, 
    id: string, 
    updates: Tables[T]['Update']
  ): Promise<Tables[T]['Row'] | null> {
    try {
      if (!isValidTableName(tableName)) {
        throw new Error(`Invalid table name: ${tableName}`);
      }

      const { data, error } = await supabase
        .from(tableName)
        .update(updates as any) // Use type assertion to fix complex type issues
        .eq('id', id as any) // Use type assertion to fix the string assignment error
        .select()
        .maybeSingle();
      
      if (error) throw error;
      
      toast.success('Record updated successfully');
      // Use type assertion with unknown as intermediate step to satisfy TypeScript
      return (data as unknown) as Tables[T]['Row'] | null;
    } catch (error: any) {
      return handleSupabaseError(`updating record in ${tableName}`, error);
    }
  },

  /**
   * Deletes a record
   * @param tableName The name of the table
   * @param id The ID of the record to delete
   * @returns True on success, false on error
   */
  async delete(tableName: TableName, id: string): Promise<boolean> {
    try {
      if (!isValidTableName(tableName)) {
        throw new Error(`Invalid table name: ${tableName}`);
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id as any); // Use type assertion to fix the string assignment error
      
      if (error) throw error;
      
      toast.success('Record deleted successfully');
      return true;
    } catch (error: any) {
      console.error(`Error deleting record from ${tableName}:`, error);
      toast.error(`Error deleting record: ${error.message || 'Unknown error'}`);
      return false;
    }
  },

  /**
   * Custom query for more complex operations
   * @param callback Function that performs the query
   * @returns Result of the callback or null on error
   */
  async customQuery<T>(callback: () => Promise<T>): Promise<T | null> {
    try {
      return await callback();
    } catch (error: any) {
      console.error('Error in custom query:', error);
      toast.error(`Error: ${error.message || 'Unknown error'}`);
      return null;
    }
  }
};

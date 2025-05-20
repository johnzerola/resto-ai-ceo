
import { supabase, TableName, TableRow, TableInsert, TableUpdate, isValidTableName, ValidTableName, getTableQueryBuilder } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Helper function to check if an object has an id property of type string
 */
function hasId(obj: any): obj is { id: string } {
  return obj && typeof obj === 'object' && 'id' in obj && typeof obj.id === 'string';
}

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
  ): Promise<any[]> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }

      let query = getTableQueryBuilder(table).select();
      
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
      
      // Using type assertion to avoid deep type instantiation
      return (data || []) as any;
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
  ): Promise<any | null> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      
      const { data, error } = await getTableQueryBuilder(table)
        .select()
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as any;
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
    records: any | any[]
  ): Promise<any[]> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      
      const { data, error } = await getTableQueryBuilder(table)
        .insert(records)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success('Data saved successfully');
      return (data || []) as any;
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
    data: any
  ): Promise<any | null> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      
      const { data: updatedData, error } = await getTableQueryBuilder(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success('Data updated successfully');
      return updatedData as any;
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
      
      const { error } = await getTableQueryBuilder(table)
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
  
  /**
   * Upload a file to storage
   */
  async uploadFile(
    restaurantId: string,
    filePath: string,
    file: File
  ): Promise<string | null> {
    try {
      const path = `${restaurantId}/${filePath}`;
      const { data, error } = await supabase.storage
        .from('restaurant_files')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }

      const fileUrl = `${supabase.storage.from('restaurant_files').getPublicUrl(path).data.publicUrl}`;
      return fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Error uploading file: ${(error as Error).message}`);
      return null;
    }
  }
  
  /**
   * Create a payment record
   * This method is prepared for future integration with actual payment processing
   */
  async createPayment(
    restaurantId: string, 
    amount: number, 
    paymentMethod: string,
    metadata?: Record<string, any>
  ): Promise<string | null> {
    try {
      // Get current user id
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const payment = {
        restaurant_id: restaurantId,
        user_id: userId,
        amount,
        payment_method: paymentMethod,
        description: "Payment transaction",
        due_date: new Date().toISOString(),
        status: "pending",
        type: "payable",
        category: "outros",
        metadata
      };

      const result = await getTableQueryBuilder('payments')
        .insert(payment)
        .select();
      
      if (result.error) {
        throw result.error;
      }
      
      // Safely extract firstItem and check if it has an id property
      const firstItem = Array.isArray(result.data) && result.data.length > 0 ? result.data[0] : null;
      
      if (hasId(firstItem)) {
        toast.success('Payment record created');
        return firstItem.id;
      }
      
      toast.success('Payment record created');
      return null;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(`Error creating payment: ${(error as Error).message}`);
      return null;
    }
  }
}

// Export singleton instance
export const supabaseDataService = new SupabaseDataService();

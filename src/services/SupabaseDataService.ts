
import { supabase, TableName, TableRow, TableInsert, TableUpdate, isValidTableName, ValidTableName, ExtendedTableName } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Service for Supabase data operations
 */
class SupabaseDataService {

  /**
   * Fetches all records from a table with optional filters
   */
  async getAll<T extends ExtendedTableName>(
    table: T,
    filters?: Record<string, any>
  ): Promise<any[]> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }

      let query = supabase.from(table as any).select();
      
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
      
      return (data || []) as any[];
    } catch (error) {
      console.error(`Error fetching data from table ${table}:`, error);
      toast.error(`Error loading data: ${(error as Error).message}`);
      return [];
    }
  }
  
  /**
   * Fetches a record by ID
   */
  async getById<T extends ExtendedTableName>(
    table: T,
    id: string
  ): Promise<any | null> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      
      const { data, error } = await supabase
        .from(table as any)
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
  async create<T extends ExtendedTableName>(
    table: T,
    records: any | any[]
  ): Promise<any[]> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      
      const { data, error } = await supabase
        .from(table as any)
        .insert(records as any)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success('Data saved successfully');
      return (data || []) as any[];
    } catch (error) {
      console.error(`Error creating records in table ${table}:`, error);
      toast.error(`Error saving data: ${(error as Error).message}`);
      return [];
    }
  }
  
  /**
   * Updates a record
   */
  async update<T extends ExtendedTableName>(
    table: T,
    id: string,
    data: any
  ): Promise<any | null> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      
      const { data: updatedData, error } = await supabase
        .from(table as any)
        .update(data as any)
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
  async delete<T extends ExtendedTableName>(table: T, id: string): Promise<boolean> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      
      const { error } = await supabase
        .from(table as any)
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

      const result = await supabase
        .from('payments' as any)
        .insert({
          restaurant_id: restaurantId,
          user_id: userId,
          amount,
          payment_method: paymentMethod,
          metadata
        })
        .select();
      
      if (result.error) {
        throw result.error;
      }
      
      // Added proper type checking and error handling
      if (result.data && 
          Array.isArray(result.data) && 
          result.data.length > 0 && 
          typeof result.data[0] === 'object' && 
          result.data[0] !== null && 
          'id' in result.data[0]) {
        
        toast.success('Payment record created');
        // Use non-null assertion since we've already checked that it's not null
        return String(result.data[0]!.id);
      } else {
        toast.success('Payment record created');
        return null;
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(`Error creating payment: ${(error as Error).message}`);
      return null;
    }
  }
}

// Export singleton instance
export const supabaseDataService = new SupabaseDataService();


import { supabase, TableNames, TableRow, isValidTableName } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Serviço para operações com Supabase
 */
class SupabaseDataService {

  /**
   * Busca todos os registros de uma tabela com filtro opcional
   */
  async getAll<T extends TableNames>(
    table: T,
    filters?: Record<string, any>
  ): Promise<TableRow<T>[]> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Nome de tabela inválido: ${table}`);
      }

      let query = supabase.from(table).select();
      
      // Aplicar filtros se fornecidos
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data as TableRow<T>[];
    } catch (error) {
      console.error(`Erro ao buscar dados da tabela ${table}:`, error);
      toast.error(`Erro ao carregar dados: ${(error as Error).message}`);
      return [];
    }
  }
  
  /**
   * Busca um registro específico por ID
   */
  async getById<T extends TableNames>(
    table: T,
    id: string
  ): Promise<TableRow<T> | null> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Nome de tabela inválido: ${table}`);
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
      console.error(`Erro ao buscar registro da tabela ${table}:`, error);
      toast.error(`Erro ao carregar dados: ${(error as Error).message}`);
      return null;
    }
  }
  
  /**
   * Cria novos registros
   */
  async create<T extends TableNames>(
    table: T,
    records: Partial<TableRow<T>> | Partial<TableRow<T>>[]
  ): Promise<TableRow<T>[]> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Nome de tabela inválido: ${table}`);
      }
      
      const { data, error } = await supabase
        .from(table)
        .insert(records)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success('Dados salvos com sucesso');
      return data as TableRow<T>[];
    } catch (error) {
      console.error(`Erro ao criar registros na tabela ${table}:`, error);
      toast.error(`Erro ao salvar dados: ${(error as Error).message}`);
      return [];
    }
  }
  
  /**
   * Atualiza um registro existente
   */
  async update<T extends TableNames>(
    table: T,
    id: string,
    data: Partial<TableRow<T>>
  ): Promise<TableRow<T> | null> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Nome de tabela inválido: ${table}`);
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
      
      toast.success('Dados atualizados com sucesso');
      return updatedData as TableRow<T>;
    } catch (error) {
      console.error(`Erro ao atualizar registro na tabela ${table}:`, error);
      toast.error(`Erro ao atualizar dados: ${(error as Error).message}`);
      return null;
    }
  }
  
  /**
   * Remove um registro
   */
  async delete<T extends TableNames>(table: T, id: string): Promise<boolean> {
    try {
      if (!isValidTableName(table)) {
        throw new Error(`Nome de tabela inválido: ${table}`);
      }
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Registro removido com sucesso');
      return true;
    } catch (error) {
      console.error(`Erro ao remover registro da tabela ${table}:`, error);
      toast.error(`Erro ao remover dados: ${(error as Error).message}`);
      return false;
    }
  }
}

// Exportar instância única
export const supabaseDataService = new SupabaseDataService();

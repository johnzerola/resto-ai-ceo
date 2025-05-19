
import { supabase, isValidTableName, TableNames } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

// Tipos genéricos para facilitar a tipagem
export type TableRow<T extends TableNames> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends TableNames> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends TableNames> = Database['public']['Tables'][T]['Update'];

export class SupabaseDataService {
  /**
   * Busca dados de uma tabela específica
   */
  static async fetchData<T extends TableNames>(
    tableName: T,
    filters?: Record<string, any>
  ): Promise<TableRow<T>[]> {
    try {
      if (!isValidTableName(tableName)) {
        throw new Error(`Nome de tabela inválido: ${tableName}`);
      }

      let query = supabase.from(tableName).select('*');

      // Aplicar filtros se fornecidos
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TableRow<T>[];
    } catch (error) {
      console.error(`Erro ao buscar dados da tabela ${tableName}:`, error);
      toast.error(`Erro ao carregar dados: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Busca um único registro por ID
   */
  static async fetchById<T extends TableNames>(
    tableName: T,
    id: string
  ): Promise<TableRow<T> | null> {
    try {
      if (!isValidTableName(tableName)) {
        throw new Error(`Nome de tabela inválido: ${tableName}`);
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as TableRow<T>;
    } catch (error) {
      console.error(`Erro ao buscar registro por ID na tabela ${tableName}:`, error);
      return null;
    }
  }

  /**
   * Insere múltiplos registros em uma tabela
   */
  static async insertMany<T extends TableNames>(
    tableName: T,
    records: TableInsert<T>[]
  ): Promise<TableRow<T>[]> {
    try {
      if (!isValidTableName(tableName)) {
        throw new Error(`Nome de tabela inválido: ${tableName}`);
      }

      const { data, error } = await supabase
        .from(tableName)
        .insert(records as any)
        .select();

      if (error) throw error;
      return data as TableRow<T>[];
    } catch (error) {
      console.error(`Erro ao inserir registros na tabela ${tableName}:`, error);
      toast.error(`Erro ao salvar dados: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Insere um único registro em uma tabela
   */
  static async insert<T extends TableNames>(
    tableName: T,
    record: TableInsert<T>
  ): Promise<TableRow<T> | null> {
    try {
      if (!isValidTableName(tableName)) {
        throw new Error(`Nome de tabela inválido: ${tableName}`);
      }

      const { data, error } = await supabase
        .from(tableName)
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as TableRow<T>;
    } catch (error) {
      console.error(`Erro ao inserir registro na tabela ${tableName}:`, error);
      toast.error(`Erro ao salvar dados: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Atualiza um registro existente
   */
  static async update<T extends TableNames>(
    tableName: T,
    id: string,
    record: TableUpdate<T>
  ): Promise<TableRow<T> | null> {
    try {
      if (!isValidTableName(tableName)) {
        throw new Error(`Nome de tabela inválido: ${tableName}`);
      }

      const { data, error } = await supabase
        .from(tableName)
        .update(record as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TableRow<T>;
    } catch (error) {
      console.error(`Erro ao atualizar registro na tabela ${tableName}:`, error);
      toast.error(`Erro ao atualizar dados: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Remove um registro
   */
  static async delete<T extends TableNames>(
    tableName: T,
    id: string
  ): Promise<boolean> {
    try {
      if (!isValidTableName(tableName)) {
        throw new Error(`Nome de tabela inválido: ${tableName}`);
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erro ao excluir registro na tabela ${tableName}:`, error);
      toast.error(`Erro ao excluir dados: ${(error as Error).message}`);
      return false;
    }
  }
}

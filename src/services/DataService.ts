
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DataServiceConfig {
  retryAttempts: number;
  timeout: number;
  cacheTimeout: number;
}

export class DataService {
  private static instance: DataService;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private config: DataServiceConfig = {
    retryAttempts: 3,
    timeout: 5000,
    cacheTimeout: 60000 // 1 minuto
  };

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private getCacheKey(table: string, filters: Record<string, any> = {}): string {
    return `${table}_${JSON.stringify(filters)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.config.cacheTimeout): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  async query<T>(
    table: string, 
    options: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      useCache?: boolean;
      cacheTtl?: number;
    } = {}
  ): Promise<T[]> {
    const { select = '*', filters = {}, orderBy, limit, useCache = true, cacheTtl } = options;
    const cacheKey = this.getCacheKey(table, { select, filters, orderBy, limit });

    // Check cache first
    if (useCache) {
      const cached = this.getFromCache<T[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      let query = supabase.from(table).select(select);
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      const result = data as T[] || [];
      
      // Cache the result
      if (useCache) {
        this.setCache(cacheKey, result, cacheTtl);
      }

      return result;
    } catch (error) {
      console.error(`Erro ao consultar ${table}:`, error);
      toast.error(`Erro ao carregar dados de ${table}`);
      return [];
    }
  }

  async insert<T>(table: string, data: Partial<T>): Promise<T | null> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      // Invalidate related cache
      this.invalidateTableCache(table);
      
      return result as T;
    } catch (error) {
      console.error(`Erro ao inserir em ${table}:`, error);
      toast.error(`Erro ao salvar dados`);
      return null;
    }
  }

  async update<T>(
    table: string, 
    id: string, 
    data: Partial<T>
  ): Promise<T | null> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Invalidate related cache
      this.invalidateTableCache(table);
      
      return result as T;
    } catch (error) {
      console.error(`Erro ao atualizar ${table}:`, error);
      toast.error(`Erro ao atualizar dados`);
      return null;
    }
  }

  async delete(table: string, id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalidate related cache
      this.invalidateTableCache(table);
      
      return true;
    } catch (error) {
      console.error(`Erro ao deletar de ${table}:`, error);
      toast.error(`Erro ao deletar dados`);
      return false;
    }
  }

  private invalidateTableCache(table: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.startsWith(`${table}_`)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Method to get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const dataService = DataService.getInstance();

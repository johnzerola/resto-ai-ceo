
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://llndccqumkrblpgystom.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbmRjY3F1bWtyYmxwZ3lzdG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODY0MjEsImV4cCI6MjA2MzI2MjQyMX0.S7ZQsVYN3XGEZXhWiePrNm50jvvCLwyKNVjTm-SPfcQ";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true
    }
  }
);

// Helper types for better type safety
export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables;
export type TableRow<T extends TableName> = Tables[T]['Row'];
export type TableInsert<T extends TableName> = Tables[T]['Insert'];
export type TableUpdate<T extends TableName> = Tables[T]['Update'];

// Validate table name function with proper typing
export function isValidTableName(tableName: string): tableName is TableName {
  const validTables: string[] = [
    'restaurants',
    'recipes',
    'achievements',
    'cash_flow',
    'goals',
    'inventory',
    'profiles',
    'recipe_ingredients',
    'restaurant_members'
  ];
  
  return validTables.includes(tableName);
}

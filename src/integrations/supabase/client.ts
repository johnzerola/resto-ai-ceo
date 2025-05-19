
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

// Helper types for better type safety - refined to be more specific
export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables;

// Define table row types more precisely
export type TableRow<T extends TableName> = Tables[T]['Row'];
export type TableInsert<T extends TableName> = Tables[T]['Insert'];
export type TableUpdate<T extends TableName> = Tables[T]['Update'];

// Valid table names as a constant array for type checking
const VALID_TABLES = [
  'achievements',
  'cash_flow',
  'goals',
  'inventory',
  'payments',
  'profiles',
  'recipe_ingredients',
  'recipes',
  'restaurant_members',
  'restaurants'
] as const;

// Type for valid table names
export type ValidTableName = typeof VALID_TABLES[number];

// Validate table name function with proper typing
export function isValidTableName(tableName: string): tableName is ValidTableName {
  return VALID_TABLES.includes(tableName as ValidTableName);
}

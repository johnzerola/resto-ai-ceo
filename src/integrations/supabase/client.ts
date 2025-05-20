
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

// Define table row types
export type TableRow<T extends TableName> = Tables[T]['Row'];
export type TableInsert<T extends TableName> = Tables[T]['Insert'];
export type TableUpdate<T extends TableName> = Tables[T]['Update'];

// Valid table names as a constant array for type checking
export const VALID_TABLES = [
  'achievements',
  'cash_flow',
  'goals',
  'inventory',
  'profiles',
  'recipe_ingredients',
  'recipes',
  'restaurant_members',
  'restaurants'
] as const;

// Create a union type for valid tables
export type ValidTableName = typeof VALID_TABLES[number];

// Since the payments table doesn't exist in the Database type yet but we need to use it,
// let's create a special type for handling it temporarily until the database schema is updated
export type PaymentsTableName = 'payments';
export type AnyTableName = ValidTableName | PaymentsTableName;

// Validate table name function with proper typing
export function isValidTableName(tableName: string): tableName is ValidTableName | PaymentsTableName {
  return [...VALID_TABLES, 'payments'].includes(tableName as any);
}

// Helper function for type-safe table access
export function getTableQueryBuilder<T extends ValidTableName>(tableName: T) {
  return supabase.from(tableName);
}

// Special case for payments table
export function getPaymentsTableQueryBuilder() {
  return supabase.from('payments');
}

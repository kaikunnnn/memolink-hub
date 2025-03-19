
import { createClient } from '@supabase/supabase-js';

// Get environment variables or use placeholders
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if both URL and key are available
const hasValidConfig = !!supabaseUrl && !!supabaseAnonKey;

// Create supabase client only if properly configured
export const supabase = hasValidConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // This is a workaround for TypeScript, the null will be checked before use

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return hasValidConfig;
};


import { createClient } from '@supabase/supabase-js';

// Set the actual Supabase URL and key
const supabaseUrl = 'https://ilivrqeopiinyuqkkgwx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaXZycWVvcGlpbnl1cWtrZ3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNzE4NjUsImV4cCI6MjA1Nzk0Nzg2NX0.fnV4VXZ9MqlWWP-FcqFYEolehyrT7V77Yingc4hvwkc';

// Always configured since we're providing hardcoded values
const hasValidConfig = true;

// Create supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return hasValidConfig;
};

// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ilivrqeopiinyuqkkgwx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaXZycWVvcGlpbnl1cWtrZ3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNzE4NjUsImV4cCI6MjA1Nzk0Nzg2NX0.fnV4VXZ9MqlWWP-FcqFYEolehyrT7V77Yingc4hvwkc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase client instance.
 * Returns null if credentials are not configured — the app falls back to seed data.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project')
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Check if Supabase is properly configured.
 */
export const isSupabaseConfigured = () => supabase !== null;

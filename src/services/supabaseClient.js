import { createClient } from '@supabase/supabase-js';

const getEnvVar = (viteKey, nodeKey, fallback = '') => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[viteKey] || process.env[nodeKey] || fallback;
  }
  return fallback;
};

export const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'SUPABASE_URL', 'https://rewguroxxexcboxoywdt.supabase.co');
export const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY', 'sb_publishable_JI9lDRqrKsWKNcWAgj7c0g__GMXVhep');

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export default supabase;

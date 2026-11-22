import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  'https://rewguroxxexcboxoywdt.supabase.co';

const supabaseKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_JI9lDRqrKsWKNcWAgj7c0g__GMXVhep';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey
  );

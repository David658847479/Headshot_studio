import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!SUPABASE_URL) {
  throw new Error(
    "Falta la variable de entorno VITE_SUPABASE_URL. Define la URL del proyecto de Supabase en tu archivo .env."
  );
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Falta la variable de entorno VITE_SUPABASE_PUBLISHABLE_KEY. Copia la clave pública (anon) de Supabase en tu archivo .env."
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { storage: localStorage, persistSession: true, autoRefreshToken: true }
});

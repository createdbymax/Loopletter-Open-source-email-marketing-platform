// Re-export client-side Supabase functionality
export { supabase, createClerkSupabaseClient } from './supabase-client';

// Server-side functionality - use dynamic import to avoid bundling in client
export const getSupabaseAdmin = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin should only be used in server-side code');
  }
  
  const { supabaseAdmin } = await import('./supabase-server');
  return supabaseAdmin;
}; 
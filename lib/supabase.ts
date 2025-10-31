export { supabase, createClerkSupabaseClient } from './supabase-client';
export const getSupabaseAdmin = async () => {
    if (typeof window !== 'undefined') {
        throw new Error('supabaseAdmin should only be used in server-side code');
    }
    const { supabaseAdmin } = await import('./supabase-server');
    return supabaseAdmin;
};

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for server-side operations that bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create a Supabase client with Clerk token for server-side operations
export function createClerkSupabaseClient(clerkToken?: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: clerkToken ? {
        Authorization: `Bearer ${clerkToken}`,
      } : {},
    },
  });
} 
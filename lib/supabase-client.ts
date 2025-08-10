import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a Supabase client with Clerk token for client-side operations
export function createClerkSupabaseClient(clerkToken?: string) {
    // TypeScript assertion is safe here because we've already checked for undefined values above
    return createClient(supabaseUrl!, supabaseAnonKey!, {
        global: {
            headers: clerkToken ? {
                Authorization: `Bearer ${clerkToken}`,
            } : {},
        },
        auth: {
            // Use custom JWT from Clerk
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}
export async function createRLSClient() {
    const { getToken } = await auth();
    const token = await getToken({ template: 'supabase' });
    if (!token) {
        throw new Error('No authentication token available');
    }
    return createClient(supabaseUrl!, supabaseAnonKey!, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
export async function getCurrentClerkUserId() {
    const { userId } = await auth();
    return userId;
}

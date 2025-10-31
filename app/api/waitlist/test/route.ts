import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('waitlist')
            .select('*')
            .limit(1);
        if (error) {
            return NextResponse.json({
                error: 'Table does not exist or other error',
                details: error.message,
                code: error.code
            });
        }
        return NextResponse.json({
            success: true,
            message: 'Waitlist table exists and is accessible',
            data: data
        });
    }
    catch (error) {
        return NextResponse.json({
            error: 'Unexpected error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

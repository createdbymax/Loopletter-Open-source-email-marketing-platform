import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWaitlistConfirmationEmail } from '@/lib/email-sender';
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
        }
        const { data: existingEntry, error: checkError } = await supabase
            .from('waitlist')
            .select('email')
            .eq('email', email.toLowerCase())
            .single();
        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing waitlist entry:', checkError);
            return NextResponse.json({
                error: 'Failed to process request',
                details: checkError.message,
                code: checkError.code
            }, { status: 500 });
        }
        if (existingEntry) {
            return NextResponse.json({ error: 'Email already registered for waitlist' }, { status: 409 });
        }
        const { error: insertError } = await supabase
            .from('waitlist')
            .insert([
            {
                email: email.toLowerCase(),
                source: 'website'
            }
        ]);
        if (insertError) {
            console.error('Error inserting waitlist entry:', insertError);
            return NextResponse.json({
                error: 'Failed to join waitlist',
                details: insertError.message,
                code: insertError.code
            }, { status: 500 });
        }
        const { count } = await supabase
            .from('waitlist')
            .select('*', { count: 'exact', head: true });
        try {
            await sendWaitlistConfirmationEmail({
                to: email,
                waitlistCount: count || undefined
            });
        }
        catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
        }
        return NextResponse.json({
            success: true,
            message: 'Successfully joined the waitlist! Check your email for confirmation.'
        }, { status: 201 });
    }
    catch (error) {
        console.error('Waitlist signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function GET() {
    try {
        const { count, error } = await supabase
            .from('waitlist')
            .select('*', { count: 'exact', head: true });
        if (error) {
            console.error('Error fetching waitlist count:', error);
            return NextResponse.json({ error: 'Failed to fetch waitlist data' }, { status: 500 });
        }
        return NextResponse.json({ total: count || 0 });
    }
    catch (error) {
        console.error('Waitlist fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

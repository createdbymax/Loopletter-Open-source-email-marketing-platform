import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export async function GET() {
    try {
        const { data: artist, error: artistError } = await supabase
            .from('artists')
            .update({
            subscription_plan: 'independent',
            subscription_current_period_end: '2025-08-16T02:01:52.064Z',
        })
            .eq('id', '7c4028fd-da9c-4baa-bc72-211fb72d9885')
            .select();
        if (artistError) {
            console.error('Error updating artist:', artistError);
            return NextResponse.json({ error: 'Error updating artist' }, { status: 500 });
        }
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .update({
            plan: 'independent',
        })
            .eq('artist_id', '7c4028fd-da9c-4baa-bc72-211fb72d9885')
            .select();
        if (subscriptionError) {
            console.error('Error updating subscription:', subscriptionError);
            return NextResponse.json({ error: 'Error updating subscription' }, { status: 500 });
        }
        return NextResponse.json({
            message: 'Subscription updated successfully',
            artist,
            subscription,
        });
    }
    catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

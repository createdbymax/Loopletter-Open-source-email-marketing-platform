import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { getCustomerInvoices } from '@/lib/stripe.server';
import { supabase } from '@/lib/supabase';
export async function GET(req: NextRequest) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(userId, '', '');
        if (!artist.subscription?.stripe_customer_id) {
            return NextResponse.json([]);
        }
        const { data: dbInvoices, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('artist_id', artist.id)
            .order('invoice_date', { ascending: false })
            .limit(10);
        if (error) {
            console.error('Error fetching invoices from database:', error);
        }
        if (dbInvoices && dbInvoices.length > 0) {
            return NextResponse.json(dbInvoices);
        }
        const stripeInvoices = await getCustomerInvoices(artist.subscription.stripe_customer_id);
        const formattedInvoices = stripeInvoices.data.map(invoice => ({
            artist_id: artist.id,
            stripe_invoice_id: invoice.id,
            stripe_payment_intent_id: typeof (invoice as any).payment_intent === 'string' ? (invoice as any).payment_intent : (invoice as any).payment_intent?.id || null,
            amount_due: invoice.amount_due,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency,
            status: invoice.status,
            invoice_pdf: invoice.invoice_pdf,
            hosted_invoice_url: invoice.hosted_invoice_url,
            invoice_date: new Date(invoice.created * 1000).toISOString(),
            paid_at: invoice.status === 'paid' && invoice.status_transitions.paid_at ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() : null,
        }));
        if (formattedInvoices.length > 0) {
            const { error: insertError } = await supabase
                .from('invoices')
                .insert(formattedInvoices);
            if (insertError) {
                console.error('Error storing invoices in database:', insertError);
            }
        }
        return NextResponse.json(formattedInvoices);
    }
    catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
}

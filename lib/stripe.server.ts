import Stripe from 'stripe';
import { Artist } from './types';
import { SubscriptionPlan } from './subscription';
import { supabase } from './supabase';
let stripe: Stripe | null = null;
if (typeof window === 'undefined') {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2025-06-30.basil',
    });
}
export const STRIPE_PRICE_IDS = {
    starter: null,
    independent_monthly: process.env.STRIPE_PRICE_INDEPENDENT_MONTHLY || 'price_independent_monthly',
    independent_annual: process.env.STRIPE_PRICE_INDEPENDENT_ANNUAL || 'price_independent_annual',
    independent_plus: process.env.STRIPE_PRICE_INDEPENDENT_PLUS || 'price_independent_plus',
    label_monthly: process.env.STRIPE_PRICE_LABEL_MONTHLY || 'price_label_monthly',
    label_annual: process.env.STRIPE_PRICE_LABEL_ANNUAL || 'price_label_annual',
};
export async function createCheckoutSession(artist: Artist, priceId: string, successUrl: string, cancelUrl: string) {
    if (!stripe) {
        throw new Error('Stripe is not initialized');
    }
    let customerId = artist.subscription?.stripe_customer_id;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: artist.email,
            name: artist.name,
            metadata: {
                artist_id: artist.id,
            },
        });
        customerId = customer.id;
        await supabase
            .from('artists')
            .update({ stripe_customer_id: customerId })
            .eq('id', artist.id);
    }
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            artist_id: artist.id,
        },
        subscription_data: {
            metadata: {
                artist_id: artist.id,
            },
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        customer_update: {
            address: 'auto',
            name: 'auto',
        },
    });
    return session;
}
export async function createCustomerPortalSession(artist: Artist, returnUrl: string) {
    if (!stripe) {
        throw new Error('Stripe is not initialized');
    }
    const customerId = artist.subscription?.stripe_customer_id;
    if (!customerId) {
        throw new Error('Artist does not have a Stripe customer ID');
    }
    try {
        if (process.env.NODE_ENV !== 'production') {
            try {
                const session = await stripe.billingPortal.sessions.create({
                    customer: customerId,
                    return_url: returnUrl,
                });
                return session;
            }
            catch (stripeError: any) {
                console.error('Stripe error:', stripeError);
                if (stripeError?.message?.includes('No such customer') ||
                    stripeError?.code === 'resource_missing') {
                    console.log('Customer not found in Stripe, creating mock portal session for development');
                    return {
                        url: returnUrl + '?mock=true',
                        object: 'billing_portal.session',
                        id: 'mock_session_' + Date.now(),
                    };
                }
                throw stripeError;
            }
        }
        else {
            const session = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: returnUrl,
            });
            return session;
        }
    }
    catch (error) {
        console.error('Stripe portal session creation error:', error);
        throw error;
    }
}
export async function getSubscriptionDetails(subscriptionId: string) {
    if (!stripe) {
        throw new Error('Stripe is not initialized');
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'customer', 'default_payment_method'],
    });
    return subscription;
}
export async function cancelSubscription(subscriptionId: string, immediately = false) {
    if (!stripe) {
        throw new Error('Stripe is not initialized');
    }
    if (immediately) {
        const subscription = await stripe.subscriptions.cancel(subscriptionId);
        return subscription;
    }
    else {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });
        return subscription;
    }
}
export async function reactivateSubscription(subscriptionId: string) {
    if (!stripe) {
        throw new Error('Stripe is not initialized');
    }
    const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
    });
    return subscription;
}
export async function updateSubscription(subscriptionId: string, newPriceId: string) {
    if (!stripe) {
        throw new Error('Stripe is not initialized');
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
            {
                id: subscription.items.data[0].id,
                price: newPriceId,
            },
        ],
    });
    return updatedSubscription;
}
export async function getCustomerInvoices(customerId: string) {
    if (!stripe) {
        throw new Error('Stripe is not initialized');
    }
    const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 10,
        expand: ['data.payment_intent'],
    });
    return invoices;
}
export function getPlanDetailsFromSubscription(subscription: any): {
    plan: SubscriptionPlan;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
} {
    if (!subscription) {
        return {
            plan: 'starter',
            status: 'active',
            currentPeriodEnd: '',
            cancelAtPeriodEnd: false,
        };
    }
    const priceId = subscription.items.data[0]?.price.id;
    let plan: SubscriptionPlan = 'starter';
    if (priceId.includes('independent')) {
        plan = 'independent';
    }
    else if (priceId.includes('label')) {
        plan = 'label';
    }
    return {
        plan,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
}

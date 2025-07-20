import Stripe from 'stripe';
import { Artist } from './types';
import { SubscriptionPlan } from './subscription';
import { supabase } from './supabase';

// This file should only be imported in server components or API routes
// It contains server-side Stripe functionality that requires API keys

// Initialize Stripe with the secret key
let stripe: Stripe | null = null;

// Initialize Stripe only on the server side
if (typeof window === 'undefined') {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16', // Use a stable API version
  });
}

// Stripe price IDs for each plan - replace these with your actual price IDs
export const STRIPE_PRICE_IDS = {
  starter: null, // Free plan, no price ID
  independent_monthly: process.env.STRIPE_PRICE_INDEPENDENT_MONTHLY || 'price_independent_monthly',
  independent_annual: process.env.STRIPE_PRICE_INDEPENDENT_ANNUAL || 'price_independent_annual',
  independent_plus: process.env.STRIPE_PRICE_INDEPENDENT_PLUS || 'price_independent_plus', // 25k subscribers option
  label_monthly: process.env.STRIPE_PRICE_LABEL_MONTHLY || 'price_label_monthly',
  label_annual: process.env.STRIPE_PRICE_LABEL_ANNUAL || 'price_label_annual',
};

/**
 * Create a Stripe checkout session for subscription upgrade
 */
export async function createCheckoutSession(
  artist: Artist,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) {
    throw new Error('Stripe is not initialized');
  }

  // Check if artist already has a Stripe customer ID
  let customerId = artist.subscription?.stripe_customer_id;
  
  // If not, create a new customer
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: artist.email,
      name: artist.name,
      metadata: {
        artist_id: artist.id,
      },
    });
    customerId = customer.id;
    
    // Update artist with customer ID
    await supabase
      .from('artists')
      .update({ stripe_customer_id: customerId })
      .eq('id', artist.id);
  }
  
  // Create checkout session
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

/**
 * Create a Stripe customer portal session for subscription management
 */
export async function createCustomerPortalSession(
  artist: Artist,
  returnUrl: string
) {
  if (!stripe) {
    throw new Error('Stripe is not initialized');
  }

  // Check both the individual field and the subscription object
  const customerId = artist.stripe_customer_id || artist.subscription?.stripe_customer_id;
  
  if (!customerId) {
    throw new Error('Artist does not have a Stripe customer ID');
  }
  
  try {
    // For development/testing purposes, if we're in a non-production environment
    // and the customer ID doesn't exist in Stripe, create a mock portal session
    if (process.env.NODE_ENV !== 'production') {
      try {
        // First try to create a real session
        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: returnUrl,
        });
        return session;
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        
        // If that fails, check if it's because the customer doesn't exist
        if (stripeError.message?.includes('No such customer') || 
            stripeError.code === 'resource_missing') {
          console.log('Customer not found in Stripe, creating mock portal session for development');
          
          // Return a mock session for development
          return {
            url: returnUrl + '?mock=true',
            object: 'billing_portal.session',
            id: 'mock_session_' + Date.now(),
          };
        }
        
        // If it's another type of error, rethrow it
        throw stripeError;
      }
    } else {
      // In production, just create the session normally
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return session;
    }
  } catch (error) {
    console.error('Stripe portal session creation error:', error);
    throw error;
  }
}

/**
 * Get subscription details from Stripe
 */
export async function getSubscriptionDetails(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not initialized');
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice', 'customer', 'default_payment_method'],
  });
  return subscription;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, immediately = false) {
  if (!stripe) {
    throw new Error('Stripe is not initialized');
  }

  if (immediately) {
    // Cancel immediately
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } else {
    // Cancel at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return subscription;
  }
}

/**
 * Reactivate a subscription that was set to cancel at period end
 */
export async function reactivateSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not initialized');
  }

  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
  return subscription;
}

/**
 * Update subscription quantity or plan
 */
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

/**
 * Get invoices for a customer
 */
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

/**
 * Get plan details from subscription object
 */
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
  } else if (priceId.includes('label')) {
    plan = 'label';
  }
  
  return {
    plan,
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}
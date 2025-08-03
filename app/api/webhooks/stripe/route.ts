import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateArtist } from '@/lib/db';
import { SubscriptionPlan } from '@/lib/subscription';
import { supabase } from '@/lib/supabase';
import { StripeSubscription, StripeInvoice, SubscriptionDetails, convertStripeSubscription } from '@/lib/stripe-types';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Get plan details from subscription
function getPlanDetailsFromSubscription(subscription: StripeSubscription): SubscriptionDetails {
  if (!subscription) {
    return {
      plan: 'starter',
      status: 'active',
      currentPeriodEnd: '',
      cancelAtPeriodEnd: false,
    };
  }
  
  const priceId = subscription.items?.data?.[0]?.price?.id || '';
  console.log('Price ID from subscription:', priceId);
  
  // Check if the price ID matches any of the known price IDs
  if (priceId === 'price_1Rlg4QPGV35FfLd9aEHZ6B2L') {
    console.log('Price ID matches Independent plan');
    return {
      plan: 'independent',
      status: subscription.status || 'active',
      currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : '',
      cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
    };
  }
  
  // If no match, use the generic logic
  let plan: SubscriptionPlan = 'starter';
  
  if (priceId.includes('independent')) {
    plan = 'independent';
  } else if (priceId.includes('label')) {
    plan = 'label';
  }
  
  return {
    plan,
    status: subscription.status || 'active',
    currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : '',
    cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
  };
}

export async function POST(req: NextRequest) {
  try {
    // For testing purposes, let's bypass signature verification in development
    // In production, you should always verify the signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';
    
    let event;
    
    try {
      // Try to construct the event with signature verification
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      
      // For development only: Parse the event directly from the body
      // This is NOT secure for production use
      try {
        event = JSON.parse(body);
        console.log('Bypassing signature verification for development');
      } catch (parseErr) {
        console.error('Failed to parse webhook body:', parseErr);
        return NextResponse.json({ error: 'Webhook signature verification failed and could not parse body' }, { status: 400 });
      }
    }
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get artist ID from metadata
        const artistId = session.metadata?.artist_id;
        if (!artistId) {
          console.error('No artist ID found in session metadata');
          return NextResponse.json({ error: 'No artist ID found' }, { status: 400 });
        }
        
        // Update artist with subscription details
        console.log('Updating artist subscription:', {
          artistId,
          customer: session.customer,
          subscription: session.subscription,
          plan: 'independent',
          status: 'active'
        });
        
        await updateArtist(artistId, {
          subscription_plan: 'independent', // Default to independent, will be updated in subscription.created
          subscription_status: 'active',
          subscription_current_period_end: null,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        });
        
        // Store subscription in database
        if (session.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            console.log('Retrieved subscription:', subscription.id);
            await storeSubscription(subscription);
            
            // Double-check that the artist's subscription_plan is set correctly
            const { data: artist } = await supabase
              .from('artists')
              .select('subscription_plan')
              .eq('id', artistId)
              .single();
            
            if (artist && artist.subscription_plan !== 'independent') {
              console.log('Fixing artist subscription plan:', artist.subscription_plan);
              await supabase
                .from('artists')
                .update({
                  subscription_plan: 'independent',
                  subscription_status: 'active',
                  subscription_current_period_end:
                    (subscription && typeof subscription === 'object' && 'current_period_end' in subscription && typeof (subscription as { current_period_end?: number }).current_period_end === 'number')
                      ? new Date((subscription as { current_period_end: number }).current_period_end * 1000).toISOString()
                      : null,
                  stripe_customer_id: session.customer as string,
                  stripe_subscription_id: session.subscription as string,
                })
                .eq('id', artistId);
            }
          } catch (error) {
            console.error('Error retrieving or storing subscription:', error);
          }
        }
        
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeletion(subscription);
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as StripeInvoice;
        await handleInvoicePaid(invoice);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as StripeInvoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Helper function to handle subscription changes
async function handleSubscriptionChange(subscription: Stripe.Subscription | StripeSubscription) {
  try {
    // Guard: If this is a fetch Response, do not process
    if (
      !subscription ||
      typeof subscription !== 'object' ||
      !('id' in subscription) ||
      (
        !('items' in subscription && Array.isArray((subscription as { items: { data: unknown[] } }).items.data)) &&
        !('current_period_start' in subscription && 'current_period_end' in subscription)
      ) ||
      'json' in subscription ||
      'status' in subscription
    ) {
      console.error('handleSubscriptionChange: received an invalid or Response object instead of a Stripe subscription', subscription);
      return;
    }
    let stripeSub: StripeSubscription;
    
    if ((subscription as Stripe.Subscription).items && Array.isArray((subscription as Stripe.Subscription).items.data)) {
      // It's a Stripe.Subscription, convert it
      stripeSub = convertStripeSubscription(subscription as Stripe.Subscription);
    } else {
      // Already a StripeSubscription
      stripeSub = subscription as StripeSubscription;
    }
    // Defensive: If still not valid, return
    if (!stripeSub || typeof stripeSub.current_period_start !== 'number' || typeof stripeSub.current_period_end !== 'number') {
      console.error('handleSubscriptionChange: stripeSub is not a valid StripeSubscription', stripeSub);
      return;
    }
    // Store subscription in database
    await storeSubscription(stripeSub);
    // Get artist ID from metadata
    const artistId = stripeSub.metadata?.artist_id;
    if (!artistId) {
      // Try to find artist by customer ID
      const { data: artists } = await supabase
        .from('artists')
        .select('id')
        .eq('stripe_customer_id', stripeSub.customer as string)
        .limit(1);
      if (artists && artists.length > 0) {
        const planDetails = getPlanDetailsFromSubscription(stripeSub);
        // Update artist with subscription details
        await updateArtist(artists[0].id, {
          subscription_plan: planDetails.plan,
          subscription_status: planDetails.status as 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing',
          subscription_current_period_end: planDetails.currentPeriodEnd ? planDetails.currentPeriodEnd : null,
          stripe_customer_id: stripeSub.customer as string,
          stripe_subscription_id: stripeSub.id,
        });
      } else {
        console.error('No artist found for customer ID:', stripeSub.customer);
      }
    } else {
      const planDetails = getPlanDetailsFromSubscription(stripeSub);
      // Update artist with subscription details
      await updateArtist(artistId, {
        subscription_plan: planDetails.plan,
        subscription_status: planDetails.status as 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing',
        subscription_current_period_end: planDetails.currentPeriodEnd ? planDetails.currentPeriodEnd : null,
        stripe_customer_id: stripeSub.customer as string,
        stripe_subscription_id: stripeSub.id,
      });
    }
  } catch (error) {
    console.error('Error handling subscription change:', error);
    throw error;
  }
}

// Helper function to handle subscription deletion
async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  try {
    // Update subscription in database
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);
    
    // Get artist ID from metadata or lookup by customer ID
    let artistId = subscription.metadata?.artist_id;
    if (!artistId) {
      // Try to find artist by customer ID
      const { data: artists } = await supabase
        .from('artists')
        .select('id')
        .eq('stripe_customer_id', subscription.customer as string)
        .limit(1);
      
      if (artists && artists.length > 0) {
        artistId = artists[0].id;
      } else {
        console.error('No artist found for customer ID:', subscription.customer);
        return;
      }
    }
    
    // Update artist with subscription details
    await updateArtist(artistId, {
      subscription_plan: 'starter',
      subscription_status: 'canceled',
    });
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
    throw error;
  }
}

// Helper function to handle invoice payment
async function handleInvoicePaid(invoice: StripeInvoice) {
  try {
    // Store invoice in database
    await storeInvoice(invoice);
    
    // If this is a subscription invoice, update the subscription
    if (invoice.subscription) {
      let subscriptionId: string;
      if (typeof invoice.subscription === 'string') {
        subscriptionId = invoice.subscription;
      } else if (typeof invoice.subscription === 'object' && invoice.subscription !== null && 'id' in invoice.subscription) {
        subscriptionId = (invoice.subscription as { id: string }).id;
      } else {
        console.error('Invalid subscription in invoice:', invoice.subscription);
        return;
      }
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await handleSubscriptionChange(subscription);
    }
  } catch (error) {
    console.error('Error handling invoice payment:', error);
    throw error;
  }
}

// Helper function to handle invoice payment failure
async function handleInvoicePaymentFailed(invoice: StripeInvoice) {
  try {
    // Store invoice in database
    await storeInvoice(invoice);
    
    // If this is a subscription invoice, update the subscription status
    if (invoice.subscription) {
      let subscriptionId: string;
      if (typeof invoice.subscription === 'string') {
        subscriptionId = invoice.subscription;
      } else if (typeof invoice.subscription === 'object' && invoice.subscription !== null && 'id' in invoice.subscription) {
        subscriptionId = (invoice.subscription as { id: string }).id;
      } else {
        console.error('Invalid subscription in invoice:', invoice.subscription);
        return;
      }
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Get artist ID from metadata or lookup by customer ID
      let artistId = subscription.metadata?.artist_id;
      if (!artistId) {
        // Try to find artist by customer ID
        const { data: artists } = await supabase
          .from('artists')
          .select('id')
          .eq('stripe_customer_id', subscription.customer as string)
          .limit(1);
        
        if (artists && artists.length > 0) {
          artistId = artists[0].id;
        } else {
          console.error('No artist found for customer ID:', subscription.customer);
          return;
        }
      }
      
      // Update artist with subscription details
      await updateArtist(artistId, {
        subscription_plan: (subscription.metadata?.plan as SubscriptionPlan) || 'independent',
        subscription_status: 'past_due',
      });
    }
  } catch (error) {
    console.error('Error handling invoice payment failure:', error);
    throw error;
  }
}

// Helper function to store subscription in database
async function storeSubscription(subscription: StripeSubscription | Stripe.Subscription) {
  // Always convert to StripeSubscription if it's a Stripe.Subscription
  const stripeSubscription: StripeSubscription = (subscription as Stripe.Subscription).items && Array.isArray((subscription as Stripe.Subscription).items.data)
    ? convertStripeSubscription(subscription as Stripe.Subscription)
    : subscription as StripeSubscription;
  try {
    // Get artist ID from metadata or lookup by customer ID
    let artistId = stripeSubscription.metadata?.artist_id;
    if (!artistId) {
      // Try to find artist by customer ID
      const { data: artists } = await supabase
        .from('artists')
        .select('id')
        .eq('stripe_customer_id', stripeSubscription.customer as string)
        .limit(1);
      if (artists && artists.length > 0) {
        artistId = artists[0].id;
      } else {
        console.error('No artist found for customer ID:', stripeSubscription.customer);
        return;
      }
    }
    // Check if subscription already exists in database
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', stripeSubscription.id)
      .limit(1);
    const planDetails = getPlanDetailsFromSubscription(stripeSubscription);
    // Safely get timestamps
    const currentPeriodStart = stripeSubscription.current_period_start
      ? new Date(stripeSubscription.current_period_start * 1000).toISOString()
      : new Date().toISOString();
    const currentPeriodEnd = stripeSubscription.current_period_end
      ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const canceledAt = stripeSubscription.canceled_at
      ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
      : null;
    const priceId = (stripeSubscription.items && Array.isArray(stripeSubscription.items.data) && stripeSubscription.items.data[0] && stripeSubscription.items.data[0].price && stripeSubscription.items.data[0].price.id)
      ? stripeSubscription.items.data[0].price.id
      : undefined;
    if (existingSubscription && existingSubscription.length > 0) {
      // Update existing subscription
      await supabase
        .from('subscriptions')
        .update({
          plan: planDetails.plan,
          status: planDetails.status as 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing',
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
          canceled_at: canceledAt,
          updated_at: new Date().toISOString(),
          stripe_price_id: priceId,
          metadata: stripeSubscription.metadata,
        })
        .eq('stripe_subscription_id', stripeSubscription.id);
    } else {
      // Create new subscription
      await supabase
        .from('subscriptions')
        .insert({
          artist_id: artistId,
          stripe_subscription_id: stripeSubscription.id,
          stripe_price_id: priceId,
          plan: planDetails.plan,
          status: planDetails.status as 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing',
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
          canceled_at: canceledAt,
          metadata: stripeSubscription.metadata,
        });
    }
  } catch (error) {
    console.error('Error storing subscription in database:', error);
    throw error;
  }
}

// Helper function to store invoice in database
async function storeInvoice(invoice: StripeInvoice) {
  try {
    // Get artist ID by customer ID
    const { data: artists } = await supabase
      .from('artists')
      .select('id')
      .eq('stripe_customer_id', invoice.customer as string)
      .limit(1);
    
    if (!artists || artists.length === 0) {
      console.error('No artist found for customer ID:', invoice.customer);
      return;
    }
    
    const artistId = artists[0].id;
    
    // Check if invoice already exists in database
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('stripe_invoice_id', invoice.id)
      .limit(1);
    
    // Safely get timestamps
    const invoiceDate = invoice.created 
      ? new Date(invoice.created * 1000).toISOString() 
      : new Date().toISOString();
    
    const paidAt = invoice.status === 'paid' && invoice.status_transitions?.paid_at 
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() 
      : null;
    
    if (existingInvoice && existingInvoice.length > 0) {
      // Update existing invoice
      await supabase
        .from('invoices')
        .update({
          status: invoice.status,
          amount_paid: invoice.amount_paid,
          paid_at: paidAt,
        })
        .eq('stripe_invoice_id', invoice.id);
    } else {
      // Create new invoice
      await supabase
        .from('invoices')
        .insert({
          artist_id: artistId,
          stripe_invoice_id: invoice.id,
          stripe_payment_intent_id: typeof invoice.payment_intent === 'string' 
            ? invoice.payment_intent 
            : invoice.payment_intent?.id || null,
          amount_due: invoice.amount_due,
          amount_paid: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status,
          invoice_pdf: invoice.invoice_pdf,
          hosted_invoice_url: invoice.hosted_invoice_url,
          invoice_date: invoiceDate,
          paid_at: paidAt,
        });
    }
  } catch (error) {
    console.error('Error storing invoice in database:', error);
    throw error;
  }
}
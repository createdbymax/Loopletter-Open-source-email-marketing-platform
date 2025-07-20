// Types for Stripe webhook handling

import { SubscriptionPlan } from './subscription';

export interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at?: number | null;
  items: {
    data: Array<{
      price: {
        id: string;
      };
    }>;
  };
  metadata: {
    artist_id?: string;
    plan?: string;
    [key: string]: string | undefined;
  };
}

export interface StripeInvoice {
  id: string;
  customer: string;
  subscription?: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  payment_intent?: string | { id: string };
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  status_transitions?: {
    paid_at?: number;
  };
}

export interface StripeCheckoutSession {
  id: string;
  customer: string | null;
  subscription: string | null;
  metadata: {
    artist_id?: string;
    [key: string]: string | undefined;
  };
}

export interface SubscriptionDetails {
  plan: SubscriptionPlan;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// Helper function to convert Stripe.Subscription to StripeSubscription
export function convertStripeSubscription(subscription: any): StripeSubscription {
  return {
    id: subscription.id,
    customer: subscription.customer as string,
    status: subscription.status,
    current_period_start: subscription.current_period_start || Math.floor(Date.now() / 1000),
    current_period_end: subscription.current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    canceled_at: subscription.canceled_at,
    items: subscription.items,
    metadata: subscription.metadata || {}
  };
}
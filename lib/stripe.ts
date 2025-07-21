// import { Artist } from './types';
import { SubscriptionPlan } from './subscription';
import './ws-polyfill';

// Plan details for display
export const PLAN_DETAILS = {
  starter: {
    name: 'Starter',
    price: 0,
    interval: 'month',
    description: 'Perfect for new artists and hobbyists',
    features: [
      '1,000 subscribers',
      '3,000 emails/month',
      'Manual campaigns',
      'Basic analytics',
      'Community support'
    ]
  },
  independent_monthly: {
    name: 'Independent',
    price: 29,
    interval: 'month',
    description: 'Ideal for growing artists and indie labels',
    features: [
      '10,000 subscribers',
      'Unlimited emails',
      'Email scheduling',
      'Advanced analytics',
      'Segmentation',
      'Automations',
      'Custom domain',
      'Premium support'
    ]
  },
  independent_annual: {
    name: 'Independent (Annual)',
    price: 290,
    interval: 'year',
    description: 'Save $58 with annual billing',
    features: [
      '10,000 subscribers',
      'Unlimited emails',
      'Email scheduling',
      'Advanced analytics',
      'Segmentation',
      'Automations',
      'Custom domain',
      'Premium support'
    ]
  },
  independent_plus: {
    name: 'Independent Plus',
    price: 49,
    interval: 'month',
    description: 'For artists with up to 25,000 subscribers',
    features: [
      '25,000 subscribers',
      'Unlimited emails',
      'Email scheduling',
      'Advanced analytics',
      'Segmentation',
      'Automations',
      'Custom domain',
      'Premium support'
    ]
  },
  label_monthly: {
    name: 'Label/Agency',
    price: 99,
    interval: 'month',
    description: 'Built for teams managing multiple artists',
    features: [
      '50,000+ subscribers',
      'Unlimited emails',
      'Multi-artist management',
      'Team access',
      'White-labeling',
      'Priority support',
      'Onboarding help',
      'Monetization tools'
    ]
  },
  label_annual: {
    name: 'Label/Agency (Annual)',
    price: 990,
    interval: 'year',
    description: 'Save $198 with annual billing',
    features: [
      '50,000+ subscribers',
      'Unlimited emails',
      'Multi-artist management',
      'Team access',
      'White-labeling',
      'Priority support',
      'Onboarding help',
      'Monetization tools'
    ]
  },
};

/**
 * Map Stripe price ID to plan
 */
export function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  // This function can run on client side as it doesn't use Stripe directly
  if (priceId.includes('independent')) {
    return 'independent';
  } else if (priceId.includes('label')) {
    return 'label';
  } else {
    return 'starter';
  }
}

/**
 * Format currency amount from cents to dollars
 */
export function formatAmount(amount: number, currency: string = 'usd'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });

  return formatter.format(amount / 100);
}

// Type definition for Stripe subscription object
interface StripeSubscription {
  items?: {
    data?: Array<{
      price?: {
        id?: string;
      };
    }>;
  };
  status?: string;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
}

// Type guard to check if object has subscription properties
function isStripeSubscription(obj: unknown): obj is StripeSubscription {
  return typeof obj === 'object' && obj !== null;
}

/**
 * Get plan details from subscription object
 */
export function getPlanDetailsFromSubscription(subscription: unknown): {
  plan: SubscriptionPlan;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
} {
  if (!subscription || !isStripeSubscription(subscription)) {
    return {
      plan: 'starter',
      status: 'active',
      currentPeriodEnd: '',
      cancelAtPeriodEnd: false,
    };
  }

  const priceId = subscription.items?.data?.[0]?.price?.id || '';
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
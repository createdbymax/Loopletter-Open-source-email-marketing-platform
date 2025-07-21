import type { Artist } from './types';

// Subscription plan types
export type SubscriptionPlan = 'starter' | 'independent' | 'label';

// Subscription status types
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

// Billing interval types
export type BillingInterval = 'month' | 'year';

// Feature flags for each plan
export interface FeatureAccess {
  // Limits
  maxSubscribers: number;
  maxEmailSends: number | 'unlimited';
  
  // Core features
  manualCampaignSending: boolean;
  emailScheduling: boolean;
  hostedSignupPage: boolean;
  autoResponseWelcomeEmail: boolean;
  
  // Analytics
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  
  // Advanced features
  segmentation: boolean;
  automations: boolean;
  removeLoopLetterBranding: boolean;
  customSignupDomain: boolean;
  customEmailDesign: boolean;
  
  // Support
  communitySupport: boolean;
  premiumSupport: boolean;
  prioritySupport: boolean;
  
  // Team features
  multiArtistManagement: boolean;
  multiUserAccess: boolean;
  whiteLabelingOptions: boolean;
  onboardingHelp: boolean;
  monetizationTools: boolean;
}

// Subscription data interface
export interface SubscriptionData {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  metadata?: Record<string, any>;
}

// Plan definitions with feature access
export const PLAN_FEATURES: Record<SubscriptionPlan, FeatureAccess> = {
  starter: {
    // Limits
    maxSubscribers: 1000,
    maxEmailSends: 3000,
    
    // Core features
    manualCampaignSending: true,
    emailScheduling: false,
    hostedSignupPage: true,
    autoResponseWelcomeEmail: true,
    
    // Analytics
    basicAnalytics: true,
    advancedAnalytics: false,
    
    // Advanced features
    segmentation: false,
    automations: false,
    removeLoopLetterBranding: false,
    customSignupDomain: false,
    customEmailDesign: false,
    
    // Support
    communitySupport: true,
    premiumSupport: false,
    prioritySupport: false,
    
    // Team features
    multiArtistManagement: false,
    multiUserAccess: false,
    whiteLabelingOptions: false,
    onboardingHelp: false,
    monetizationTools: false,
  },
  
  independent: {
    // Limits
    maxSubscribers: 10000,
    maxEmailSends: 'unlimited',
    
    // Core features
    manualCampaignSending: true,
    emailScheduling: true,
    hostedSignupPage: true,
    autoResponseWelcomeEmail: true,
    
    // Analytics
    basicAnalytics: true,
    advancedAnalytics: true,
    
    // Advanced features
    segmentation: true,
    automations: true,
    removeLoopLetterBranding: true,
    customSignupDomain: true,
    customEmailDesign: true,
    
    // Support
    communitySupport: true,
    premiumSupport: true,
    prioritySupport: false,
    
    // Team features
    multiArtistManagement: false,
    multiUserAccess: false,
    whiteLabelingOptions: false,
    onboardingHelp: false,
    monetizationTools: false,
  },
  
  label: {
    // Limits
    maxSubscribers: 50000,
    maxEmailSends: 'unlimited',
    
    // Core features
    manualCampaignSending: true,
    emailScheduling: true,
    hostedSignupPage: true,
    autoResponseWelcomeEmail: true,
    
    // Analytics
    basicAnalytics: true,
    advancedAnalytics: true,
    
    // Advanced features
    segmentation: true,
    automations: true,
    removeLoopLetterBranding: true,
    customSignupDomain: true,
    customEmailDesign: true,
    
    // Support
    communitySupport: true,
    premiumSupport: true,
    prioritySupport: true,
    
    // Team features
    multiArtistManagement: true,
    multiUserAccess: true,
    whiteLabelingOptions: true,
    onboardingHelp: true,
    monetizationTools: true,
  }
};

// Feature names for UI display
export const FEATURE_NAMES: Record<keyof FeatureAccess, string> = {
  maxSubscribers: 'Maximum Subscribers',
  maxEmailSends: 'Monthly Email Sends',
  manualCampaignSending: 'Manual Campaign Sending',
  emailScheduling: 'Email Scheduling & Queueing',
  hostedSignupPage: 'Hosted Signup Page',
  autoResponseWelcomeEmail: 'Auto-response Welcome Email',
  basicAnalytics: 'Basic Analytics (Opens, Clicks)',
  advancedAnalytics: 'Advanced Analytics (City, Device)',
  segmentation: 'Segmentation (by tag, opens, clicks)',
  automations: 'Unlimited Automations',
  removeLoopLetterBranding: 'Remove Loopletter Branding',
  customSignupDomain: 'Custom Signup Domain',
  customEmailDesign: 'Custom Email Design',
  communitySupport: 'Community Support',
  premiumSupport: 'Premium Support (24-48h)',
  prioritySupport: 'Priority Support (<24h)',
  multiArtistManagement: 'Multi-artist Management',
  multiUserAccess: 'Multi-user/Team Access',
  whiteLabelingOptions: 'White-labeling',
  onboardingHelp: 'Onboarding Help / Account Review',
  monetizationTools: 'Monetization Tools',
};

// Get the user's current subscription plan
export function getUserSubscriptionPlan(artist: Artist): SubscriptionPlan {
  // Get plan from artist object
  // Default to starter if no plan is found
  return (artist?.subscription?.plan as SubscriptionPlan) || 'starter';
}

// Check if a user can access a specific feature
export function canAccessFeature(artist: Artist, feature: keyof FeatureAccess): boolean {
  const plan = getUserSubscriptionPlan(artist);
  const featureValue = PLAN_FEATURES[plan][feature];
  
  // For boolean features, return the boolean value
  // For numeric/string features (like limits), return true if they exist
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }
  
  // For numeric limits or 'unlimited', return true if the feature is available
  return featureValue !== 0 && featureValue !== null && featureValue !== undefined;
}

// Get the user's feature limits
export function getUserLimits(artist: Artist): { 
  maxSubscribers: number; 
  maxEmailSends: number | 'unlimited';
} {
  const plan = getUserSubscriptionPlan(artist);
  return {
    maxSubscribers: PLAN_FEATURES[plan].maxSubscribers,
    maxEmailSends: PLAN_FEATURES[plan].maxEmailSends,
  };
}

// Check if user has reached subscriber limit
export function hasReachedSubscriberLimit(artist: Artist, currentCount: number): boolean {
  const { maxSubscribers } = getUserLimits(artist);
  return currentCount >= maxSubscribers;
}

// Check if user has reached email send limit
export function hasReachedEmailSendLimit(artist: Artist, currentSendCount: number): boolean {
  const { maxEmailSends } = getUserLimits(artist);
  if (maxEmailSends === 'unlimited') return false;
  return currentSendCount >= maxEmailSends;
}

// Get upgrade URL for a specific feature
export function getUpgradeUrlForFeature(feature: keyof FeatureAccess): string {
  return '/dashboard/settings?upgrade=true&feature=' + feature;
}
import type { Artist } from './types';
export type SubscriptionPlan = 'starter' | 'independent' | 'label';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
export type BillingInterval = 'month' | 'year';
export interface FeatureAccess {
    maxSubscribers: number;
    maxEmailSends: number | 'unlimited';
    manualCampaignSending: boolean;
    emailScheduling: boolean;
    hostedSignupPage: boolean;
    autoResponseWelcomeEmail: boolean;
    basicAnalytics: boolean;
    advancedAnalytics: boolean;
    segmentation: boolean;
    automations: boolean;
    removeLoopLetterBranding: boolean;
    customSignupDomain: boolean;
    customEmailDesign: boolean;
    communitySupport: boolean;
    premiumSupport: boolean;
    prioritySupport: boolean;
    multiArtistManagement: boolean;
    multiUserAccess: boolean;
    whiteLabelingOptions: boolean;
    onboardingHelp: boolean;
    monetizationTools: boolean;
}
export interface SubscriptionData {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    current_period_end?: string;
    cancel_at_period_end?: boolean;
    metadata?: Record<string, any>;
}
export const PLAN_FEATURES: Record<SubscriptionPlan, FeatureAccess> = {
    starter: {
        maxSubscribers: 1000,
        maxEmailSends: 3000,
        manualCampaignSending: true,
        emailScheduling: false,
        hostedSignupPage: true,
        autoResponseWelcomeEmail: true,
        basicAnalytics: true,
        advancedAnalytics: false,
        segmentation: false,
        automations: false,
        removeLoopLetterBranding: false,
        customSignupDomain: false,
        customEmailDesign: false,
        communitySupport: true,
        premiumSupport: false,
        prioritySupport: false,
        multiArtistManagement: false,
        multiUserAccess: false,
        whiteLabelingOptions: false,
        onboardingHelp: false,
        monetizationTools: false,
    },
    independent: {
        maxSubscribers: 10000,
        maxEmailSends: 'unlimited',
        manualCampaignSending: true,
        emailScheduling: true,
        hostedSignupPage: true,
        autoResponseWelcomeEmail: true,
        basicAnalytics: true,
        advancedAnalytics: true,
        segmentation: true,
        automations: true,
        removeLoopLetterBranding: true,
        customSignupDomain: true,
        customEmailDesign: true,
        communitySupport: true,
        premiumSupport: true,
        prioritySupport: false,
        multiArtistManagement: false,
        multiUserAccess: false,
        whiteLabelingOptions: false,
        onboardingHelp: false,
        monetizationTools: false,
    },
    label: {
        maxSubscribers: 50000,
        maxEmailSends: 'unlimited',
        manualCampaignSending: true,
        emailScheduling: true,
        hostedSignupPage: true,
        autoResponseWelcomeEmail: true,
        basicAnalytics: true,
        advancedAnalytics: true,
        segmentation: true,
        automations: true,
        removeLoopLetterBranding: true,
        customSignupDomain: true,
        customEmailDesign: true,
        communitySupport: true,
        premiumSupport: true,
        prioritySupport: true,
        multiArtistManagement: true,
        multiUserAccess: true,
        whiteLabelingOptions: true,
        onboardingHelp: true,
        monetizationTools: true,
    }
};
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
export function getUserSubscriptionPlan(artist: Artist): SubscriptionPlan {
    return (artist?.subscription?.plan as SubscriptionPlan) || 'starter';
}
export function canAccessFeature(artist: Artist, feature: keyof FeatureAccess): boolean {
    const plan = getUserSubscriptionPlan(artist);
    const featureValue = PLAN_FEATURES[plan][feature];
    if (typeof featureValue === 'boolean') {
        return featureValue;
    }
    return featureValue !== 0 && featureValue !== null && featureValue !== undefined;
}
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
export function hasReachedSubscriberLimit(artist: Artist, currentCount: number): boolean {
    const { maxSubscribers } = getUserLimits(artist);
    return currentCount >= maxSubscribers;
}
export function hasReachedEmailSendLimit(artist: Artist, currentSendCount: number): boolean {
    const { maxEmailSends } = getUserLimits(artist);
    if (maxEmailSends === 'unlimited')
        return false;
    return currentSendCount >= maxEmailSends;
}
export function getUpgradeUrlForFeature(feature: keyof FeatureAccess): string {
    return '/dashboard/settings?upgrade=true&feature=' + feature;
}

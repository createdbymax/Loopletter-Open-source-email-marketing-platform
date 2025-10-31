import { Artist, Fan, Campaign } from './types';
export interface OnboardingStatus {
    isComplete: boolean;
    completedSteps: string[];
    nextStep: string | null;
    progress: number;
}
export interface OnboardingData {
    hasProfile: boolean;
    hasFans: boolean;
    hasDomain: boolean;
    hasCampaigns: boolean;
    hasSettings: boolean;
}
export function shouldShowOnboarding(artist: Artist, fans: Fan[], campaigns: Campaign[]): boolean {
    if (artist.settings?.onboarding_completed) {
        return false;
    }
    if (typeof window !== 'undefined') {
        const skipped = localStorage.getItem(`onboarding-skipped-${artist.id}`);
        const completed = localStorage.getItem(`onboarding-completed-${artist.id}`);
        if (skipped || completed) {
            return false;
        }
    }
    const createdAt = new Date(artist.created_at);
    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 1) {
        return true;
    }
    if (daysSinceCreation < 7) {
        const hasBasicSetup = fans.length > 0 || campaigns.length > 0;
        return !hasBasicSetup;
    }
    return false;
}
export function getOnboardingStatus(artist: Artist, fans: Fan[], campaigns: Campaign[]): OnboardingStatus {
    const completedSteps: string[] = [];
    if (artist.name && artist.bio && artist.settings?.timezone) {
        completedSteps.push('profile');
    }
    if (fans.length > 0) {
        completedSteps.push('audience');
    }
    if (artist.ses_domain && artist.ses_domain.trim() !== '') {
        completedSteps.push('domain');
    }
    if (campaigns.length > 0) {
        completedSteps.push('campaign');
    }
    const allSteps = ['profile', 'audience', 'domain', 'campaign'];
    const nextStep = allSteps.find(step => !completedSteps.includes(step)) || null;
    const progress = (completedSteps.length / allSteps.length) * 100;
    const isComplete = completedSteps.includes('profile') &&
        completedSteps.includes('audience') &&
        completedSteps.includes('campaign');
    return {
        isComplete,
        completedSteps,
        nextStep,
        progress,
    };
}
export function getOnboardingData(artist: Artist, fans: Fan[], campaigns: Campaign[]): OnboardingData {
    return {
        hasProfile: !!(artist.name && artist.bio && artist.settings?.timezone),
        hasFans: fans.length > 0,
        hasDomain: !!(artist.ses_domain && artist.ses_domain.trim() !== ''),
        hasCampaigns: campaigns.length > 0,
        hasSettings: !!(artist.settings?.brand_colors || artist.settings?.social_links),
    };
}
export async function completeOnboarding(artistId: string): Promise<void> {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`onboarding-completed-${artistId}`, 'true');
            localStorage.removeItem(`onboarding-skipped-${artistId}`);
        }
        await fetch('/api/artist/onboarding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                artistId,
                completedAt: new Date().toISOString(),
            }),
        });
    }
    catch (error) {
        console.error('Error marking onboarding as complete:', error);
    }
}
export function getOnboardingRecommendations(status: OnboardingStatus, data: OnboardingData) {
    const recommendations: Array<{
        title: string;
        description: string;
        action: string;
        href: string;
        priority: 'high' | 'medium' | 'low';
    }> = [];
    if (!data.hasProfile) {
        recommendations.push({
            title: 'Complete Your Profile',
            description: 'Add your bio, social links, and brand colors',
            action: 'Complete Profile',
            href: '/dashboard/settings?tab=profile',
            priority: 'high',
        });
    }
    if (!data.hasFans) {
        recommendations.push({
            title: 'Add Your First Fans',
            description: 'Import contacts or add subscribers manually',
            action: 'Add Fans',
            href: '/dashboard/fans',
            priority: 'high',
        });
    }
    if (!data.hasCampaigns) {
        recommendations.push({
            title: 'Create Your First Campaign',
            description: 'Send a welcome message or announce your latest release',
            action: 'Create Campaign',
            href: '/dashboard/campaigns/create',
            priority: 'high',
        });
    }
    if (!data.hasDomain) {
        recommendations.push({
            title: 'Set Up Custom Domain',
            description: 'Improve deliverability with domain verification',
            action: 'Add Domain',
            href: '/dashboard/domain',
            priority: 'medium',
        });
    }
    if (data.hasFans && data.hasCampaigns && !data.hasSettings) {
        recommendations.push({
            title: 'Customize Your Settings',
            description: 'Set up automations and advanced features',
            action: 'Open Settings',
            href: '/dashboard/settings',
            priority: 'low',
        });
    }
    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
}

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

/**
 * Check if user needs onboarding based on their account status
 */
export function shouldShowOnboarding(artist: Artist, fans: Fan[], campaigns: Campaign[]): boolean {
  // Check if onboarding was explicitly completed
  if (artist.settings?.onboarding_completed) {
    return false;
  }
  
  // Check localStorage for completion or skip status
  if (typeof window !== 'undefined') {
    const skipped = localStorage.getItem(`onboarding-skipped-${artist.id}`);
    const completed = localStorage.getItem(`onboarding-completed-${artist.id}`);
    if (skipped || completed) {
      return false;
    }
  }
  
  // Show onboarding if user is new (created within last 7 days) and hasn't completed key actions
  const createdAt = new Date(artist.created_at);
  const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  
  // Always show for very new users (less than 1 day)
  if (daysSinceCreation < 1) {
    return true;
  }
  
  // Show for users within 7 days who haven't completed basic setup
  if (daysSinceCreation < 7) {
    const hasBasicSetup = fans.length > 0 || campaigns.length > 0;
    return !hasBasicSetup;
  }
  
  return false;
}

/**
 * Get the current onboarding status for a user
 */
export function getOnboardingStatus(artist: Artist, fans: Fan[], campaigns: Campaign[]): OnboardingStatus {
  const completedSteps: string[] = [];
  
  // Check profile completion
  if (artist.name && artist.bio && artist.settings?.timezone) {
    completedSteps.push('profile');
  }
  
  // Check if user has fans
  if (fans.length > 0) {
    completedSteps.push('audience');
  }
  
  // Check domain setup
  if (artist.ses_domain_verified) {
    completedSteps.push('domain');
  }
  
  // Check if user has created campaigns
  if (campaigns.length > 0) {
    completedSteps.push('campaign');
  }
  
  // Determine next step
  const allSteps = ['profile', 'audience', 'domain', 'campaign'];
  const nextStep = allSteps.find(step => !completedSteps.includes(step)) || null;
  
  // Calculate progress
  const progress = (completedSteps.length / allSteps.length) * 100;
  
  // Consider onboarding complete if user has profile, fans, and at least one campaign
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

/**
 * Get onboarding data for analytics and personalization
 */
export function getOnboardingData(artist: Artist, fans: Fan[], campaigns: Campaign[]): OnboardingData {
  return {
    hasProfile: !!(artist.name && artist.bio && artist.settings?.timezone),
    hasFans: fans.length > 0,
    hasDomain: artist.ses_domain_verified,
    hasCampaigns: campaigns.length > 0,
    hasSettings: !!(artist.settings?.brand_colors || artist.settings?.social_links),
  };
}

/**
 * Mark onboarding as completed for a user
 */
export async function completeOnboarding(artistId: string): Promise<void> {
  try {
    // Store completion in localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem(`onboarding-completed-${artistId}`, 'true');
      localStorage.removeItem(`onboarding-skipped-${artistId}`);
    }
    
    // Also store in database
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
  } catch (error) {
    console.error('Error marking onboarding as complete:', error);
    // Even if API fails, localStorage will prevent showing onboarding again
  }
}

/**
 * Get personalized recommendations based on onboarding status
 */
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
      action: 'Verify Domain',
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
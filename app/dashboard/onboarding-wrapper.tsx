"use client";

import React, { useState, useEffect } from 'react';
import { Artist, Fan, Campaign } from '@/lib/types';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import { completeOnboarding } from '@/lib/onboarding';

interface OnboardingWrapperProps {
  artist: Artist;
  fans: Fan[];
  campaigns: Campaign[];
  showOnboarding: boolean;
  children: React.ReactNode;
}

export function OnboardingWrapper({ 
  artist, 
  fans, 
  campaigns, 
  showOnboarding, 
  children 
}: OnboardingWrapperProps) {
  const [isOnboardingActive, setIsOnboardingActive] = useState(showOnboarding);
  const [hasUserSkipped, setHasUserSkipped] = useState(false);
  const [showProgressDismissed, setShowProgressDismissed] = useState(false);

  // Check localStorage for user preference on mount
  useEffect(() => {
    const skippedOnboarding = localStorage.getItem(`onboarding-skipped-${artist.id}`);
    const completedOnboarding = localStorage.getItem(`onboarding-completed-${artist.id}`);
    const progressDismissed = localStorage.getItem(`onboarding-progress-dismissed-${artist.id}`);
    
    // If onboarding was completed or skipped, don't show it
    if (skippedOnboarding || completedOnboarding) {
      setHasUserSkipped(true);
      setIsOnboardingActive(false);
    }
    
    if (progressDismissed) {
      setShowProgressDismissed(true);
    }
  }, [artist.id]);

  const handleOnboardingComplete = async () => {
    try {
      await completeOnboarding(artist.id);
      setIsOnboardingActive(false);
      setHasUserSkipped(false); // Reset skip state since they completed
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still hide onboarding even if API call fails (localStorage handles persistence)
      setIsOnboardingActive(false);
    }
  };

  const handleOnboardingSkip = () => {
    // Store skip preference in localStorage
    localStorage.setItem(`onboarding-skipped-${artist.id}`, 'true');
    setHasUserSkipped(true);
    setIsOnboardingActive(false);
  };

  const handleProgressDismiss = () => {
    localStorage.setItem(`onboarding-progress-dismissed-${artist.id}`, 'true');
    setShowProgressDismissed(true);
  };

  const handleStartOnboarding = () => {
    // Clear skip preference and start onboarding
    localStorage.removeItem(`onboarding-skipped-${artist.id}`);
    localStorage.removeItem(`onboarding-progress-dismissed-${artist.id}`);
    setHasUserSkipped(false);
    setShowProgressDismissed(false);
    setIsOnboardingActive(true);
  };

  // Show onboarding if it should be shown and user hasn't skipped
  if (isOnboardingActive && !hasUserSkipped) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <OnboardingWizard
          artist={artist}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </div>
    );
  }

  // Show regular dashboard
  return <>{children}</>;
}
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
export function OnboardingWrapper({ artist, fans, campaigns, showOnboarding, children }: OnboardingWrapperProps) {
    const [isOnboardingActive, setIsOnboardingActive] = useState(showOnboarding);
    const [hasUserSkipped, setHasUserSkipped] = useState(false);
    const [showProgressDismissed, setShowProgressDismissed] = useState(false);
    useEffect(() => {
        const skippedOnboarding = localStorage.getItem(`onboarding-skipped-${artist.id}`);
        const completedOnboarding = localStorage.getItem(`onboarding-completed-${artist.id}`);
        const progressDismissed = localStorage.getItem(`onboarding-progress-dismissed-${artist.id}`);
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
            setHasUserSkipped(false);
        }
        catch (error) {
            console.error('Error completing onboarding:', error);
            setIsOnboardingActive(false);
        }
    };
    const handleOnboardingSkip = () => {
        localStorage.setItem(`onboarding-skipped-${artist.id}`, 'true');
        setHasUserSkipped(true);
        setIsOnboardingActive(false);
    };
    const handleProgressDismiss = () => {
        localStorage.setItem(`onboarding-progress-dismissed-${artist.id}`, 'true');
        setShowProgressDismissed(true);
    };
    const handleStartOnboarding = () => {
        localStorage.removeItem(`onboarding-skipped-${artist.id}`);
        localStorage.removeItem(`onboarding-progress-dismissed-${artist.id}`);
        setHasUserSkipped(false);
        setShowProgressDismissed(false);
        setIsOnboardingActive(true);
    };
    if (isOnboardingActive && !hasUserSkipped) {
        return (<div className="fixed inset-0 z-50 bg-white">
        <OnboardingWizard artist={artist} onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip}/>
      </div>);
    }
    return <>{children}</>;
}

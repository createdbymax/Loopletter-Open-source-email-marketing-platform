"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { analytics } from '@/lib/posthog';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Identify user when they sign in
    if (isLoaded && user && analytics.isEnabled()) {
      analytics.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        created_at: user.createdAt,
      });
    }
  }, [user, isLoaded]);

  // Track page views
  useEffect(() => {
    if (analytics.isEnabled()) {
      analytics.page();
    }
  }, []);

  return <>{children}</>;
}
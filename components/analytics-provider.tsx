"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics, initGA } from '@/lib/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize analytics on mount
  useEffect(() => {
    // Initialize Google Analytics
    initGA();
  }, []);

  // Identify user when they sign in
  useEffect(() => {
    if (isLoaded && user && analytics.isEnabled()) {
      analytics.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        created_at: user.createdAt,
        user_type: 'artist', // Default user type for Loopletter
      });
    }
  }, [user, isLoaded]);

  // Track page views on route changes
  useEffect(() => {
    if (analytics.isEnabled()) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      analytics.page(pathname, {
        path: pathname,
        url: url,
        referrer: document.referrer,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
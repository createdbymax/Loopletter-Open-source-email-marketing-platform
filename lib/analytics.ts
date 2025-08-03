"use client";

import posthog from 'posthog-js';

// Google Analytics types
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') {
    return;
  }

  // Load Google Analytics script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Safe PostHog wrapper that handles errors gracefully
const posthogAnalytics = {
  track: (event: string, properties?: Record<string, any>) => {
    try {
      if (typeof window !== 'undefined' && posthog.__loaded) {
        posthog.capture(event, properties);
      }
    } catch (error) {
      console.warn('PostHog tracking failed:', error);
    }
  },

  identify: (userId: string, properties?: Record<string, any>) => {
    try {
      if (typeof window !== 'undefined' && posthog.__loaded) {
        posthog.identify(userId, properties);
      }
    } catch (error) {
      console.warn('PostHog identify failed:', error);
    }
  },

  page: (name?: string, properties?: Record<string, any>) => {
    try {
      if (typeof window !== 'undefined' && posthog.__loaded) {
        posthog.capture('$pageview', { page: name, ...properties });
      }
    } catch (error) {
      console.warn('PostHog page tracking failed:', error);
    }
  },

  reset: () => {
    try {
      if (typeof window !== 'undefined' && posthog.__loaded) {
        posthog.reset();
      }
    } catch (error) {
      console.warn('PostHog reset failed:', error);
    }
  },

  isEnabled: () => {
    try {
      return typeof window !== 'undefined' && posthog.__loaded;
    } catch (error) {
      return false;
    }
  },
};

// Google Analytics wrapper
const gaAnalytics = {
  track: (event: string, properties?: Record<string, any>) => {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event, properties);
      }
    } catch (error) {
      console.warn('Google Analytics tracking failed:', error);
    }
  },

  identify: (userId: string, properties?: Record<string, any>) => {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
          user_id: userId,
          custom_map: properties,
        });
      }
    } catch (error) {
      console.warn('Google Analytics identify failed:', error);
    }
  },

  page: (name?: string, properties?: Record<string, any>) => {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
          page_title: name || document.title,
          page_location: window.location.href,
          ...properties,
        });
      }
    } catch (error) {
      console.warn('Google Analytics page tracking failed:', error);
    }
  },

  isEnabled: () => {
    return typeof window !== 'undefined' && !!window.gtag && !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  },
};

// Unified analytics interface
export const analytics = {
  // Track events to both platforms
  track: (event: string, properties?: Record<string, any>) => {
    posthogAnalytics.track(event, properties);
    gaAnalytics.track(event, properties);
  },

  // Identify users on both platforms
  identify: (userId: string, properties?: Record<string, any>) => {
    posthogAnalytics.identify(userId, properties);
    gaAnalytics.identify(userId, properties);
  },

  // Track page views on both platforms
  page: (name?: string, properties?: Record<string, any>) => {
    posthogAnalytics.page(name, properties);
    gaAnalytics.page(name, properties);
  },

  // Reset user data on both platforms
  reset: () => {
    posthogAnalytics.reset();
    // Google Analytics doesn't have a reset method, but we can clear user_id
    if (gaAnalytics.isEnabled()) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: null,
      });
    }
  },

  // Check if analytics are enabled
  isEnabled: () => {
    return posthogAnalytics.isEnabled() || gaAnalytics.isEnabled();
  },

  // Individual platform access
  posthog: posthogAnalytics,
  ga: gaAnalytics,
};

// Export individual instances for direct access if needed
export { posthog };
export default analytics;
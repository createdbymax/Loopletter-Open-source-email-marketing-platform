import posthog from "posthog-js"

// Only initialize PostHog in production or when explicitly enabled
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  // Skip PostHog in development to avoid proxy issues
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_POSTHOG === 'true') {
    try {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NODE_ENV === 'production' ? "/ingest" : "https://us.i.posthog.com",
        ui_host: "https://us.posthog.com",
        capture_exceptions: false, // Disable to reduce errors during development
        debug: false, // Disable debug to reduce console noise
        autocapture: process.env.NODE_ENV === 'production', // Only autocapture in production
        disable_session_recording: true, // Disable session recording to prevent tab refresh issues
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog loaded successfully');
          }
        },
        // Reduce feature loading to prevent 431 errors
        advanced_disable_decide: process.env.NODE_ENV === 'development',
        disable_surveys: process.env.NODE_ENV === 'development',
        // Prevent page refreshes on tab focus/blur events
        capture_pageview: false, // Disable automatic pageview capture
        capture_pageleave: false, // Disable page leave tracking
        // disable_web_vitals: process.env.NODE_ENV === 'development',
      });
    } catch (error) {
      console.warn('PostHog initialization failed:', error);
    }
  } else {
    console.log('PostHog disabled in development mode');
  }
}
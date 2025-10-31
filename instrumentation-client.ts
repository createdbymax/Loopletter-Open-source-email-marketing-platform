import posthog from "posthog-js";
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_POSTHOG === 'true') {
        try {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
                api_host: process.env.NODE_ENV === 'production' ? "/ingest" : "https://us.i.posthog.com",
                ui_host: "https://us.posthog.com",
                capture_exceptions: false,
                debug: false,
                autocapture: process.env.NODE_ENV === 'production',
                disable_session_recording: true,
                loaded: (posthog) => {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('PostHog loaded successfully');
                    }
                },
                advanced_disable_decide: process.env.NODE_ENV === 'development',
                disable_surveys: process.env.NODE_ENV === 'development',
                capture_pageview: false,
                capture_pageleave: false,
            });
        }
        catch (error) {
            console.warn('PostHog initialization failed:', error);
        }
    }
    else {
        console.log('PostHog disabled in development mode');
    }
}

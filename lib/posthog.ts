import posthog from 'posthog-js';

// Safe PostHog wrapper that handles errors gracefully
export const analytics = {
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
  }
};

// Export posthog instance for direct access if needed
export { posthog };
export default analytics;
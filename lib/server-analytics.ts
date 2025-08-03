import { PostHog } from 'posthog-node';

// Server-side PostHog client
let posthogClient: PostHog | null = null;

if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  });
}

// Server-side analytics wrapper
export const serverAnalytics = {
  track: async (userId: string, event: string, properties?: Record<string, any>) => {
    try {
      if (posthogClient) {
        posthogClient.capture({
          distinctId: userId,
          event,
          properties,
        });
      }
    } catch (error) {
      console.warn('Server analytics tracking failed:', error);
    }
  },

  identify: async (userId: string, properties?: Record<string, any>) => {
    try {
      if (posthogClient) {
        posthogClient.identify({
          distinctId: userId,
          properties,
        });
      }
    } catch (error) {
      console.warn('Server analytics identify failed:', error);
    }
  },

  flush: async () => {
    try {
      if (posthogClient) {
        await posthogClient.flush();
      }
    } catch (error) {
      console.warn('Server analytics flush failed:', error);
    }
  },

  shutdown: async () => {
    try {
      if (posthogClient) {
        await posthogClient.shutdown();
      }
    } catch (error) {
      console.warn('Server analytics shutdown failed:', error);
    }
  },

  isEnabled: () => {
    return !!posthogClient;
  },
};

export default serverAnalytics;
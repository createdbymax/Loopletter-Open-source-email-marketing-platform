import * as Sentry from '@sentry/nextjs';

// Initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
    environment: process.env.NODE_ENV,
  });
}

// Helper function to log errors
export function logError(error: Error, context?: Record<string, any>) {
  console.error('Error:', error);
  
  // Log to Sentry if available
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

// Helper function to log events
export function logEvent(name: string, data?: Record<string, any>) {
  console.log(`Event: ${name}`, data);
  
  // Log to Sentry if available
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(`Event: ${name}`, {
      level: 'info',
      extra: data,
    });
  }
}

// Helper function to start performance monitoring
export function startTransaction(name: string, op: string) {
  if (!process.env.SENTRY_DSN) {
    return null;
  }
  
  return Sentry.startTransaction({
    name,
    op,
  });
}

// Helper function to set user information for monitoring
export function setUser(id: string, email?: string, username?: string) {
  if (!process.env.SENTRY_DSN) {
    return;
  }
  
  Sentry.setUser({
    id,
    email,
    username,
  });
}

// Helper function to clear user information
export function clearUser() {
  if (!process.env.SENTRY_DSN) {
    return;
  }
  
  Sentry.setUser(null);
}
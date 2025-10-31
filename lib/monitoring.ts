import * as Sentry from '@sentry/nextjs';
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 1.0,
        environment: process.env.NODE_ENV,
    });
}
export function logError(error: Error, context?: Record<string, any>) {
    console.error('Error:', error);
    if (process.env.SENTRY_DSN) {
        Sentry.captureException(error, {
            extra: context,
        });
    }
}
export function logEvent(name: string, data?: Record<string, any>) {
    console.log(`Event: ${name}`, data);
    if (process.env.SENTRY_DSN) {
        Sentry.captureMessage(`Event: ${name}`, {
            level: 'info',
            extra: data,
        });
    }
}
export function startTransaction(name: string, op: string) {
    if (!process.env.SENTRY_DSN) {
        return null;
    }
    return {
        setTag: (key: string, value: string) => Sentry.setTag(key, value),
        setData: (key: string, value: any) => Sentry.setContext(key, value),
        finish: () => {
            console.log(`Transaction completed: ${name} (${op})`);
        },
    };
}
export function withPerformanceMonitoring<T>(name: string, op: string, fn: () => T | Promise<T>): T | Promise<T> {
    if (!process.env.SENTRY_DSN) {
        return fn();
    }
    return Sentry.startSpan({ name, op }, fn);
}
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
export function clearUser() {
    if (!process.env.SENTRY_DSN) {
        return;
    }
    Sentry.setUser(null);
}

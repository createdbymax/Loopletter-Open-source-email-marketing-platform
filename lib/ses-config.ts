import { SESClient } from '@aws-sdk/client-ses';
import { sesQuotaTracker } from './ses-quota-tracker';
export const ses = new SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});
export const SES_CONFIG = {
    isSandbox: process.env.SES_SANDBOX === 'true',
    configurationSet: process.env.SES_CONFIGURATION_SET || 'default',
    defaultSenderDomain: process.env.SES_DEFAULT_SENDER_DOMAIN || 'loopletter.co',
    limits: {
        maxSendRate: parseInt(process.env.SES_MAX_SEND_RATE || '12', 10),
        maxDailyQuota: parseInt(process.env.SES_MAX_DAILY_QUOTA || '40000', 10),
    },
    batch: {
        size: parseInt(process.env.SES_BATCH_SIZE || '12', 10),
        intervalMs: parseInt(process.env.SES_BATCH_INTERVAL || '1000', 10),
    },
    retry: {
        maxRetries: parseInt(process.env.SES_MAX_RETRIES || '3', 10),
        backoffFactor: parseInt(process.env.SES_BACKOFF_FACTOR || '2', 10),
        initialDelay: parseInt(process.env.SES_INITIAL_DELAY || '1000', 10),
    }
};
export async function isEmailVerifiedInSandbox(email: string): Promise<boolean> {
    if (!SES_CONFIG.isSandbox) {
        return true;
    }
    try {
        return email.endsWith('@example.com') ||
            email.endsWith('@test.com') ||
            email.endsWith('@loopletter.co');
    }
    catch (error) {
        console.error('Error checking if email is verified:', error);
        return false;
    }
}
class SESRateLimiter {
    private sentInCurrentSecond = 0;
    private currentSecondStart = 0;
    constructor() {
        this.resetCounters();
    }
    private resetCounters() {
        const now = Date.now();
        this.currentSecondStart = Math.floor(now / 1000) * 1000;
        this.sentInCurrentSecond = 0;
    }
    async canSendEmail(): Promise<{
        canSend: boolean;
        reason?: string;
        waitTime?: number;
    }> {
        const now = Date.now();
        const currentSecond = Math.floor(now / 1000) * 1000;
        if (currentSecond > this.currentSecondStart) {
            this.sentInCurrentSecond = 0;
            this.currentSecondStart = currentSecond;
        }
        const remainingQuota = await sesQuotaTracker.getRemainingQuota(SES_CONFIG.limits.maxDailyQuota);
        if (remainingQuota <= 0) {
            return {
                canSend: false,
                reason: `Daily quota of ${SES_CONFIG.limits.maxDailyQuota} emails exceeded`,
            };
        }
        if (this.sentInCurrentSecond >= SES_CONFIG.limits.maxSendRate) {
            const waitTime = 1000 - (now - this.currentSecondStart);
            return {
                canSend: false,
                reason: `Rate limit of ${SES_CONFIG.limits.maxSendRate} emails/second exceeded`,
                waitTime,
            };
        }
        return { canSend: true };
    }
    async recordEmailSent() {
        this.sentInCurrentSecond++;
        await sesQuotaTracker.incrementCount(1);
    }
    async getStats() {
        const todayCount = await sesQuotaTracker.loadTodayCount();
        return {
            sentInCurrentSecond: this.sentInCurrentSecond,
            sentToday: todayCount,
            remainingToday: SES_CONFIG.limits.maxDailyQuota - todayCount,
            remainingThisSecond: SES_CONFIG.limits.maxSendRate - this.sentInCurrentSecond,
        };
    }
}
export const sesRateLimiter = new SESRateLimiter();
export function calculateBatchDelay(emailCount: number): number {
    const { maxSendRate } = SES_CONFIG.limits;
    const { size: batchSize } = SES_CONFIG.batch;
    if (batchSize <= maxSendRate) {
        return SES_CONFIG.batch.intervalMs;
    }
    const secondsNeeded = Math.ceil(batchSize / maxSendRate);
    return secondsNeeded * 1000;
}
export async function estimateCampaignDuration(emailCount: number): Promise<{
    estimatedSeconds: number;
    estimatedMinutes: number;
    canSendToday: boolean;
}> {
    const { maxSendRate, maxDailyQuota } = SES_CONFIG.limits;
    const stats = await sesRateLimiter.getStats();
    const canSendToday = (stats.remainingToday >= emailCount);
    const estimatedSeconds = Math.ceil(emailCount / maxSendRate);
    const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
    return {
        estimatedSeconds,
        estimatedMinutes,
        canSendToday,
    };
}

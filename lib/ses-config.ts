import { SESClient } from '@aws-sdk/client-ses';

// Initialize SES client with proper configuration
export const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// SES Configuration settings
export const SES_CONFIG = {
  // Whether we're in sandbox mode (limited sending)
  isSandbox: process.env.SES_SANDBOX === 'true',

  // Configuration set for tracking email events
  configurationSet: process.env.SES_CONFIGURATION_SET || 'default',

  // Default sender domain
  defaultSenderDomain: process.env.SES_DEFAULT_SENDER_DOMAIN || 'loopletter.com',

  // AWS SES Limits - Your specified limits
  limits: {
    // Maximum emails per second
    maxSendRate: parseInt(process.env.SES_MAX_SEND_RATE || '12', 10),
    // Maximum emails per 24-hour period
    maxDailyQuota: parseInt(process.env.SES_MAX_DAILY_QUOTA || '40000', 10),
  },

  // Batch processing configuration
  batch: {
    // Maximum batch size for processing (should not exceed rate limit)
    size: parseInt(process.env.SES_BATCH_SIZE || '12', 10),
    // Interval between batches in milliseconds (1000ms = 1 second)
    intervalMs: parseInt(process.env.SES_BATCH_INTERVAL || '1000', 10),
  },

  // Retry configuration
  retry: {
    maxRetries: parseInt(process.env.SES_MAX_RETRIES || '3', 10),
    backoffFactor: parseInt(process.env.SES_BACKOFF_FACTOR || '2', 10),
    initialDelay: parseInt(process.env.SES_INITIAL_DELAY || '1000', 10),
  }
};

// Helper function to check if an email is verified in sandbox mode
export async function isEmailVerifiedInSandbox(email: string): Promise<boolean> {
  if (!SES_CONFIG.isSandbox) {
    // If not in sandbox mode, all emails are considered "verified"
    return true;
  }

  try {
    // In a real implementation, you would check against the list of verified emails
    // For now, we'll just check if the email ends with a test domain
    return email.endsWith('@example.com') ||
      email.endsWith('@test.com') ||
      email.endsWith('@loopletter.com');
  } catch (error) {
    console.error('Error checking if email is verified:', error);
    return false;
  }
}

// Rate limiting and quota tracking
class SESRateLimiter {
  private sentInCurrentSecond = 0;
  private currentSecondStart = 0;
  private sentToday = 0;
  private todayStart = 0;

  constructor() {
    this.resetCounters();
  }

  private resetCounters() {
    const now = Date.now();
    this.currentSecondStart = Math.floor(now / 1000) * 1000;
    this.todayStart = new Date().setHours(0, 0, 0, 0);
    this.sentInCurrentSecond = 0;
    // Note: sentToday should be loaded from persistent storage in production
    this.sentToday = 0;
  }

  async canSendEmail(): Promise<{ canSend: boolean; reason?: string; waitTime?: number }> {
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000) * 1000;
    const today = new Date().setHours(0, 0, 0, 0);

    // Reset second counter if we're in a new second
    if (currentSecond > this.currentSecondStart) {
      this.sentInCurrentSecond = 0;
      this.currentSecondStart = currentSecond;
    }

    // Reset daily counter if it's a new day
    if (today > this.todayStart) {
      this.sentToday = 0;
      this.todayStart = today;
    }

    // Check daily quota
    if (this.sentToday >= SES_CONFIG.limits.maxDailyQuota) {
      return {
        canSend: false,
        reason: `Daily quota of ${SES_CONFIG.limits.maxDailyQuota} emails exceeded`,
      };
    }

    // Check rate limit
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

  recordEmailSent() {
    this.sentInCurrentSecond++;
    this.sentToday++;
  }

  getStats() {
    return {
      sentInCurrentSecond: this.sentInCurrentSecond,
      sentToday: this.sentToday,
      remainingToday: SES_CONFIG.limits.maxDailyQuota - this.sentToday,
      remainingThisSecond: SES_CONFIG.limits.maxSendRate - this.sentInCurrentSecond,
    };
  }
}

// Export singleton instance
export const sesRateLimiter = new SESRateLimiter();

// Helper function to calculate optimal batch delay
export function calculateBatchDelay(emailCount: number): number {
  const { maxSendRate } = SES_CONFIG.limits;
  const { size: batchSize } = SES_CONFIG.batch;

  // If batch size is within rate limit, use standard interval
  if (batchSize <= maxSendRate) {
    return SES_CONFIG.batch.intervalMs;
  }

  // Otherwise, calculate delay to stay within rate limit
  const secondsNeeded = Math.ceil(batchSize / maxSendRate);
  return secondsNeeded * 1000;
}

// Helper function to estimate campaign send time
export function estimateCampaignDuration(emailCount: number): {
  estimatedSeconds: number;
  estimatedMinutes: number;
  canSendToday: boolean;
} {
  const { maxSendRate, maxDailyQuota } = SES_CONFIG.limits;
  const stats = sesRateLimiter.getStats();

  const canSendToday = (stats.remainingToday >= emailCount);
  const estimatedSeconds = Math.ceil(emailCount / maxSendRate);
  const estimatedMinutes = Math.ceil(estimatedSeconds / 60);

  return {
    estimatedSeconds,
    estimatedMinutes,
    canSendToday,
  };
}
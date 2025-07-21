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

  // Maximum batch size for sending emails
  batchSize: parseInt(process.env.SES_BATCH_SIZE || '50', 10),

  // Rate limit (emails per second)
  rateLimit: parseInt(process.env.SES_RATE_LIMIT || '14', 10),

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
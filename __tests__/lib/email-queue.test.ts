import { queueEmail, getQueueStatus } from '@/lib/email-queue';
import { logEmailSent } from '@/lib/db';
import { ses } from '@/lib/ses-config';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  logEmailSent: jest.fn(),
}));

jest.mock('@/lib/ses-config', () => ({
  ses: {
    send: jest.fn().mockResolvedValue({ MessageId: 'test-message-id' }),
  },
  SES_CONFIG: {
    batchSize: 10,
    rateLimit: 10,
    retry: {
      maxRetries: 3,
      backoffFactor: 2,
      initialDelay: 100,
    },
  },
}));

describe('Email Queue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should queue an email and return an ID', async () => {
    const campaignId = 'test-campaign';
    const fanId = 'test-fan';
    const email = 'test@example.com';
    const params = {
      Source: 'test@sender.com',
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Test Subject',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: '<p>Test Body</p>',
            Charset: 'UTF-8',
          },
          Text: {
            Data: 'Test Body',
            Charset: 'UTF-8',
          },
        },
      },
    };

    const id = await queueEmail(campaignId, fanId, email, params);
    
    // Check that an ID was returned
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    
    // Check queue status
    const status = getQueueStatus();
    expect(status.queueLength).toBeGreaterThan(0);
  });

  // More tests would be added here for:
  // - Testing successful email sending
  // - Testing retry logic
  // - Testing rate limiting
  // - Testing error handling
});
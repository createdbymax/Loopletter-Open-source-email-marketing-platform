import { Queue, Job } from 'bullmq';
import Redis from 'ioredis';
import { sendCampaignEmail } from './email-sender';
import { getCampaignById, getArtistById, getFansByArtist, updateCampaign, getFanById } from './db';
import { SES_CONFIG, calculateBatchDelay, estimateCampaignDuration } from './ses-config';

// Redis connection configuration for Vercel/Upstash
const getRedisConfig = () => {
  // For Upstash Redis
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const url = new URL(process.env.UPSTASH_REDIS_REST_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: process.env.UPSTASH_REDIS_REST_TOKEN,
      username: 'default',
      tls: {},
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      connectTimeout: 10000,
      commandTimeout: 5000,
    };
  }

  // Fallback for other Redis providers
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password,
      username: url.username || 'default',
      tls: url.protocol === 'rediss:' ? {} : undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 2,
    };
  }

  // Local development fallback
  return {
    host: 'localhost',
    port: 6379,
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  };
};

// Create Redis connection
let redis: Redis | null = null;

function getRedisConnection() {
  if (!redis) {
    redis = new Redis(getRedisConfig());
  }
  return redis;
}

// Email queue configuration
let _emailQueue: Queue | null = null;

export function getEmailQueue() {
  if (!_emailQueue) {
    _emailQueue = new Queue('email-sending', {
      connection: getRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });
  }
  return _emailQueue;
}

// Export emailQueue for compatibility
export const emailQueue = getEmailQueue();

// Job types
export interface CampaignEmailJob {
  campaignId: string;
  fanId: string;
  artistId: string;
}

export interface BulkCampaignJob {
  campaignId: string;
  batchSize?: number;
}

// Add individual email to queue
export async function queueCampaignEmail(campaignId: string, fanId: string, artistId: string) {
  const jobData: CampaignEmailJob = {
    campaignId,
    fanId,
    artistId,
  };

  const queue = getEmailQueue();
  return await queue.add('send-campaign-email', jobData, {
    // Add delay to respect rate limits based on SES configuration
    delay: calculateBatchDelay(1), // Calculate appropriate delay for single email
  });
}

// Add bulk campaign to queue (processes in batches)
export async function queueBulkCampaign(campaignId: string, batchSize: number = 25) {
  const jobData: BulkCampaignJob = {
    campaignId,
    batchSize,
  };

  console.log(`Queueing bulk campaign: ${campaignId} with batch size: ${batchSize}`);
  const queue = getEmailQueue();
  const job = await queue.add('send-bulk-campaign', jobData, {
    priority: 10, // Higher priority for bulk operations
  });
  console.log(`Bulk campaign job created: ID=${job.id}, Name=${job.name}`);

  return job;
}

// Process jobs via API endpoints for serverless
export async function processJobById(jobId: string): Promise<{ processed: boolean; result?: any; error?: string }> {
  const queue = getEmailQueue();

  try {
    console.log(`Processing job ${jobId}...`);
    const job = await queue.getJob(jobId);

    if (!job) {
      console.log(`Job ${jobId} not found`);
      return { processed: false };
    }

    console.log(`Job ${jobId} found: ${job.name}, state: ${await job.getState()}`);

    const { name, data } = job;
    let result;

    try {
      console.log(`Processing job ${jobId} of type ${name}`);

      // Process the job logic without using BullMQ's job state management
      switch (name) {
        case 'send-campaign-email':
          result = await processCampaignEmailServerless(data as CampaignEmailJob);
          break;

        case 'send-bulk-campaign':
          result = await processBulkCampaignServerless(data as BulkCampaignJob);
          break;

        case 'test-job':
          // Handle test jobs
          console.log(`Processing test job ${jobId}`);
          result = { success: true, message: 'Test job processed' };
          break;

        default:
          throw new Error(`Unknown job type: ${name}`);
      }

      // Remove the job from the queue manually since we can't use moveToCompleted
      await job.remove();
      console.log(`Job ${jobId} completed and removed successfully`);

      return { processed: true, result };

    } catch (error) {
      console.error(`Job ${jobId} processing failed:`, error);
      // Remove failed job as well to prevent infinite retries
      await job.remove();
      throw error;
    }
  } catch (error) {
    console.error(`Error processing job ${jobId}:`, error);
    console.error(`Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    return { processed: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Serverless version of processCampaignEmail
async function processCampaignEmailServerless(data: CampaignEmailJob) {
  const { campaignId, fanId, artistId } = data;

  console.log(`Processing campaign email: Campaign ${campaignId}, Fan ${fanId}, Artist ${artistId}`);

  // Fetch required data with individual error handling
  let campaign, fan, artist;

  try {
    campaign = await getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    console.log(`Campaign ${campaignId} found:`, !!campaign);
  } catch (error) {
    console.error(`Error fetching campaign ${campaignId}:`, error);
    throw new Error(`Failed to fetch campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    fan = await getFanById(fanId);
    if (!fan) {
      throw new Error('Fan not found');
    }
    console.log(`Fan ${fanId} found:`, !!fan);
  } catch (error) {
    console.error(`Error fetching fan ${fanId}:`, error);
    throw new Error(`Failed to fetch fan: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    artist = await getArtistById(artistId);
    if (!artist) {
      throw new Error('Artist not found');
    }
    console.log(`Artist ${artistId} found:`, !!artist);
  } catch (error) {
    console.error(`Error fetching artist ${artistId}:`, error);
    throw new Error(`Failed to fetch artist: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Validate data
  if (!campaign || !fan || !artist) {
    throw new Error(`Missing required data - Campaign: ${!!campaign}, Fan: ${!!fan}, Artist: ${!!artist}`);
  }

  // Skip if fan is unsubscribed
  if (fan.status !== 'subscribed') {
    console.log(`Skipping email to ${fan.email} - status: ${fan.status}`);
    return { skipped: true, reason: 'unsubscribed' };
  }

  // Send the email
  const result = await sendCampaignEmail(campaign, fan, artist);

  if (!result.success) {
    throw new Error(`Failed to send email: ${result.error}`);
  }

  // Update campaign stats
  try {
    console.log(`Updating campaign stats for ${campaignId}: incrementing total_sent from ${campaign.stats?.total_sent || 0} to ${(campaign.stats?.total_sent || 0) + 1}`);
    await updateCampaign(campaignId, {
      stats: {
        ...campaign.stats,
        total_sent: (campaign.stats?.total_sent || 0) + 1,
      },
      updated_at: new Date().toISOString(),
    });
    console.log(`Campaign stats updated successfully for ${campaignId}`);
  } catch (err) {
    console.error(`Failed to update campaign stats for ${campaignId}:`, err);
    console.error(`Stats update error details:`, err);
  }

  // Check if this was the last email for this campaign
  try {
    console.log(`Checking if campaign ${campaignId} should be finalized...`);

    // Get the updated campaign stats to see how many emails were supposed to be sent
    const updatedCampaign = await getCampaignById(campaignId);
    if (!updatedCampaign) {
      console.log(`Campaign ${campaignId} not found for finalization check`);
      return {
        success: true,
        messageId: result.messageId,
        fanEmail: fan.email,
      };
    }

    // Get the total number of subscribed fans for this artist
    const allFans = await getFansByArtist(updatedCampaign.artist_id);
    const subscribedFansCount = allFans.filter(f => f.status === 'subscribed').length;
    const totalSent = updatedCampaign.stats?.total_sent || 0;

    console.log(`Campaign ${campaignId}: ${totalSent}/${subscribedFansCount} emails sent`);

    // If we've sent emails to all subscribed fans, mark as sent
    if (totalSent >= subscribedFansCount) {
      console.log(`All emails sent for campaign ${campaignId} (${totalSent}/${subscribedFansCount}), marking as sent`);
      await updateCampaign(campaignId, {
        status: 'sent',
        updated_at: new Date().toISOString(),
      });
      console.log(`Campaign ${campaignId} successfully marked as sent`);
    } else {
      console.log(`Campaign ${campaignId} still needs ${subscribedFansCount - totalSent} more emails, keeping status as sending`);
      
      // Fallback: if this is a single-recipient campaign and stats update failed, mark as sent anyway
      if (subscribedFansCount === 1) {
        console.log(`Fallback: Single-recipient campaign ${campaignId}, marking as sent despite stats mismatch`);
        await updateCampaign(campaignId, {
          status: 'sent',
          updated_at: new Date().toISOString(),
        });
        console.log(`Campaign ${campaignId} marked as sent via fallback`);
      }
    }
  } catch (err) {
    console.error(`Failed to finalize campaign ${campaignId}:`, err);
  }

  return {
    success: true,
    messageId: result.messageId,
    fanEmail: fan.email,
  };
}

// Process individual campaign email (original version for worker compatibility)
async function processCampaignEmail(job: Job, data: CampaignEmailJob) {
  const { campaignId, fanId, artistId } = data;

  // Update job progress
  await job.updateProgress(10);

  // Fetch required data with individual error handling
  let campaign, fan, artist;

  try {
    campaign = await getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    console.log(`Campaign ${campaignId} found:`, !!campaign);
  } catch (error) {
    console.error(`Error fetching campaign ${campaignId}:`, error);
    throw new Error(`Failed to fetch campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    fan = await getFanById(fanId);
    if (!fan) {
      throw new Error('Fan not found');
    }
    console.log(`Fan ${fanId} found:`, !!fan);
  } catch (error) {
    console.error(`Error fetching fan ${fanId}:`, error);
    throw new Error(`Failed to fetch fan: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    artist = await getArtistById(artistId);
    if (!artist) {
      throw new Error('Artist not found');
    }
    console.log(`Artist ${artistId} found:`, !!artist);
  } catch (error) {
    console.error(`Error fetching artist ${artistId}:`, error);
    throw new Error(`Failed to fetch artist: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  await job.updateProgress(30);

  // Validate data
  if (!campaign || !fan || !artist) {
    throw new Error(`Missing required data - Campaign: ${!!campaign}, Fan: ${!!fan}, Artist: ${!!artist}`);
  }

  // Skip if fan is unsubscribed
  if (fan.status !== 'subscribed') {
    console.log(`Skipping email to ${fan.email} - status: ${fan.status}`);
    return { skipped: true, reason: 'unsubscribed' };
  }

  await job.updateProgress(50);

  // Send the email
  const result = await sendCampaignEmail(campaign, fan, artist);

  await job.updateProgress(90);

  if (!result.success) {
    throw new Error(`Failed to send email: ${result.error}`);
  }

  await job.updateProgress(100);

  // Update campaign stats
  try {
    await updateCampaign(campaignId, {
      stats: {
        ...campaign.stats,
        total_sent: (campaign.stats?.total_sent || 0) + 1,
      },
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`Failed to update campaign stats for ${campaignId}:`, err);
  }

  // If no more jobs exist for this campaign, mark as sent
  try {
    const queue = getEmailQueue();
    const remaining = await queue.getJobs(['waiting', 'delayed', 'active']);
    const hasMore = remaining.some(
      (j) => j.name === 'send-campaign-email' && j.data.campaignId === campaignId
    );
    if (!hasMore) {
      await updateCampaign(campaignId, {
        status: 'sent',
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error(`Failed to finalize campaign ${campaignId}:`, err);
  }

  return {
    success: true,
    messageId: result.messageId,
    fanEmail: fan.email,
  };
}

// Serverless version of processBulkCampaign
async function processBulkCampaignServerless(data: BulkCampaignJob) {
  const { campaignId, batchSize = 50 } = data;

  console.log(`Processing bulk campaign: ${campaignId} with batch size: ${batchSize}`);

  // Get campaign and artist data
  const campaign = await getCampaignById(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  const artist = await getArtistById(campaign.artist_id);
  if (!artist) {
    throw new Error('Artist not found');
  }

  // Get all subscribed fans
  const allFans = await getFansByArtist(campaign.artist_id);
  const subscribedFans = allFans.filter(fan => fan.status === 'subscribed');

  if (subscribedFans.length === 0) {
    throw new Error('No subscribed fans found');
  }

  console.log(`Found ${subscribedFans.length} subscribed fans for campaign ${campaignId}`);

  // Update campaign status to 'sending'
  await updateCampaign(campaignId, {
    status: 'sending',
    updated_at: new Date().toISOString(),
  });

  // Check if we can send all emails today
  const estimate = await estimateCampaignDuration(subscribedFans.length);
  if (!estimate.canSendToday) {
    throw new Error(`Cannot send ${subscribedFans.length} emails today. Daily quota would be exceeded.`);
  }

  // Process fans in batches respecting SES limits
  const totalFans = subscribedFans.length;
  let processedFans = 0;
  const jobs = [];
  const optimalBatchSize = Math.min(batchSize, SES_CONFIG.batch.size);

  for (let i = 0; i < subscribedFans.length; i += optimalBatchSize) {
    const batch = subscribedFans.slice(i, i + optimalBatchSize);

    // Create individual email jobs for this batch with proper delays
    const batchJobs = batch.map((fan, index) => {
      const delay = calculateBatchDelay(1) * index; // Stagger emails within batch
      return queueCampaignEmail(campaignId, fan.id, campaign.artist_id);
    });

    jobs.push(...batchJobs);
    processedFans += batch.length;

    console.log(`Queued batch ${Math.floor(i / optimalBatchSize) + 1}: ${batch.length} emails (${processedFans}/${totalFans} total)`);

    // Add delay between batches to respect rate limits
    if (i + optimalBatchSize < subscribedFans.length) {
      const batchDelay = calculateBatchDelay(optimalBatchSize);
      await new Promise(resolve => setTimeout(resolve, batchDelay));
    }
  }

  // Wait for all jobs to be queued
  await Promise.all(jobs);

  // Update campaign stats
  await updateCampaign(campaignId, {
    stats: {
      ...campaign.stats,
      total_sent: totalFans,
    },
    updated_at: new Date().toISOString(),
  });

  console.log(`Bulk campaign ${campaignId} completed: ${totalFans} emails queued`);

  return {
    success: true,
    totalQueued: totalFans,
    batchesCreated: Math.ceil(totalFans / batchSize),
  };
}

// Process bulk campaign (breaks into individual jobs) - original version for worker compatibility
async function processBulkCampaign(job: Job, data: BulkCampaignJob) {
  const { campaignId, batchSize = 50 } = data;

  await job.updateProgress(5);

  // Get campaign and artist data
  const campaign = await getCampaignById(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  const artist = await getArtistById(campaign.artist_id);
  if (!artist) {
    throw new Error('Artist not found');
  }

  await job.updateProgress(15);

  // Get all subscribed fans
  const allFans = await getFansByArtist(campaign.artist_id);
  const subscribedFans = allFans.filter(fan => fan.status === 'subscribed');

  if (subscribedFans.length === 0) {
    throw new Error('No subscribed fans found');
  }

  await job.updateProgress(25);

  // Update campaign status to 'sending'
  await updateCampaign(campaignId, {
    status: 'sending',
    updated_at: new Date().toISOString(),
  });

  // Check if we can send all emails today
  const estimate = await estimateCampaignDuration(subscribedFans.length);
  if (!estimate.canSendToday) {
    throw new Error(`Cannot send ${subscribedFans.length} emails today. Daily quota would be exceeded.`);
  }

  // Process fans in batches respecting SES limits
  const totalFans = subscribedFans.length;
  let processedFans = 0;
  const jobs = [];
  const optimalBatchSize = Math.min(batchSize, SES_CONFIG.batch.size);

  for (let i = 0; i < subscribedFans.length; i += optimalBatchSize) {
    const batch = subscribedFans.slice(i, i + optimalBatchSize);

    // Create individual email jobs for this batch with proper delays
    const batchJobs = batch.map((fan, index) => {
      // Stagger emails within batch
      return queueCampaignEmail(campaignId, fan.id, campaign.artist_id);
    });

    jobs.push(...batchJobs);
    processedFans += batch.length;

    // Update progress
    const progress = 25 + (processedFans / totalFans) * 70;
    await job.updateProgress(Math.round(progress));

    // Add delay between batches to respect rate limits
    if (i + optimalBatchSize < subscribedFans.length) {
      const batchDelay = calculateBatchDelay(optimalBatchSize);
      await new Promise(resolve => setTimeout(resolve, batchDelay));
    }
  }

  // Wait for all jobs to be queued
  await Promise.all(jobs);

  await job.updateProgress(100);

  // Update campaign stats
  await updateCampaign(campaignId, {
    stats: {
      ...campaign.stats,
      total_sent: totalFans,
    },
    updated_at: new Date().toISOString(),
  });

  return {
    success: true,
    totalQueued: totalFans,
    batchesCreated: Math.ceil(totalFans / batchSize),
  };
}

// Queue monitoring functions
export async function getQueueStats() {
  const queue = getEmailQueue();
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaiting(),
    queue.getActive(),
    queue.getCompleted(),
    queue.getFailed(),
  ]);

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    total: waiting.length + active.length + completed.length + failed.length,
  };
}

export async function getJobStatus(jobId: string) {
  const queue = getEmailQueue();
  const job = await queue.getJob(jobId);
  if (!job) return null;

  return {
    id: job.id,
    name: job.name,
    data: job.data,
    progress: job.progress,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    failedReason: job.failedReason,
    returnvalue: job.returnvalue,
  };
}

// Cleanup function
export async function cleanupQueue() {
  const queue = getEmailQueue();
  await queue.clean(24 * 60 * 60 * 1000, 50, 'completed'); // Clean completed jobs older than 24 hours
  await queue.clean(7 * 24 * 60 * 60 * 1000, 25, 'failed'); // Clean failed jobs older than 7 days
}

// Graceful shutdown for serverless
export async function closeConnections() {
  if (_emailQueue) {
    await _emailQueue.close();
  }
  if (redis) {
    await redis.quit();
    redis = null;
  }
  _emailQueue = null;
}

// Export the supabase import for the helper function

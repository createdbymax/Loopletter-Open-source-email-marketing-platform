#!/usr/bin/env tsx

/**
 * Queue Worker for Email Sending
 * 
 * This script processes email sending jobs from the BullMQ queue.
 * Run with: npx tsx scripts/queue-worker.ts
 * 
 * For production, this should be run as a separate service or container.
 */

import dotenv from 'dotenv';
import { Worker, Job } from 'bullmq';
import { processJobById } from '../lib/email-queue';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🚀 Starting email queue worker...');

// Import the actual job processors
import { CampaignEmailJob, BulkCampaignJob } from '../lib/email-queue';
import { sendCampaignEmail } from '../lib/email-sender';
import { getCampaignById, getFanById, getArtistById, getFansByArtist, updateCampaign } from '../lib/db';
import { email } from 'zod';

// Create worker
const worker = new Worker('email-sending', async (job: Job) => {
  console.log(`📧 Processing job ${job.id}: ${job.name}`);
  
  try {
    let result;
    
    switch (job.name) {
      case 'send-campaign-email':
        result = await processCampaignEmail(job, job.data as CampaignEmailJob);
        break;
      
      case 'send-bulk-campaign':
        result = await processBulkCampaign(job, job.data as BulkCampaignJob);
        break;
      
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
    
    console.log(`✅ Job ${job.id} completed successfully`);
    return result;
    
  } catch (error) {
    console.error(`❌ Job ${job.id} failed:`, error);
    throw error;
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  concurrency: 1, // Process one job at a time to respect rate limits
  removeOnComplete: { count: 50 },
  removeOnFail: { count: 25 },
});

// Worker event handlers
worker.on('ready', () => {
  console.log('✅ Queue worker is ready and waiting for jobs');
});

worker.on('active', (job) => {
  console.log(`🔄 Processing job ${job.id}: ${job.name}`);
});

worker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('🚨 Worker error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down worker gracefully...');
  await worker.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down worker gracefully...');
  await worker.close();
  process.exit(0);
});

console.log('📬 Email queue worker is running. Press Ctrl+C to stop.');

// Process individual campaign email
async function processCampaignEmail(job: Job, data: CampaignEmailJob) {
  const { campaignId, fanId, artistId } = data;

  // Update job progress
  await job.updateProgress(10);

  // Fetch required data
  const [campaign, fan, artist] = await Promise.all([
    getCampaignById(campaignId),
    getFanById(fanId),
    getArtistById(artistId),
  ]);

  await job.updateProgress(30);

  // Validate data
  if (!campaign || !fan || !artist) {
    throw new Error('Missing required data for email sending');
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

  return {
    success: true,
    messageId: result.messageId,
    fanEmail: fan.email,
  };
}

// Process bulk campaign (breaks into individual jobs)
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

  // Import queue functions
  const { queueCampaignEmail } = await import('../lib/email-queue');
  const { calculateBatchDelay } = await import('../lib/ses-config');

  // Process fans in batches respecting SES limits
  const totalFans = subscribedFans.length;
  let processedFans = 0;
  const jobs = [];
  const optimalBatchSize = Math.min(batchSize, 12); // Respect SES rate limit

  for (let i = 0; i < subscribedFans.length; i += optimalBatchSize) {
    const batch = subscribedFans.slice(i, i + optimalBatchSize);
    
    // Create individual email jobs for this batch with proper delays
    const batchJobs = batch.map((fan, index) => {
      const delay = calculateBatchDelay(1) * index; // Stagger emails within batch
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
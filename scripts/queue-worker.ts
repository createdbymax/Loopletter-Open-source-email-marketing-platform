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
import { getEmailQueue, processJobById } from '../lib/email-queue';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🚀 Starting email queue worker...');

// Create worker
const worker = new Worker('email-sending', async (job: Job) => {
  console.log(`📧 Processing job ${job.id}: ${job.name}`);
  
  try {
    const result = await processJobById(job.id!);
    
    if (!result.processed) {
      throw new Error('Job could not be processed');
    }
    
    console.log(`✅ Job ${job.id} completed successfully`);
    return result.result;
    
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
  removeOnComplete: 50,
  removeOnFail: 25,
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
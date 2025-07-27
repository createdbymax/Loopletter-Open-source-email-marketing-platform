#!/usr/bin/env tsx

/**
 * Queue Test Script
 * 
 * This script tests the email queue system by adding test jobs.
 * Run this to verify your queue setup is working:
 * 
 * npx tsx scripts/test-queue.ts
 */

import { queueCampaignEmail, queueBulkCampaign, getQueueStats, closeConnections } from '../lib/email-queue';

async function testQueue() {
  console.log('🧪 Testing serverless email queue system...\n');

  try {
    // Test 1: Add a single email job
    console.log('1. Adding single email job...');
    const singleJob = await queueCampaignEmail(
      'test-campaign-id',
      'test-fan-id',
      'test-artist-id'
    );
    console.log(`   ✅ Job added with ID: ${singleJob.id}\n`);

    // Test 2: Add a bulk campaign job
    console.log('2. Adding bulk campaign job...');
    const bulkJob = await queueBulkCampaign('test-campaign-id', 5);
    console.log(`   ✅ Bulk job added with ID: ${bulkJob.id}\n`);

    // Test 3: Check queue stats
    console.log('3. Checking queue statistics...');
    const stats = await getQueueStats();
    console.log('   📊 Queue Stats:');
    console.log(`      - Waiting: ${stats.waiting}`);
    console.log(`      - Active: ${stats.active}`);
    console.log(`      - Completed: ${stats.completed}`);
    console.log(`      - Failed: ${stats.failed}`);
    console.log(`      - Total: ${stats.total}\n`);

    console.log('✅ Queue test completed successfully!');
    console.log('💡 Jobs will be processed automatically by Vercel cron job');
    console.log('🔗 Or manually trigger processing at: /api/queue/process');

  } catch (error) {
    console.error('❌ Queue test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Set up Upstash Redis: https://console.upstash.com/');
    console.log('   2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local');
    console.log('   3. Verify all dependencies are installed: npm install');
  } finally {
    await closeConnections();
  }

  process.exit(0);
}

testQueue();
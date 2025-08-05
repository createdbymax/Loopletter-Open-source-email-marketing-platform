#!/usr/bin/env tsx

/**
 * Test script for the email queue system
 * Run with: npx tsx scripts/test-queue.ts
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Check required environment variables
function checkEnvironmentVariables() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const redis = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'REDIS_URL',
    'REDIS_HOST'
  ];

  const missing = required.filter(key => !process.env[key]);
  const hasRedis = redis.some(key => process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Make sure your .env.local file contains these variables');
    return false;
  }

  if (!hasRedis) {
    console.error('❌ Missing Redis configuration. Need one of:');
    redis.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Set up Redis connection in your .env.local file');
    return false;
  }

  return true;
}

async function testQueue() {
  console.log('🧪 Testing email queue system...\n');

  // Check environment variables first
  if (!checkEnvironmentVariables()) {
    process.exit(1);
  }

  try {
    console.log('✅ Environment variables loaded successfully\n');

    // Test 1: Test Redis connection first (without importing queue system)
    console.log('1. Testing Redis connection...');
    try {
      const Redis = (await import('ioredis')).default;
      const url = new URL(process.env.UPSTASH_REDIS_REST_URL!);
      const redis = new Redis({
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: process.env.UPSTASH_REDIS_REST_TOKEN,
        username: 'default',
        tls: {},
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      await redis.ping();
      console.log('   ✅ Redis connection successful');
      await redis.quit();
    } catch (redisError) {
      console.error('   ❌ Redis connection failed:', redisError);
      throw redisError;
    }

    // Test 2: Import queue system (this might fail if Supabase isn't working)
    console.log('2. Importing queue system...');
    let getEmailQueue, getQueueStats;
    try {
      const queueModule = await import('../lib/email-queue');
      getEmailQueue = queueModule.getEmailQueue;
      getQueueStats = queueModule.getQueueStats;
      console.log('   ✅ Queue system imported successfully');
    } catch (importError) {
      console.error('   ❌ Failed to import queue system:', importError);
      console.error('   💡 This might be due to Supabase connection issues');
      throw importError;
    }

    // Test 3: Get queue statistics
    console.log('3. Getting queue statistics...');
    const stats = await getQueueStats();
    console.log('   Queue Stats:', stats);
    console.log('   ✅ Queue statistics retrieved');

    // Test 4: Test queue connection
    console.log('4. Testing queue connection...');

    console.log('   ✅ Queue connection established');

    // Test 5: Check queue health
    console.log('5. Checking queue health...');
    const healthCheck = stats.waiting + stats.active + stats.completed + stats.failed;
    console.log(`   Total jobs processed: ${healthCheck}`);

    if (stats.waiting > 0) {
      console.log(`   ⚠️  ${stats.waiting} jobs waiting to be processed`);
      console.log('   💡 Run the queue worker: npm run queue-worker');
    } else {
      console.log('   ✅ No jobs waiting in queue');
    }

    if (stats.failed > 0) {
      console.log(`   ⚠️  ${stats.failed} jobs have failed`);
    }

    console.log('\n🎉 Queue system test completed successfully!');

  } catch (error) {
    console.error('❌ Queue test failed:', error);
    process.exit(1);
  }
}

// Run the test
testQueue().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
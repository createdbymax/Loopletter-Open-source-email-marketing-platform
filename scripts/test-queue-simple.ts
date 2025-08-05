#!/usr/bin/env tsx

/**
 * Simple queue test without database dependencies
 * Run with: npx tsx scripts/test-queue-simple.ts
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testQueueSimple() {
  console.log('🧪 Testing queue system (simple)...\n');

  try {
    // Test 1: Check environment variables
    console.log('1. Checking environment variables...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    
    console.log(`   Supabase URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`);
    console.log(`   Redis URL: ${redisUrl ? '✅ Found' : '❌ Missing'}`);

    if (!supabaseUrl || !redisUrl) {
      throw new Error('Missing required environment variables');
    }

    // Test 2: Test Redis connection
    console.log('2. Testing Redis connection...');
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

    // Test 3: Test BullMQ Queue creation
    console.log('3. Testing BullMQ queue creation...');
    const { Queue } = await import('bullmq');
    
    const testQueue = new Queue('test-queue', {
      connection: {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: process.env.UPSTASH_REDIS_REST_TOKEN,
        username: 'default',
        tls: {},
        lazyConnect: true,
        maxRetriesPerRequest: 2,
      },
    });

    console.log('   ✅ BullMQ queue created successfully');

    // Test 4: Add a test job
    console.log('4. Testing job creation...');
    const job = await testQueue.add('test-job', { message: 'Hello World' });
    console.log(`   ✅ Test job created with ID: ${job.id}`);

    // Test 5: Get queue stats
    console.log('5. Getting queue statistics...');
    const [waiting, active, completed, failed] = await Promise.all([
      testQueue.getWaiting(),
      testQueue.getActive(),
      testQueue.getCompleted(),
      testQueue.getFailed(),
    ]);

    console.log(`   Waiting: ${waiting.length}`);
    console.log(`   Active: ${active.length}`);
    console.log(`   Completed: ${completed.length}`);
    console.log(`   Failed: ${failed.length}`);
    console.log('   ✅ Queue statistics retrieved');

    // Cleanup
    await testQueue.close();
    await redis.quit();

    console.log('\n🎉 Simple queue test completed successfully!');
    console.log('💡 Now you can try: npm run test-queue');

  } catch (error) {
    console.error('❌ Simple queue test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n💡 Redis connection refused - check your Redis configuration');
      } else if (error.message.includes('ENOTFOUND')) {
        console.error('\n💡 Redis host not found - check your UPSTASH_REDIS_REST_URL');
      } else if (error.message.includes('WRONGPASS')) {
        console.error('\n💡 Redis authentication failed - check your UPSTASH_REDIS_REST_TOKEN');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
testQueueSimple().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
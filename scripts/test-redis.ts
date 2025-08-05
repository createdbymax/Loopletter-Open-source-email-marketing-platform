#!/usr/bin/env tsx

/**
 * Simple Redis connection test
 * Run with: npx tsx scripts/test-redis.ts
 */

import dotenv from 'dotenv';
import Redis from 'ioredis';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testRedis() {
  console.log('🧪 Testing Redis connection...\n');

  // Check Redis configuration
  const hasUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  const hasRedisUrl = process.env.REDIS_URL;
  const hasRedisHost = process.env.REDIS_HOST;

  if (!hasUpstash && !hasRedisUrl && !hasRedisHost) {
    console.error('❌ No Redis configuration found');
    console.error('   Add one of these to your .env.local:');
    console.error('   - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN');
    console.error('   - REDIS_URL');
    console.error('   - REDIS_HOST + REDIS_PORT');
    process.exit(1);
  }

  try {
    let redis: Redis;

    if (hasUpstash) {
      console.log('📡 Using Upstash Redis configuration...');
      const url = new URL(process.env.UPSTASH_REDIS_REST_URL!);
      redis = new Redis({
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
    } else if (hasRedisUrl) {
      console.log('📡 Using Redis URL configuration...');
      redis = new Redis(process.env.REDIS_URL!);
    } else {
      console.log('📡 Using Redis host configuration...');
      redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      });
    }

    // Test connection
    console.log('🔌 Connecting to Redis...');
    await redis.ping();
    console.log('✅ Redis connection successful!\n');

    // Test basic operations
    console.log('📝 Testing Redis operations...');
    
    // Set a test key
    await redis.set('test:queue', 'hello-world', 'EX', 60);
    console.log('   ✅ Set test key');
    
    // Get the test key
    const value = await redis.get('test:queue');
    console.log(`   ✅ Retrieved test key: ${value}`);
    
    // Delete the test key
    await redis.del('test:queue');
    console.log('   ✅ Deleted test key');

    // Test queue-like operations
    console.log('\n🔄 Testing queue operations...');
    
    // Push to a test queue
    await redis.lpush('test:email-queue', 'job1', 'job2', 'job3');
    console.log('   ✅ Added jobs to test queue');
    
    // Check queue length
    const queueLength = await redis.llen('test:email-queue');
    console.log(`   ✅ Queue length: ${queueLength}`);
    
    // Pop from queue
    const job = await redis.rpop('test:email-queue');
    console.log(`   ✅ Popped job: ${job}`);
    
    // Clean up test queue
    await redis.del('test:email-queue');
    console.log('   ✅ Cleaned up test queue');

    await redis.quit();
    console.log('\n🎉 Redis test completed successfully!');

  } catch (error) {
    console.error('❌ Redis test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n💡 Connection refused - check if Redis is running and accessible');
      } else if (error.message.includes('ENOTFOUND')) {
        console.error('\n💡 Host not found - check your Redis host configuration');
      } else if (error.message.includes('WRONGPASS')) {
        console.error('\n💡 Authentication failed - check your Redis password/token');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
testRedis().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
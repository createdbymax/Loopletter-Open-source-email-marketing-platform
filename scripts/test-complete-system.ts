#!/usr/bin/env tsx

/**
 * Complete system test for queue-based email sending
 * Run with: npx tsx scripts/test-complete-system.ts
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testCompleteSystem() {
    console.log('🧪 Testing complete email queue system...\n');

    try {
        // Test 1: Environment variables
        console.log('1. Checking environment variables...');
        const required = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'UPSTASH_REDIS_REST_URL',
            'UPSTASH_REDIS_REST_TOKEN',
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY',
            'SES_MAX_SEND_RATE',
            'SES_MAX_DAILY_QUOTA'
        ];

        const missing = required.filter(key => !process.env[key]);
        if (missing.length > 0) {
            console.error('   ❌ Missing environment variables:', missing);
            throw new Error('Missing required environment variables');
        }
        console.log('   ✅ All environment variables present');

        // Test 2: Redis connection
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

        // Test 3: Supabase connection
        console.log('3. Testing Supabase connection...');
        const { supabaseAdmin } = await import('../lib/supabase-server');
        const { data, error } = await supabaseAdmin.from('campaigns').select('count').limit(1);
        if (error && !error.message.includes('relation "campaigns" does not exist')) {
            throw error;
        }
        console.log('   ✅ Supabase connection successful');

        // Test 4: SES quota tracker
        console.log('4. Testing SES quota tracker...');
        try {
            const { sesQuotaTracker } = await import('../lib/ses-quota-tracker');
            const todayCount = await sesQuotaTracker.loadTodayCount();
            console.log(`   ✅ SES quota tracker working (today: ${todayCount} emails)`);
        } catch (quotaError) {
            console.log('   ⚠️  SES quota tracker needs database table (run database-schema-ses-quota.sql)');
        }

        // Test 5: SES rate limiter
        console.log('5. Testing SES rate limiter...');
        const { sesRateLimiter } = await import('../lib/ses-config');
        const rateLimitCheck = await sesRateLimiter.canSendEmail();
        const stats = await sesRateLimiter.getStats();
        console.log(`   ✅ Rate limiter working (can send: ${rateLimitCheck.canSend})`);
        console.log(`   📊 Today's usage: ${stats.sentToday}/${process.env.SES_MAX_DAILY_QUOTA}`);

        // Test 6: Email queue system
        console.log('6. Testing email queue system...');
        const { getEmailQueue, getQueueStats } = await import('../lib/email-queue');
        const queue = getEmailQueue();
        const queueStats = await getQueueStats();
        console.log('   ✅ Email queue system working');
        console.log(`   📊 Queue stats: ${queueStats.waiting} waiting, ${queueStats.active} active`);

        // Test 7: AWS SES connection
        console.log('7. Testing AWS SES connection...');
        const { SESClient, GetSendQuotaCommand } = await import('@aws-sdk/client-ses');
        const ses = new SESClient({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });

        const quotaCommand = new GetSendQuotaCommand({});
        const quotaResult = await ses.send(quotaCommand);
        console.log('   ✅ AWS SES connection successful');
        console.log(`   📊 SES quota: ${quotaResult.SentLast24Hours}/${quotaResult.Max24HourSend} (${quotaResult.MaxSendRate}/sec)`);

        // Cleanup
        await redis.quit();

        console.log('\n🎉 Complete system test passed!');
        console.log('\n📋 System Status:');
        console.log('   ✅ Redis queue system ready');
        console.log('   ✅ Database connections working');
        console.log('   ✅ AWS SES configured');
        console.log('   ✅ Rate limiting active');
        console.log('   ✅ Queue processing ready');

        console.log('\n🚀 Next steps:');
        console.log('   1. Run database migrations if quota tracker failed');
        console.log('   2. Test campaign sending via UI');
        console.log('   3. Monitor queue dashboard at /dashboard/queue');
        console.log('   4. Deploy to production');

    } catch (error) {
        console.error('❌ System test failed:', error);

        if (error instanceof Error) {
            if (error.message.includes('relation "ses_quota_tracking" does not exist')) {
                console.error('\n💡 Run the database migration: database-schema-ses-quota.sql');
            } else if (error.message.includes('column "job_id" of relation "campaigns" does not exist')) {
                console.error('\n💡 Run the database migration: database-schema-campaign-job-id.sql');
            } else if (error.message.includes('ECONNREFUSED')) {
                console.error('\n💡 Redis connection failed - check your Upstash configuration');
            } else if (error.message.includes('InvalidAccessKeyId')) {
                console.error('\n💡 AWS credentials invalid - check your AWS_ACCESS_KEY_ID');
            }
        }

        process.exit(1);
    }
}

// Run the test
testCompleteSystem().catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
});
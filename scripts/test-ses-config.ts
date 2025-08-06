#!/usr/bin/env tsx

/**
 * Test script to verify AWS SES configuration and limits
 * Run with: npx tsx scripts/test-ses-config.ts
 */

import dotenv from 'dotenv';
import { SESClient, GetSendQuotaCommand, GetSendStatisticsCommand, GetAccountSendingEnabledCommand } from '@aws-sdk/client-ses';
import { SES_CONFIG, sesRateLimiter, estimateCampaignDuration } from '../lib/ses-config';

// Load environment variables
dotenv.config({ path: '.env.local' });

const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function testSESConfiguration() {
  console.log('🔍 Testing AWS SES Configuration...\n');

  // Check environment variables first
  console.log('0. Checking environment variables...');
  console.log(`   AWS_REGION: ${process.env.AWS_REGION ? '✅ Set' : '❌ Missing'}`);
  console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}\n`);

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('❌ Missing AWS credentials. Please check your .env.local file.');
    return;
  }

  try {
    // Test 1: Check if SES is enabled
    console.log('1. Checking SES account status...');
    const sendingEnabled = await ses.send(new GetAccountSendingEnabledCommand({}));
    console.log(`   ✅ SES Sending Enabled: ${sendingEnabled.Enabled}\n`);

    // Test 2: Get quota information
    console.log('2. Checking SES quotas...');
    const quota = await ses.send(new GetSendQuotaCommand({}));
    console.log(`   📊 AWS SES Limits:`);
    console.log(`      Max Send Rate: ${quota.MaxSendRate} emails/second`);
    console.log(`      Max 24h Send: ${quota.Max24HourSend} emails/day`);
    console.log(`      Sent Last 24h: ${quota.SentLast24Hours} emails`);
    console.log(`      Remaining Today: ${(quota.Max24HourSend || 0) - (quota.SentLast24Hours || 0)} emails\n`);

    // Test 3: Check configured limits
    console.log('3. Checking configured limits...');
    console.log(`   ⚙️  Configured Limits:`);
    console.log(`      Max Send Rate: ${SES_CONFIG.limits.maxSendRate} emails/second`);
    console.log(`      Max Daily Quota: ${SES_CONFIG.limits.maxDailyQuota} emails/day`);
    console.log(`      Batch Size: ${SES_CONFIG.batch.size} emails`);
    console.log(`      Batch Interval: ${SES_CONFIG.batch.intervalMs}ms\n`);

    // Test 4: Validate configuration
    console.log('4. Validating configuration...');
    const rateOk = SES_CONFIG.limits.maxSendRate <= (quota.MaxSendRate || 0);
    const quotaOk = SES_CONFIG.limits.maxDailyQuota <= (quota.Max24HourSend || 0);
    
    console.log(`   ${rateOk ? '✅' : '❌'} Rate limit: ${SES_CONFIG.limits.maxSendRate} <= ${quota.MaxSendRate} (AWS limit)`);
    console.log(`   ${quotaOk ? '✅' : '❌'} Daily quota: ${SES_CONFIG.limits.maxDailyQuota} <= ${quota.Max24HourSend} (AWS limit)\n`);

    // Test 5: Rate limiter functionality
    console.log('5. Testing rate limiter...');
    const rateLimitCheck = await sesRateLimiter.canSendEmail();
    const stats = await sesRateLimiter.getStats();
    console.log(`   ✅ Rate limiter functional: ${rateLimitCheck.canSend}`);
    console.log(`   📈 Current stats:`);
    console.log(`      Sent this second: ${stats.sentInCurrentSecond}/${SES_CONFIG.limits.maxSendRate}`);
    console.log(`      Sent today: ${stats.sentToday}/${SES_CONFIG.limits.maxDailyQuota}\n`);

    // Test 6: Campaign estimation
    console.log('6. Testing campaign estimation...');
    const testCampaignSizes = [100, 1000, 5000, 10000];
    
    for (const size of testCampaignSizes) {
      const estimate = await estimateCampaignDuration(size);
      console.log(`   📧 ${size} emails: ${estimate.estimatedMinutes} minutes (${estimate.canSendToday ? 'can send today' : 'exceeds daily quota'})`);
    }

    console.log('\n🎉 SES Configuration Test Complete!');
    
    if (rateOk && quotaOk) {
      console.log('✅ Your configuration is properly set up for your AWS SES limits.');
    } else {
      console.log('⚠️  Warning: Your configured limits exceed your AWS SES limits.');
      console.log('   Please update your environment variables or request a limit increase from AWS.');
    }

  } catch (error) {
    console.error('❌ Error testing SES configuration:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('InvalidClientTokenId')) {
        console.log('💡 Check your AWS_ACCESS_KEY_ID');
      } else if (error.message.includes('SignatureDoesNotMatch')) {
        console.log('💡 Check your AWS_SECRET_ACCESS_KEY');
      } else if (error.message.includes('UnauthorizedOperation')) {
        console.log('💡 Check your AWS IAM permissions for SES');
      }
    }
  }
}

// Run the test
testSESConfiguration().catch(console.error);
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SESClient, GetSendQuotaCommand, GetSendStatisticsCommand } from '@aws-sdk/client-ses';
import { sesRateLimiter, SES_CONFIG } from '@/lib/ses-config';

const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get AWS SES quota information
    const [quotaResult, statsResult] = await Promise.all([
      ses.send(new GetSendQuotaCommand({})),
      ses.send(new GetSendStatisticsCommand({})),
    ]);

    // Get local rate limiter stats
    const localStats = await sesRateLimiter.getStats();

    // Calculate recent sending statistics
    const last24Hours = statsResult.SendDataPoints
      ?.filter(point => {
        const pointTime = new Date(point.Timestamp!).getTime();
        const now = Date.now();
        return (now - pointTime) <= 24 * 60 * 60 * 1000; // Last 24 hours
      })
      .reduce((total, point) => total + (point.DeliveryAttempts || 0), 0) || 0;

    return NextResponse.json({
      aws: {
        maxSendRate: quotaResult.MaxSendRate,
        max24HourSend: quotaResult.Max24HourSend,
        sentLast24Hours: quotaResult.SentLast24Hours,
        remainingToday: (quotaResult.Max24HourSend || 0) - (quotaResult.SentLast24Hours || 0),
      },
      configured: {
        maxSendRate: SES_CONFIG.limits.maxSendRate,
        maxDailyQuota: SES_CONFIG.limits.maxDailyQuota,
        batchSize: SES_CONFIG.batch.size,
        batchInterval: SES_CONFIG.batch.intervalMs,
      },
      local: {
        sentInCurrentSecond: localStats.sentInCurrentSecond,
        sentToday: localStats.sentToday,
        remainingToday: localStats.remainingToday,
        remainingThisSecond: localStats.remainingThisSecond,
      },
      status: {
        withinLimits: (quotaResult.SentLast24Hours || 0) < (quotaResult.Max24HourSend || 0),
        configuredCorrectly: 
          SES_CONFIG.limits.maxSendRate <= (quotaResult.MaxSendRate || 0) &&
          SES_CONFIG.limits.maxDailyQuota <= (quotaResult.Max24HourSend || 0),
      },
    });

  } catch (error) {
    console.error('Error fetching SES quota:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch SES quota',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
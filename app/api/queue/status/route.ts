import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getQueueStats, getJobStatus } from '@/lib/email-queue';

export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (jobId) {
      // Get specific job status
      const jobStatus = await getJobStatus(jobId);
      if (!jobStatus) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      return NextResponse.json(jobStatus);
    } else {
      // Get overall queue statistics
      const stats = await getQueueStats();
      return NextResponse.json(stats);
    }

  } catch (error) {
    console.error('Error getting queue status:', error);
    return NextResponse.json({ 
      error: 'Failed to get queue status' 
    }, { status: 500 });
  }
}
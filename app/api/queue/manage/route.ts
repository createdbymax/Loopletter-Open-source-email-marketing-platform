import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getEmailQueue, cleanupQueue } from '@/lib/email-queue';

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, jobId } = await req.json();

    const queue = getEmailQueue();

    switch (action) {
      case 'pause':
        await queue.pause();
        return NextResponse.json({ success: true, message: 'Queue paused' });

      case 'resume':
        await queue.resume();
        return NextResponse.json({ success: true, message: 'Queue resumed' });

      case 'cleanup':
        await cleanupQueue();
        return NextResponse.json({ success: true, message: 'Queue cleaned up' });

      case 'retry':
        if (!jobId) {
          return NextResponse.json({ error: 'jobId required for retry' }, { status: 400 });
        }
        const job = await queue.getJob(jobId);
        if (!job) {
          return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
        await job.retry();
        return NextResponse.json({ success: true, message: 'Job queued for retry' });

      case 'remove':
        if (!jobId) {
          return NextResponse.json({ error: 'jobId required for remove' }, { status: 400 });
        }
        const jobToRemove = await queue.getJob(jobId);
        if (!jobToRemove) {
          return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
        await jobToRemove.remove();
        return NextResponse.json({ success: true, message: 'Job removed' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error managing queue:', error);
    return NextResponse.json({ 
      error: 'Failed to manage queue' 
    }, { status: 500 });
  }
}
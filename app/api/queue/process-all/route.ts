import { NextRequest, NextResponse } from 'next/server';
import { getEmailQueue } from '@/lib/email-queue';

// This endpoint processes all waiting jobs in the queue
// Called by Vercel cron every minute
export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (optional security)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const queue = getEmailQueue();
    
    // Get waiting jobs
    const waitingJobs = await queue.getWaiting();
    
    if (waitingJobs.length === 0) {
      return NextResponse.json({ 
        message: 'No jobs to process',
        processed: 0 
      });
    }

    // Process up to 10 jobs per cron run to avoid timeouts
    const jobsToProcess = waitingJobs.slice(0, 10);
    const results = [];

    for (const job of jobsToProcess) {
      try {
        // Process the job by calling our existing endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/queue/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobId: job.id }),
        });

        if (response.ok) {
          const result = await response.json();
          results.push({ jobId: job.id, success: true, result });
        } else {
          results.push({ jobId: job.id, success: false, error: 'Failed to process' });
        }
      } catch (error) {
        results.push({ 
          jobId: job.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Processed ${jobsToProcess.length} jobs`,
      processed: jobsToProcess.length,
      successful: successCount,
      failed: failureCount,
      results: results.slice(0, 5), // Return first 5 results for debugging
    });

  } catch (error) {
    console.error('Error processing queue:', error);
    return NextResponse.json(
      { error: 'Failed to process queue' },
      { status: 500 }
    );
  }
}
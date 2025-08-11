import { NextRequest, NextResponse } from 'next/server';
import { getEmailQueue, processJobById } from '@/lib/email-queue';

// This endpoint processes waiting jobs in the queue
// Called by Vercel cron every minute
export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (optional security)
    // In development mode, skip auth check for easier testing
    if (process.env.NODE_ENV !== 'development') {
      const authHeader = request.headers.get('authorization');
      if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const queue = getEmailQueue();

    const results = [];
    let successCount = 0;
    let failureCount = 0;
    let processed = 0;
    let iteration = 0;
    const MAX_ITERATIONS = 10;

    while (iteration < MAX_ITERATIONS) {
      const waitingJobs = await queue.getWaiting(0, 5);
      const delayedJobs = await queue.getDelayed(0, 5);
      const allJobsToProcess = [...waitingJobs, ...delayedJobs];

      if (allJobsToProcess.length === 0) {
        if (processed === 0) {
          return NextResponse.json({
            message: 'No jobs to process',
            processed: 0,
            debug: process.env.NODE_ENV === 'development' ? {
              waiting: waitingJobs.length,
              delayed: delayedJobs.length,
              active: (await queue.getActive()).length,
              completed: (await queue.getCompleted()).length,
              failed: (await queue.getFailed()).length
            } : undefined
          });
        }
        break;
      }

      if (process.env.NODE_ENV === 'development') {
        const [activeJobs, completedJobs, failedJobs] = await Promise.all([
          queue.getActive(0, 5),
          queue.getCompleted(0, 5),
          queue.getFailed(0, 5)
        ]);

        console.log('Queue Debug Info:');
        console.log(`- Waiting jobs: ${waitingJobs.length}`);
        console.log(`- Active jobs: ${activeJobs.length}`);
        console.log(`- Completed jobs: ${completedJobs.length}`);
        console.log(`- Failed jobs: ${failedJobs.length}`);
        console.log(`- Delayed jobs: ${delayedJobs.length}`);

        if (waitingJobs.length > 0) {
          console.log('Waiting jobs:', waitingJobs.map(j => ({ id: j.id, name: j.name, data: j.data })));
        }
        if (activeJobs.length > 0) {
          console.log('Active jobs:', activeJobs.map(j => ({ id: j.id, name: j.name, data: j.data })));
        }
        if (delayedJobs.length > 0) {
          console.log('Delayed jobs:', delayedJobs.map(j => ({ id: j.id, name: j.name, data: j.data, delay: j.delay })));
        }
      }

      console.log(`Processing ${allJobsToProcess.length} jobs from queue (${waitingJobs.length} waiting, ${delayedJobs.length} delayed)`);

      for (const job of allJobsToProcess) {
        try {
          console.log(`Processing job ${job.id}: ${job.name}`);

          const result = await processJobById(job.id!);

          if (result.processed) {
            successCount++;
            results.push({
              jobId: job.id,
              success: true,
              result: result.result
            });
            console.log(`✅ Job ${job.id} completed successfully`);
          } else {
            failureCount++;
            results.push({
              jobId: job.id,
              success: false,
              error: 'Job could not be processed'
            });
            console.log(`❌ Job ${job.id} could not be processed`);
          }

          processed++;
        } catch (error) {
          failureCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({
            jobId: job.id,
            success: false,
            error: errorMessage
          });
          console.error(`❌ Job ${job.id} failed:`, errorMessage);
        }
      }

      iteration++;
    }

    return NextResponse.json({
      message: `Processed ${processed} jobs`,
      processed,
      successful: successCount,
      failed: failureCount,
      timestamp: new Date().toISOString(),
      // Include first few results for debugging (don't include all to avoid large responses)
      results: results.slice(0, 3),
    });

  } catch (error) {
    console.error('Error processing queue:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process queue',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getEmailQueue, processJobById } from '@/lib/email-queue';

// This endpoint processes waiting jobs in the queue
// Called by Vercel cron every minute
export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (optional security)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const queue = getEmailQueue();
    
    // Get waiting jobs (limit to avoid timeouts)
    const waitingJobs = await queue.getWaiting(0, 5); // Process max 5 jobs per cron run
    
    if (waitingJobs.length === 0) {
      return NextResponse.json({ 
        message: 'No jobs to process',
        processed: 0 
      });
    }

    console.log(`Processing ${waitingJobs.length} jobs from queue`);
    
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Process jobs sequentially to respect rate limits
    for (const job of waitingJobs) {
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

    return NextResponse.json({
      message: `Processed ${waitingJobs.length} jobs`,
      processed: waitingJobs.length,
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
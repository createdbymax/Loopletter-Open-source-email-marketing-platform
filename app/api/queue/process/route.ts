import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { processJobById, getEmailQueue } from '@/lib/email-queue';

export async function POST(req: NextRequest) {
  try {
    // Check for cron authentication token
    const authHeader = req.headers.get('authorization');
    const cronToken = process.env.QUEUE_PROCESS_TOKEN;
    
    // Allow either Clerk auth or cron token
    let isAuthenticated = false;
    
    if (authHeader === `Bearer ${cronToken}` && cronToken) {
      isAuthenticated = true;
    } else {
      const { userId } = await auth();
      isAuthenticated = !!userId;
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { jobId, processNext, batchSize = 14 } = body;

    if (jobId) {
      // Process specific job
      const result = await processJobById(jobId);
      return NextResponse.json(result);
    } else {
      // Process multiple jobs up to batch size (respecting rate limits)
      const queue = getEmailQueue();
      const waitingJobs = await queue.getWaiting();
      
      if (waitingJobs.length === 0) {
        return NextResponse.json({ processed: 0, message: 'No jobs waiting' });
      }

      // Process up to batchSize jobs (respecting SES rate limits)
      const jobsToProcess = waitingJobs.slice(0, Math.min(batchSize, 14));
      const results = [];
      
      for (const job of jobsToProcess) {
        try {
          const result = await processJobById(job.id!);
          results.push({ jobId: job.id, ...result });
          
          // Small delay between jobs to respect rate limits
          if (jobsToProcess.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 75)); // ~13.3 emails/second
          }
        } catch (error) {
          console.error(`Failed to process job ${job.id}:`, error);
          results.push({ 
            jobId: job.id, 
            processed: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      return NextResponse.json({ 
        processed: results.filter(r => r.processed).length,
        failed: results.filter(r => !r.processed).length,
        total: results.length,
        results 
      });
    }

  } catch (error) {
    console.error('Error processing jobs:', error);
    return NextResponse.json({ 
      error: 'Failed to process jobs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
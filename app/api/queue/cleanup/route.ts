import { NextResponse } from 'next/server';
import { getEmailQueue } from '@/lib/email-queue';

export async function POST() {
  try {
    const queue = getEmailQueue();
    
    // Get all delayed jobs
    const delayedJobs = await queue.getDelayed(0, 50);
    
    let removedCount = 0;
    const results = [];
    
    for (const job of delayedJobs) {
      try {
        // Remove the job
        await job.remove();
        removedCount++;
        results.push({
          jobId: job.id,
          name: job.name,
          data: job.data,
          removed: true
        });
        console.log(`Removed job ${job.id}: ${job.name}`);
      } catch (error) {
        console.error(`Failed to remove job ${job.id}:`, error);
        results.push({
          jobId: job.id,
          name: job.name,
          data: job.data,
          removed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Removed ${removedCount} jobs`,
      removedCount,
      totalJobs: delayedJobs.length,
      results
    });

  } catch (error) {
    console.error('Cleanup failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
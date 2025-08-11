import { NextRequest, NextResponse } from 'next/server';
import { getEmailQueue } from '@/lib/email-queue';

export async function GET() {
    try {
        const queue = getEmailQueue();

        // Test basic queue operations
        const testJob = await queue.add('test-job', { message: 'Hello Redis!' });

        // Get queue stats
        const [waiting, active, completed, failed] = await Promise.all([
            queue.getWaiting(),
            queue.getActive(),
            queue.getCompleted(),
            queue.getFailed()
        ]);

        // Try to get the test job we just created
        const retrievedJob = await queue.getJob(testJob.id!);

        // Clean up the test job
        if (retrievedJob) {
            await retrievedJob.remove();
        }

        return NextResponse.json({
            success: true,
            message: 'Redis connection working',
            queueName: queue.name,
            testJobId: testJob.id,
            testJobRetrieved: !!retrievedJob,
            queueStats: {
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length
            },
            allJobs: {
                waiting: waiting.map(j => ({ id: j.id, name: j.name, data: j.data })),
                active: active.map(j => ({ id: j.id, name: j.name, data: j.data })),
                completed: completed.slice(0, 3).map(j => ({ id: j.id, name: j.name, data: j.data })),
                failed: failed.slice(0, 3).map(j => ({ id: j.id, name: j.name, data: j.data }))
            }
        });

    } catch (error) {
        console.error('Redis test failed:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            details: 'Redis connection or queue operation failed'
        }, { status: 500 });
    }
}
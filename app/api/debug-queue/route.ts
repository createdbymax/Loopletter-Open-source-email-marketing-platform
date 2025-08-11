import { NextResponse } from 'next/server';
import { getEmailQueue } from '@/lib/email-queue';

export async function GET() {
    try {
        const queue = getEmailQueue();

        // Get all job states
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            queue.getWaiting(0, 10),
            queue.getActive(0, 10),
            queue.getCompleted(0, 10),
            queue.getFailed(0, 10),
            queue.getDelayed(0, 10)
        ]);

        // Get specific job by ID if it exists
        let specificJob = null;
        try {
            specificJob = await queue.getJob('11');
        } catch (error) {
            console.log('Job 11 not found:', error);
        }

        const result = {
            queueName: queue.name,
            counts: {
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length,
                delayed: delayed.length
            },
            jobs: {
                waiting: waiting.map(j => ({
                    id: j.id,
                    name: j.name,
                    data: j.data,
                    opts: j.opts,
                    processedOn: j.processedOn,
                    finishedOn: j.finishedOn
                })),
                active: active.map(j => ({
                    id: j.id,
                    name: j.name,
                    data: j.data,
                    opts: j.opts,
                    processedOn: j.processedOn,
                    finishedOn: j.finishedOn
                })),
                completed: completed.map(j => ({
                    id: j.id,
                    name: j.name,
                    data: j.data,
                    opts: j.opts,
                    processedOn: j.processedOn,
                    finishedOn: j.finishedOn
                })),
                failed: failed.map(j => ({
                    id: j.id,
                    name: j.name,
                    data: j.data,
                    opts: j.opts,
                    processedOn: j.processedOn,
                    finishedOn: j.finishedOn,
                    failedReason: j.failedReason
                })),
                delayed: delayed.map(j => ({
                    id: j.id,
                    name: j.name,
                    data: j.data,
                    opts: j.opts,
                    processedOn: j.processedOn,
                    finishedOn: j.finishedOn
                }))
            },
            specificJob: specificJob ? {
                id: specificJob.id,
                name: specificJob.name,
                data: specificJob.data,
                opts: specificJob.opts,
                processedOn: specificJob.processedOn,
                finishedOn: specificJob.finishedOn,
                failedReason: specificJob.failedReason,
                progress: specificJob.progress,
                returnvalue: specificJob.returnvalue
            } : null
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Debug queue error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
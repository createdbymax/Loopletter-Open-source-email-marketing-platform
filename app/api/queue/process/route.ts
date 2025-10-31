import { NextRequest, NextResponse } from 'next/server';
import { processJobById, getQueueStats } from '@/lib/email-queue';
export async function POST(request: NextRequest) {
    try {
        const { jobId } = await request.json();
        if (!jobId) {
            return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
        }
        const result = await processJobById(jobId);
        if (!result.processed) {
            return NextResponse.json({ error: 'Job not found or could not be processed' }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            jobId,
            result: result.result,
        });
    }
    catch (error) {
        console.error('Error processing job:', error);
        return NextResponse.json({ error: 'Failed to process job' }, { status: 500 });
    }
}
export async function GET() {
    try {
        const stats = await getQueueStats();
        return NextResponse.json({
            success: true,
            stats,
        });
    }
    catch (error) {
        console.error('Error getting queue stats:', error);
        return NextResponse.json({ error: 'Failed to get queue stats' }, { status: 500 });
    }
}

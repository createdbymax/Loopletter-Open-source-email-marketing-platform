import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
export async function GET(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({
            message: 'Subscription test endpoint',
            userId,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error in subscription test:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

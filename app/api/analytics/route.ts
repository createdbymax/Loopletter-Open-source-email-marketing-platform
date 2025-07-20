import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import {
    getArtistAnalytics,
    getOrCreateArtistByClerkId
} from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') as 'day' | 'week' | 'month' | 'year' || 'month';

        const artist = await getOrCreateArtistByClerkId(userId, '', '');
        const analytics = await getArtistAnalytics(artist.id, period);

        return NextResponse.json(analytics);
    } catch (error) {
        console.error('Failed to fetch analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
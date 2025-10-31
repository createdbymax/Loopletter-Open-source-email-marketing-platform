import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { markAllNotificationsAsRead } from '@/lib/notifications';
export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || 'Artist');
        await markAllNotificationsAsRead(artist.id);
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json({ error: 'Failed to mark all notifications as read' }, { status: 500 });
    }
}

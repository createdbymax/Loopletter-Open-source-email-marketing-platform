import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || 'Artist');
        const body = await request.json();
        const { type = 'system_alert', title, message, data } = body;
        const notificationId = await createNotification(artist.id, type, title || 'Test Notification', message || 'This is a test notification to verify the notification system is working correctly.', data || { test: true, timestamp: new Date().toISOString() }, 7);
        return NextResponse.json({
            success: true,
            notification_id: notificationId,
            message: 'Test notification created successfully'
        });
    }
    catch (error) {
        console.error('Error creating test notification:', error);
        return NextResponse.json({ error: 'Failed to create test notification' }, { status: 500 });
    }
}

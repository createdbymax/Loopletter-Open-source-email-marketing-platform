import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const artist = await getOrCreateArtistByClerkId(
      user.id,
      user.primaryEmailAddress?.emailAddress || '',
      user.fullName || 'Artist'
    );

    const { notification_ids } = await request.json();

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 });
    }

    // Mark multiple notifications as read
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', notification_ids)
      .eq('artist_id', artist.id)
      .eq('read', false); // Only update unread notifications

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error marking notifications as viewed:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as viewed' },
      { status: 500 }
    );
  }
}
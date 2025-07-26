import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get artist
    const artist = await getOrCreateArtistByClerkId(
      user.id,
      user.primaryEmailAddress?.emailAddress || '',
      user.fullName || 'Artist'
    );

    const body = await request.json();
    const { title, subject, message, status, template_id, settings } = body;

    // Validate required fields
    if (!title || !subject || !message) {
      return NextResponse.json({ 
        error: 'Title, subject, and message are required' 
      }, { status: 400 });
    }

    // Create campaign object
    const campaign = {
      id: `campaign_${Date.now()}`, // Mock ID
      title,
      subject,
      message,
      status: status || 'draft',
      template_id,
      artist_id: artist.id,
      settings: settings || {
        send_time_optimization: false,
        track_opens: true,
        track_clicks: true,
        auto_tweet: false,
        send_to_unsubscribed: false,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      send_date: status === 'sending' ? new Date().toISOString() : null,
      stats: {
        total_sent: 0,
        delivered: 0,
        opens: 0,
        unique_opens: 0,
        clicks: 0,
        unique_clicks: 0,
        bounces: 0,
        complaints: 0,
        unsubscribes: 0,
        open_rate: 0,
        click_rate: 0,
        bounce_rate: 0,
        unsubscribe_rate: 0,
      }
    };

    // For now, just return success
    // In a real implementation, this would save to database using createCampaignWithDefaults
    return NextResponse.json({ 
      success: true,
      campaign,
      message: status === 'sending' ? 'Campaign created and sending' : 'Campaign saved as draft'
    });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get artist
    const artist = await getOrCreateArtistByClerkId(
      user.id,
      user.primaryEmailAddress?.emailAddress || '',
      user.fullName || 'Artist'
    );

    // For now, return empty array
    // In a real implementation, this would fetch from database
    return NextResponse.json({ 
      success: true,
      campaigns: [],
      total: 0
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
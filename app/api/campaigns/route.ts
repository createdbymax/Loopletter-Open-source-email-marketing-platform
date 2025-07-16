import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createCampaign, getCampaignsByArtist, getOrCreateArtistByClerkId } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get artist by clerk user ID
    const artist = await getOrCreateArtistByClerkId(userId, '', '');
    const campaigns = await getCampaignsByArtist(artist.id);

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, templateId, templateData, status = 'draft' } = body;

    // Get artist by clerk user ID
    const artist = await getOrCreateArtistByClerkId(userId, '', '');

    const campaign = await createCampaign({
      title,
      message: message || '',
      artist_id: artist.id,
      status,
      send_date: new Date().toISOString(),
      template_id: templateId || null,
      template_data: templateData || null,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
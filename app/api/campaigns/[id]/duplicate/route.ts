import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { duplicateCampaign, getOrCreateArtistByClerkId } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get artist by clerk user ID
    const artist = await getOrCreateArtistByClerkId(userId, '', '');
    const duplicatedCampaign = await duplicateCampaign(params.id, artist.id);

    return NextResponse.json(duplicatedCampaign);
  } catch (error) {
    console.error('Failed to duplicate campaign:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate campaign' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { duplicateCampaign, getOrCreateArtistByClerkId } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params in Next.js 13+ App Router
    const { id } = await params;

    // Get artist by clerk user ID
    const artist = await getOrCreateArtistByClerkId(userId, '', '');
    const duplicatedCampaign = await duplicateCampaign(id, artist.id);

    return NextResponse.json(duplicatedCampaign);
  } catch (error) {
    console.error('Failed to duplicate campaign:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate campaign' },
      { status: 500 }
    );
  }
}
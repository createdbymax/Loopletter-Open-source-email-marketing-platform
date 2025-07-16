import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getSegmentsByArtist, 
  createSegment, 
  getOrCreateArtistByClerkId 
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const artist = await getOrCreateArtistByClerkId(userId, '', '');
    const segments = await getSegmentsByArtist(artist.id);

    return NextResponse.json(segments);
  } catch (error) {
    console.error('Failed to fetch segments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segments' },
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
    const { name, description, conditions } = body;

    const artist = await getOrCreateArtistByClerkId(userId, '', '');

    const segment = await createSegment({
      name,
      description,
      conditions,
      artist_id: artist.id,
    });

    return NextResponse.json(segment);
  } catch (error) {
    console.error('Failed to create segment:', error);
    return NextResponse.json(
      { error: 'Failed to create segment' },
      { status: 500 }
    );
  }
}
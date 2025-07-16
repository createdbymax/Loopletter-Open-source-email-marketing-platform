import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getAutomationsByArtist, 
  createAutomation, 
  getOrCreateArtistByClerkId 
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const artist = await getOrCreateArtistByClerkId(userId, '', '');
    const automations = await getAutomationsByArtist(artist.id);

    return NextResponse.json(automations);
  } catch (error) {
    console.error('Failed to fetch automations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automations' },
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
    const { name, description, trigger, actions, status } = body;

    const artist = await getOrCreateArtistByClerkId(userId, '', '');

    const automation = await createAutomation({
      name,
      description,
      trigger,
      actions,
      status: status || 'draft',
      artist_id: artist.id,
    });

    return NextResponse.json(automation);
  } catch (error) {
    console.error('Failed to create automation:', error);
    return NextResponse.json(
      { error: 'Failed to create automation' },
      { status: 500 }
    );
  }
}
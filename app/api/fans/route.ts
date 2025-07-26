import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, addFanWithValidation, getFansByArtist } from '@/lib/db';

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
    
    // Handle single fan or array of fans
    const fansData = body.fans || [body];

    if (!Array.isArray(fansData) || fansData.length === 0) {
      return NextResponse.json({ error: 'Fan data is required' }, { status: 400 });
    }

    const addedFans = [];
    const errors = [];

    // Process each fan
    for (const fanData of fansData) {
      if (!fanData.email || typeof fanData.email !== 'string' || !fanData.email.includes('@')) {
        errors.push(`Invalid email: ${fanData.email}`);
        continue;
      }

      try {
        const fan = await addFanWithValidation({
          email: fanData.email.trim(),
          name: fanData.name?.trim() || null,
          tags: fanData.tags || null,
          source: fanData.source || 'manual',
          custom_fields: fanData.custom_fields || {}
        }, artist.id);
        
        addedFans.push(fan);
      } catch (error) {
        errors.push(`Failed to add ${fanData.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({ 
      success: true,
      added: addedFans.length,
      fans: addedFans,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully added ${addedFans.length} fan${addedFans.length !== 1 ? 's' : ''}`
    });

  } catch (error) {
    console.error('Error adding fans:', error);
    return NextResponse.json(
      { error: 'Failed to add fans' },
      { status: 500 }
    );
  }
}

export async function GET() {
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

    // Fetch fans from database
    const fans = await getFansByArtist(artist.id);

    return NextResponse.json({ 
      success: true,
      fans,
      total: fans.length
    });

  } catch (error) {
    console.error('Error fetching fans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fans' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { updateArtistProfile } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, settings } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Update artist profile
    const updatedArtist = await updateArtistProfile(user.id, {
      name: name.trim(),
      bio: bio?.trim() || null,
      settings: settings || {},
    });

    return NextResponse.json({ 
      success: true, 
      artist: updatedArtist 
    });

  } catch (error) {
    console.error('Error updating artist profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
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

    // This would typically fetch the artist profile
    // For now, we'll return a basic response
    return NextResponse.json({ 
      success: true,
      message: 'Profile endpoint ready'
    });

  } catch (error) {
    console.error('Error fetching artist profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
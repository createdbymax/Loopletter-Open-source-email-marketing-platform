import { NextRequest, NextResponse } from 'next/server';
import { getAuth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the current artist
    const { data: artist, error: fetchError } = await supabase
      .from('artists')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (fetchError || !artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Create a safe slug from the user's name
    const userName = user.fullName || user.username || 'Artist';
    const safeSlug = userName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      || 'artist';

    // Make sure it's not a problematic slug
    const finalSlug = ['sign-in', 'signin', 'login', 'api', 'dashboard', ''].includes(safeSlug) 
      ? `${safeSlug}-artist` || 'artist'
      : safeSlug;

    // Update the artist with the new slug
    const { data: updatedArtist, error: updateError } = await supabase
      .from('artists')
      .update({ 
        slug: finalSlug,
        name: userName // Also update the name to match
      })
      .eq('id', artist.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating artist:', updateError);
      return NextResponse.json({ error: 'Failed to update artist' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      artist: updatedArtist,
      message: `Artist slug updated to: ${finalSlug}`
    });

  } catch (error) {
    console.error('Fix artist slug error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
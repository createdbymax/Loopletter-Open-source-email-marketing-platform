import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { getFanById, unsubscribeFan, resubscribeFan, deleteFan, getOrCreateArtistByClerkId } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fanId } = await params;

    // Fetch fan data with artist information
    const { data: fan, error } = await supabase
      .from('fans')
      .select(`
        *,
        artist:artists(name, slug)
      `)
      .eq('id', fanId)
      .single();

    if (error || !fan) {
      return NextResponse.json(
        { error: 'Fan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(fan);
  } catch (error) {
    console.error('Error fetching fan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: fanId } = await params;
    const body = await req.json();
    const { action } = body;

    // Get artist to verify ownership
    const artist = await getOrCreateArtistByClerkId(
      user.id,
      user.primaryEmailAddress?.emailAddress || '',
      user.fullName || 'Artist'
    );

    // Verify fan belongs to this artist
    const fan = await getFanById(fanId);
    if (!fan || fan.artist_id !== artist.id) {
      return NextResponse.json({ error: 'Fan not found' }, { status: 404 });
    }

    let updatedFan;
    
    if (action === 'unsubscribe') {
      updatedFan = await unsubscribeFan(fanId);
    } else if (action === 'resubscribe') {
      updatedFan = await resubscribeFan(fanId);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      fan: updatedFan,
      message: `Fan ${action}d successfully`
    });

  } catch (error) {
    console.error(`Error updating fan:`, error);
    return NextResponse.json(
      { error: 'Failed to update fan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: fanId } = await params;

    // Get artist to verify ownership
    const artist = await getOrCreateArtistByClerkId(
      user.id,
      user.primaryEmailAddress?.emailAddress || '',
      user.fullName || 'Artist'
    );

    // Verify fan belongs to this artist
    const fan = await getFanById(fanId);
    if (!fan || fan.artist_id !== artist.id) {
      return NextResponse.json({ error: 'Fan not found' }, { status: 404 });
    }

    const deletedFan = await deleteFan(fanId);

    return NextResponse.json({
      success: true,
      fan: deletedFan,
      message: 'Fan deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting fan:', error);
    return NextResponse.json(
      { error: 'Failed to delete fan' },
      { status: 500 }
    );
  }
}
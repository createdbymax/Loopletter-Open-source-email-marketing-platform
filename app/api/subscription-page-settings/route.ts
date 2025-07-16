import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { settings } = await request.json();

    // Update the artist's subscription page settings
    const { data: updatedArtist, error } = await supabase
      .from('artists')
      .update({ 
        subscription_page_settings: settings,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription page settings:', error);
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      artist: updatedArtist,
      message: 'Subscription page settings saved successfully'
    });

  } catch (error) {
    console.error('Subscription page settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the artist's subscription page settings
    const { data: artist, error } = await supabase
      .from('artists')
      .select('subscription_page_settings')
      .eq('clerk_user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscription page settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      settings: artist.subscription_page_settings || {}
    });

  } catch (error) {
    console.error('Fetch subscription page settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get artist ID from Clerk user ID
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Get fan tracking preferences
    const { data: fans } = await supabase
      .from('fans')
      .select('tracking_preferences')
      .eq('artist_id', artist.id);

    if (!fans) {
      return NextResponse.json({
        open_tracking_allowed: 0,
        click_tracking_allowed: 0,
        total_fans: 0,
      });
    }

    // Calculate privacy statistics
    const totalFans = fans.length;
    const openTrackingAllowed = fans.filter(fan => 
      fan.tracking_preferences?.allow_open_tracking !== false
    ).length;
    const clickTrackingAllowed = fans.filter(fan => 
      fan.tracking_preferences?.allow_click_tracking !== false
    ).length;

    return NextResponse.json({
      open_tracking_allowed: openTrackingAllowed,
      click_tracking_allowed: clickTrackingAllowed,
      total_fans: totalFans,
      open_tracking_percentage: totalFans > 0 ? Math.round((openTrackingAllowed / totalFans) * 100) : 0,
      click_tracking_percentage: totalFans > 0 ? Math.round((clickTrackingAllowed / totalFans) * 100) : 0,
    });
  } catch (error) {
    console.error('Error fetching privacy stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
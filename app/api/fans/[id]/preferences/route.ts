import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { preferences, tracking_preferences } = await req.json();
    const fanId = params.id;

    // Update fan preferences
    const { error } = await supabase
      .from('fans')
      .update({
        preferences,
        tracking_preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fanId);

    if (error) {
      console.error('Error updating fan preferences:', error);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in preferences update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
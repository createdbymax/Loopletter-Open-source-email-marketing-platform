import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeFan, getFanById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fan_id, campaign_id } = body;

    if (!fan_id) {
      return NextResponse.json({ error: 'Fan ID is required' }, { status: 400 });
    }

    // Get fan details before unsubscribing
    const fan = await getFanById(fan_id);
    if (!fan) {
      return NextResponse.json({ error: 'Fan not found' }, { status: 404 });
    }

    // Unsubscribe the fan
    await unsubscribeFan(fan_id);

    // Log the unsubscribe event
    console.log(`Fan unsubscribed: ${fan.email} from campaign: ${campaign_id || 'direct'}`);

    return NextResponse.json({ 
      success: true, 
      email: fan.email,
      message: 'Successfully unsubscribed' 
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

// Helper function to get fan by ID (add to db.ts)
async function getFanById(id: string) {
  const { supabase } = await import('@/lib/supabase');
  const { data, error } = await supabase.from('fans').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}
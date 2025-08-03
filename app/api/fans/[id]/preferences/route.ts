import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await req.json();
    const { id: fanId } = await params;

    // Validate status
    if (!['subscribed', 'unsubscribed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "subscribed" or "unsubscribed"' },
        { status: 400 }
      );
    }

    // Update fan status
    const { error } = await supabase
      .from('fans')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fanId);

    if (error) {
      console.error('Error updating fan status:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription status' },
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
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { status, notes } = await request.json();

    if (!status || !['approved', 'rejected', 'contacted'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (approved, rejected, contacted)' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('early_access_requests')
      .update({
        status,
        admin_notes: notes,
        reviewed_at: new Date().toISOString(),
        // reviewed_by: userId, // Add when you have user context
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating early access request:', error);
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Early access request update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('early_access_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting early access request:', error);
      return NextResponse.json(
        { error: 'Failed to delete request' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Early access request delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('early_access_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching early access request:', error);
      return NextResponse.json(
        { error: 'Failed to fetch request' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Early access request fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fanId = params.id;

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
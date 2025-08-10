import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrivacyComplianceService } from '@/lib/privacy-compliance';
import { supabase } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artistId');

    if (!artistId) {
      return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
    }

    // TODO: Add authorization check to ensure user can access this artist's data

    const { data, error } = await supabase
      .from('data_subject_requests')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);

  } catch (error) {
    console.error('Error fetching data requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, artistId, request_type, regulation, request_details } = body;

    if (!email || !artistId || !request_type || !regulation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validRequestTypes = ['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'];
    const validRegulations = ['GDPR', 'CCPA'];

    if (!validRequestTypes.includes(request_type)) {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    if (!validRegulations.includes(regulation)) {
      return NextResponse.json({ error: 'Invalid regulation' }, { status: 400 });
    }

    const dataRequest = await PrivacyComplianceService.createDataSubjectRequest(
      email,
      artistId,
      {
        request_type,
        regulation,
        request_details
      }
    );

    return NextResponse.json(dataRequest);

  } catch (error) {
    console.error('Error creating data request:', error);
    return NextResponse.json(
      { error: 'Failed to create data request' },
      { status: 500 }
    );
  }
}
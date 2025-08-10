import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrivacyComplianceService } from '@/lib/privacy-compliance';

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

    const policies = await PrivacyComplianceService.getRetentionPolicies(artistId);

    return NextResponse.json(policies);

  } catch (error) {
    console.error('Error fetching retention policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch retention policies' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { artistId, dataType, retention_period_days, deletion_method, auto_delete_enabled } = body;

    if (!artistId || !dataType || !retention_period_days || !deletion_method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validDataTypes = ['fan_data', 'campaign_data', 'analytics_data'];
    const validDeletionMethods = ['hard_delete', 'anonymize', 'archive'];

    if (!validDataTypes.includes(dataType)) {
      return NextResponse.json({ error: 'Invalid data type' }, { status: 400 });
    }

    if (!validDeletionMethods.includes(deletion_method)) {
      return NextResponse.json({ error: 'Invalid deletion method' }, { status: 400 });
    }

    // TODO: Add authorization check to ensure user can modify this artist's policies

    const updatedPolicy = await PrivacyComplianceService.updateRetentionPolicy(
      artistId,
      dataType,
      {
        retention_period_days,
        deletion_method,
        auto_delete_enabled: auto_delete_enabled !== false // Default to true
      }
    );

    return NextResponse.json(updatedPolicy);

  } catch (error) {
    console.error('Error updating retention policy:', error);
    return NextResponse.json(
      { error: 'Failed to update retention policy' },
      { status: 500 }
    );
  }
}
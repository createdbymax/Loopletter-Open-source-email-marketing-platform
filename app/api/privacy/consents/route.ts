import { NextRequest, NextResponse } from 'next/server';
import { PrivacyComplianceService } from '@/lib/privacy-compliance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fanId = searchParams.get('fanId');

    if (!fanId) {
      return NextResponse.json({ error: 'Fan ID is required' }, { status: 400 });
    }

    const consents = await PrivacyComplianceService.getConsentHistory(fanId);
    return NextResponse.json(consents);

  } catch (error) {
    console.error('Error fetching consents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consent history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fanId, email, artistId, consent_type, consent_given, consent_method, privacy_policy_version, legal_basis } = body;

    if (!artistId || !consent_type || typeof consent_given !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!fanId && !email) {
      return NextResponse.json({ error: 'Either fanId or email is required' }, { status: 400 });
    }

    // Get client IP and user agent for consent record
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const actualFanId = fanId;

    // If email provided but no fanId, try to find the fan
    if (!fanId && email) {
      // TODO: Implement fan lookup by email and artistId
      // For now, we'll create a new fan record if needed
    }

    const consent = await PrivacyComplianceService.recordConsent(
      actualFanId,
      artistId,
      {
        consent_type,
        consent_given,
        consent_method: consent_method || 'checkbox',
        consent_text: body.consent_text,
        privacy_policy_version: privacy_policy_version || '1.0',
        legal_basis: legal_basis || 'consent',
        ip_address: ip,
        user_agent: userAgent
      }
    );

    return NextResponse.json(consent);

  } catch (error) {
    console.error('Error recording consent:', error);
    return NextResponse.json(
      { error: 'Failed to record consent' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fanId = searchParams.get('fanId');
    const consentType = searchParams.get('consentType');
    const withdrawalMethod = searchParams.get('withdrawalMethod') || 'user_request';

    if (!fanId || !consentType) {
      return NextResponse.json({ error: 'Fan ID and consent type are required' }, { status: 400 });
    }

    await PrivacyComplianceService.withdrawConsent(fanId, consentType, withdrawalMethod);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error withdrawing consent:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw consent' },
      { status: 500 }
    );
  }
}
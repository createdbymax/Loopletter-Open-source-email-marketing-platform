import { NextRequest, NextResponse } from 'next/server';
import { PrivacyComplianceService } from '@/lib/privacy-compliance';
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { requestId, verificationToken } = body;
        if (!requestId || !verificationToken) {
            return NextResponse.json({ error: 'Request ID and verification token are required' }, { status: 400 });
        }
        const verified = await PrivacyComplianceService.verifyDataSubjectRequest(requestId, verificationToken);
        if (!verified) {
            return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
        }
        return NextResponse.json({ verified: true });
    }
    catch (error) {
        console.error('Error verifying data request:', error);
        return NextResponse.json({ error: 'Failed to verify data request' }, { status: 500 });
    }
}

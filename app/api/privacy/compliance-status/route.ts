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
        const complianceStatus = await PrivacyComplianceService.assessComplianceStatus(artistId);
        return NextResponse.json(complianceStatus);
    }
    catch (error) {
        console.error('Error fetching compliance status:', error);
        return NextResponse.json({ error: 'Failed to fetch compliance status' }, { status: 500 });
    }
}

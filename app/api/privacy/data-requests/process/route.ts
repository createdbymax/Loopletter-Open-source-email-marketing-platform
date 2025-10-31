import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrivacyComplianceService } from '@/lib/privacy-compliance';
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { requestId } = body;
        if (!requestId) {
            return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
        }
        const responseData = await PrivacyComplianceService.processDataSubjectRequest(requestId, userId);
        return NextResponse.json({
            success: true,
            data: responseData
        });
    }
    catch (error) {
        console.error('Error processing data request:', error);
        return NextResponse.json({ error: 'Failed to process data request' }, { status: 500 });
    }
}

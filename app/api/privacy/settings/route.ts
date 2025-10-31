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
        const settings = await PrivacyComplianceService.getPrivacySettings(artistId);
        return NextResponse.json(settings);
    }
    catch (error) {
        console.error('Error fetching privacy settings:', error);
        return NextResponse.json({ error: 'Failed to fetch privacy settings' }, { status: 500 });
    }
}
export async function PUT(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { artistId, ...settings } = body;
        if (!artistId) {
            return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
        }
        const updatedSettings = await PrivacyComplianceService.updatePrivacySettings(artistId, settings);
        return NextResponse.json(updatedSettings);
    }
    catch (error) {
        console.error('Error updating privacy settings:', error);
        return NextResponse.json({ error: 'Failed to update privacy settings' }, { status: 500 });
    }
}

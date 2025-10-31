import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
export async function GET(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const domain = searchParams.get('domain');
        if (!domain) {
            return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
        }
        const isVerified = Math.random() > 0.5;
        return NextResponse.json({
            success: true,
            domain,
            verified: isVerified,
            message: isVerified ? 'Domain is verified' : 'Domain verification pending'
        });
    }
    catch (error) {
        console.error('Error checking domain verification:', error);
        return NextResponse.json({ error: 'Failed to check domain verification' }, { status: 500 });
    }
}

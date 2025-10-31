import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { updateArtistSettings } from '@/lib/db';
export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { artistId, completedAt } = body;
        if (!artistId || typeof artistId !== 'string') {
            return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
        }
        await updateArtistSettings(user.id, {
            onboarding_completed: true,
            onboarding_completed_at: completedAt || new Date().toISOString(),
        });
        return NextResponse.json({
            success: true,
            message: 'Onboarding marked as complete'
        });
    }
    catch (error) {
        console.error('Error completing onboarding:', error);
        return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
    }
}
export async function GET(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({
            success: true,
            onboardingComplete: false,
            message: 'Onboarding status endpoint ready'
        });
    }
    catch (error) {
        console.error('Error fetching onboarding status:', error);
        return NextResponse.json({ error: 'Failed to fetch onboarding status' }, { status: 500 });
    }
}

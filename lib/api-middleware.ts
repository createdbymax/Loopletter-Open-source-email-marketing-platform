import { NextRequest, NextResponse } from 'next/server';
import { Artist } from './types';
import { canAccessFeature, FeatureAccess } from './subscription';
export async function withFeatureAccess(req: NextRequest, res: NextResponse, artist: Artist, feature: keyof FeatureAccess, handler: () => Promise<NextResponse>) {
    if (!canAccessFeature(artist, feature)) {
        return NextResponse.json({
            error: 'Feature not available',
            message: `This feature requires an upgrade to access.`,
            feature,
        }, { status: 403 });
    }
    return handler();
}
export async function withSubscriberLimits(req: NextRequest, res: NextResponse, artist: Artist, currentCount: number, handler: () => Promise<NextResponse>) {
    const { subscription } = artist;
    const plan = subscription?.plan || 'starter';
    const limits = {
        starter: 1000,
        independent: 10000,
        label: 50000,
    };
    if (currentCount >= limits[plan]) {
        return NextResponse.json({
            error: 'Subscriber limit reached',
            message: `You've reached the maximum number of subscribers for your plan.`,
            currentCount,
            limit: limits[plan],
        }, { status: 403 });
    }
    return handler();
}
export async function withEmailSendLimits(req: NextRequest, res: NextResponse, artist: Artist, currentSendCount: number, handler: () => Promise<NextResponse>) {
    const { subscription } = artist;
    const plan = subscription?.plan || 'starter';
    if (plan === 'starter' && currentSendCount >= 3000) {
        return NextResponse.json({
            error: 'Email send limit reached',
            message: `You've reached the maximum number of emails for your plan.`,
            currentSendCount,
            limit: 3000,
        }, { status: 403 });
    }
    return handler();
}

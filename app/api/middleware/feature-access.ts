import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { canAccessFeature, FeatureAccess } from '@/lib/subscription';
import { getAuth } from '@clerk/nextjs/server';
import type { Artist } from '@/lib/types';
export async function withFeatureAccess(feature: keyof FeatureAccess, handler: (req: NextRequest, artist: Artist) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
        try {
            const { userId } = getAuth(req);
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const artist = await getOrCreateArtistByClerkId(userId, '', '');
            if (!canAccessFeature(artist, feature)) {
                return NextResponse.json({
                    error: 'Feature not available',
                    message: `This feature requires an upgrade to access.`,
                    feature,
                    upgradeUrl: `/dashboard/settings?tab=subscription&feature=${feature}`,
                }, { status: 403 });
            }
            return handler(req, artist);
        }
        catch (error) {
            console.error('Feature access middleware error:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    };
}

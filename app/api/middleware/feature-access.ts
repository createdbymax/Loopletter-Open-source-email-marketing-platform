import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { canAccessFeature, FeatureAccess } from '@/lib/subscription';
import { getAuth } from '@clerk/nextjs/server';
import type { Artist } from '@/lib/types';

// Middleware to check if user has access to a feature
export async function withFeatureAccess(
  feature: keyof FeatureAccess,
  handler: (req: NextRequest, artist: Artist) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Get authenticated user
      const { userId } = getAuth(req);
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Get artist
      const artist = await getOrCreateArtistByClerkId(
        userId,
        '', // Email will be fetched from Clerk
        '' // Name will be fetched from Clerk
      );

      // Check feature access
      if (!canAccessFeature(artist, feature)) {
        return NextResponse.json(
          {
            error: 'Feature not available',
            message: `This feature requires an upgrade to access.`,
            feature,
            upgradeUrl: `/dashboard/settings?tab=subscription&feature=${feature}`,
          },
          { status: 403 }
        );
      }

      // Call the handler with the artist
      return handler(req, artist);
    } catch (error) {
      console.error('Feature access middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
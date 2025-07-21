import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, updateArtist } from '@/lib/db';
import { canAccessFeature } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = getAuth(request);
    
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
    if (!canAccessFeature(artist, 'customSignupDomain')) {
      return NextResponse.json(
        {
          error: 'Feature not available',
          message: `This feature requires an upgrade to access.`,
          feature: 'customSignupDomain',
          upgradeUrl: `/dashboard/settings?tab=subscription&feature=customSignupDomain`,
        },
        { status: 403 }
      );
    }

    // Update custom domain
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Update artist with custom domain
    await updateArtist(artist.id, {
      ses_domain: domain,
      ses_status: 'pending_verification',
    });

    return NextResponse.json({
      success: true,
      message: 'Custom domain added successfully',
      domain,
      status: 'pending_verification',
    });
  } catch (error) {
    console.error('Error updating custom domain:', error);
    return NextResponse.json(
      { error: 'Failed to update custom domain' },
      { status: 500 }
    );
  }
}
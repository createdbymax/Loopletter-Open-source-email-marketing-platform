import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, updateArtist } from '@/lib/db';
import { canAccessFeature } from '@/lib/subscription';
import { isDomainAlreadyClaimed } from '@/lib/domain-security';

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

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Check if domain is already claimed by another user
    const isAlreadyClaimed = await isDomainAlreadyClaimed(domain, artist.id);
    if (isAlreadyClaimed) {
      return NextResponse.json(
        { error: 'This domain is already claimed by another user' },
        { status: 409 }
      );
    }

    // Update artist with custom domain (unverified initially)
    await updateArtist(artist.id, {
      ses_domain: domain,
      ses_domain_verified: false, // Always start as unverified
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
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { verifyDomainOwnership } from '@/lib/domain-ownership-verification';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get artist to ensure they own this domain claim
    const artist = await getOrCreateArtistByClerkId(
      userId,
      '', // Email will be fetched from Clerk
      '' // Name will be fetched from Clerk
    );

    const { domain } = await request.json();
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Use enhanced verification that checks ownership
    const verificationResult = await verifyDomainOwnership(artist.id, domain);
    
    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error || 'Verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      domain,
      verified: verificationResult.verified,
      status: verificationResult.verified ? 'Success' : 'Pending',
    });
  } catch (error: unknown) {
    console.error('Error checking domain verification:', error);
    let message = 'Failed to check domain verification';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
      message = (error as { message: string }).message;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
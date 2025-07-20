import { NextRequest, NextResponse } from 'next/server';
import { withFeatureAccess } from '@/app/api/middleware/feature-access';
import { updateArtist } from '@/lib/db';
import { Artist } from '@/lib/types';

// Handler for custom domain settings
async function handler(req: NextRequest, artist: Artist) {
  // POST - Update custom domain
  if (req.method === 'POST') {
    try {
      const { domain } = await req.json();

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

  // Method not allowed
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

// Wrap the handler with feature access middleware
export const POST = withFeatureAccess('customSignupDomain', handler);
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCampaignById, getOrCreateArtistByClerkId } from '@/lib/db';
import { queueCampaign } from '@/lib/queue';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaignId = params.id;
    
    // Verify campaign exists and belongs to user
    const campaign = await getCampaignById(campaignId);
    const artist = await getOrCreateArtistByClerkId(userId, '', '');
    
    if (campaign.artist_id !== artist.id) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Verify domain is set up
    if (!artist.ses_domain || !artist.ses_domain_verified) {
      return NextResponse.json({ 
        error: 'Domain verification required. Please complete domain setup before sending campaigns.' 
      }, { status: 400 });
    }

    // Queue the campaign for sending
    await queueCampaign(campaignId);

    return NextResponse.json({ 
      success: true, 
      message: 'Campaign queued for sending',
      campaignId 
    });
  } catch (error: any) {
    console.error('Error sending campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
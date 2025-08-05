import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, getCampaignById } from '@/lib/db';
import { getJobStatus } from '@/lib/email-queue';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get artist to verify ownership
    const artist = await getOrCreateArtistByClerkId(
      user.id,
      user.primaryEmailAddress?.emailAddress || '',
      user.fullName || 'Artist'
    );

    // Fetch campaign
    const campaign = await getCampaignById(id);
    
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Verify ownership
    if (campaign.artist_id !== artist.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get job status if campaign is scheduled/sending
    let jobStatus = null;
    if (campaign.job_id && (campaign.status === 'scheduled' || campaign.status === 'sending')) {
      jobStatus = await getJobStatus(campaign.job_id);
    }

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        title: campaign.title,
        subject: campaign.subject,
        status: campaign.status,
        send_date: campaign.send_date,
        stats: campaign.stats,
      },
      job: jobStatus,
    });

  } catch (error) {
    console.error('Error getting campaign status:', error);
    return NextResponse.json(
      { error: 'Failed to get campaign status' },
      { status: 500 }
    );
  }
}
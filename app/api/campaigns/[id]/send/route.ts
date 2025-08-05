import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, getCampaignById, updateCampaign, getFansByArtist } from '@/lib/db';
import { serverAnalytics } from '@/lib/server-analytics';
import { sesRateLimiter, estimateCampaignDuration } from '@/lib/ses-config';
import { queueBulkCampaign } from '@/lib/email-queue';

export async function POST(
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

    // Check if campaign can be sent
    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 });
    }

    if (!campaign.subject) {
      return NextResponse.json({ error: 'Campaign must have a subject' }, { status: 400 });
    }

    // Check if campaign has content (either message or template data)
    if (!campaign.message && !campaign.template_data) {
      return NextResponse.json({ error: 'Campaign must have message content or template data' }, { status: 400 });
    }

    // Check if artist has proper email configuration for production
    if (process.env.NODE_ENV === 'production' && (!artist.ses_domain || !artist.ses_domain_verified)) {
      return NextResponse.json({ 
        error: 'You must have a verified domain to send campaigns',
        details: 'Please set up and verify your domain in the Domain Settings before sending campaigns.'
      }, { status: 400 });
    }

    // Get fans to send to
    const fans = await getFansByArtist(artist.id);
    const fanCount = fans.length;

    if (fanCount === 0) {
      return NextResponse.json({ error: 'No subscribers to send to' }, { status: 400 });
    }

    // Check if we have enough quota remaining for this campaign
    const rateLimiterStats = await sesRateLimiter.getStats();
    if (rateLimiterStats.remainingToday < fanCount) {
      return NextResponse.json({ 
        error: 'Insufficient daily quota remaining',
        details: `Campaign requires ${fanCount} emails but only ${rateLimiterStats.remainingToday} remaining today.`
      }, { status: 400 });
    }

    console.log(`Queueing campaign "${campaign.title}" for ${fanCount} subscribers`);

    // For template-based campaigns, the message should be generated from the editor
    // The editor will have already converted template data to HTML and saved it
    if (!campaign.message || campaign.message === 'Template-based email content') {
      return NextResponse.json({ 
        error: 'Campaign content is required',
        details: 'Please ensure the campaign has been saved with content from the editor.'
      }, { status: 400 });
    }

    // Get estimated sending time
    const estimate = await estimateCampaignDuration(fanCount);
    
    // Queue the campaign for sending using the bulk queue system
    const job = await queueBulkCampaign(id, 25); // Use batch size of 25 for optimal throughput

    // Update campaign status to scheduled (will be changed to 'sending' by the queue worker)
    await updateCampaign(id, {
      status: 'scheduled',
      send_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      job_id: job.id?.toString()
    });

    // Track campaign queued event
    await serverAnalytics.track(user.id, 'Campaign Queued', {
      campaign_id: id,
      campaign_title: campaign.title || campaign.subject,
      recipient_count: fanCount,
      estimated_minutes: estimate.estimatedMinutes,
      campaign_type: campaign.template_data ? 'template' : 'custom',
      job_id: job.id,
    });

    // Return queue information
    const response = {
      success: true,
      queued: true,
      totalCount: fanCount,
      message: `Campaign queued for sending to ${fanCount} subscribers`,
      campaignId: id,
      campaignTitle: campaign.title || campaign.subject,
      jobId: job.id,
      estimatedTime: `${estimate.estimatedMinutes} minutes`,
      status: 'scheduled'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, getCampaignById, updateCampaign, getFansByArtist } from '@/lib/db';
import { sendCampaignEmail } from '@/lib/email-sender';
import { serverAnalytics } from '@/lib/server-analytics';

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

    console.log(`Starting to send campaign "${campaign.title}" to ${fanCount} subscribers`);

    // For template-based campaigns, the message should be generated from the editor
    // The editor will have already converted template data to HTML and saved it
    if (!campaign.message || campaign.message === 'Template-based email content') {
      return NextResponse.json({ 
        error: 'Campaign content is required',
        details: 'Please ensure the campaign has been saved with content from the editor.'
      }, { status: 400 });
    }

    // Update campaign status to sending
    await updateCampaign(id, {
      status: 'sending',
      send_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Add a small delay to show the preparing step in the UI
    await new Promise(resolve => setTimeout(resolve, 500));

    // Send emails to all fans
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (const fan of fans) {
      try {
        const result = await sendCampaignEmail(campaign, fan, artist);
        if (result.success) {
          successCount++;
          console.log(`✅ Sent to ${fan.email} (${successCount}/${fanCount})`);
        } else {
          failureCount++;
          const errorMsg = `Failed to send to ${fan.email}: ${result.error}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      } catch (error) {
        failureCount++;
        let errorMessage = 'Unknown error';
        
        if (error instanceof Error) {
          errorMessage = error.message;
          
          // Handle specific AWS SES errors
          if (errorMessage.includes('MessageRejected')) {
            errorMessage = 'Email rejected by SES (possibly invalid email address)';
          } else if (errorMessage.includes('Throttling')) {
            errorMessage = 'Rate limit exceeded, please try again later';
          } else if (errorMessage.includes('SendingQuotaExceeded')) {
            errorMessage = 'Daily sending quota exceeded';
          }
        }
        
        const errorMsg = `Failed to send to ${fan.email}: ${errorMessage}`;
        errors.push(errorMsg);
        console.error(`❌ Error sending to ${fan.email}:`, error);
      }

      // Add a small delay between emails to respect rate limits
      if (fans.indexOf(fan) < fans.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      }
    }

    // Update campaign status to sent
    await updateCampaign(id, {
      status: 'sent',
      updated_at: new Date().toISOString()
    });

    console.log(`Campaign sending completed: ${successCount} successful, ${failureCount} failed`);

    // Track campaign sent event
    await serverAnalytics.track(user.id, 'Campaign Sent', {
      campaign_id: id,
      campaign_title: campaign.title || campaign.subject,
      recipient_count: successCount,
      failed_count: failureCount,
      total_count: fanCount,
      success_rate: (successCount / fanCount) * 100,
      campaign_type: campaign.template_data ? 'template' : 'custom',
    });

    // Return results with detailed information for the modal
    const response = {
      success: true,
      sentCount: successCount,
      failedCount: failureCount,
      totalCount: fanCount,
      message: `Campaign sent to ${successCount} of ${fanCount} subscribers`,
      campaignId: id,
      campaignTitle: campaign.title || campaign.subject
    };

    // Include errors if there were any failures
    if (errors.length > 0) {
      (response as any).errors = errors.slice(0, 10); // Limit to first 10 errors
      if (errors.length > 10) {
        (response as any).additionalErrors = errors.length - 10;
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
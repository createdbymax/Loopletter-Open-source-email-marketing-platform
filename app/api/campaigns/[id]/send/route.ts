import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, getCampaignById, updateCampaign, getFansByArtist } from '@/lib/db';
import { serverAnalytics } from '@/lib/server-analytics';
import { sesRateLimiter, estimateCampaignDuration } from '@/lib/ses-config';
import { queueBulkCampaign } from '@/lib/email-queue';
export async function POST(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        console.log(`=== CAMPAIGN SEND ENDPOINT CALLED ===`);
        console.log(`Campaign ID: ${id}`);
        console.log(`User ID: ${user.id}`);
        const artist = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || 'Artist');
        const campaign = await getCampaignById(id);
        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }
        if (campaign.artist_id !== artist.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        if (campaign.status === 'sent') {
            return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 });
        }
        if (!campaign.subject) {
            return NextResponse.json({ error: 'Campaign must have a subject' }, { status: 400 });
        }
        if (!campaign.message && !campaign.template_data) {
            return NextResponse.json({ error: 'Please add content to your email before sending' }, { status: 400 });
        }
        if (process.env.NODE_ENV === 'production' && (!artist.ses_domain || !artist.ses_domain_verified)) {
            return NextResponse.json({
                error: 'You must have a verified domain to send campaigns',
                details: 'Please set up and verify your domain in the Domain Settings before sending campaigns.'
            }, { status: 400 });
        }
        const allFans = await getFansByArtist(artist.id);
        const subscribedFans = allFans.filter(fan => fan.status === 'subscribed');
        const fanCount = subscribedFans.length;
        if (fanCount === 0) {
            return NextResponse.json({ error: 'No subscribed fans to send to' }, { status: 400 });
        }
        const rateLimiterStats = await sesRateLimiter.getStats();
        if (rateLimiterStats.remainingToday < fanCount) {
            return NextResponse.json({
                error: 'Insufficient daily quota remaining',
                details: `Campaign requires ${fanCount} emails but only ${rateLimiterStats.remainingToday} remaining today.`
            }, { status: 400 });
        }
        console.log(`Queueing campaign "${campaign.title}" for ${fanCount} subscribed fans`);
        if (!campaign.message || campaign.message === 'Template-based email content') {
            return NextResponse.json({
                error: 'Campaign content is required',
                details: 'Please ensure the campaign has been saved with content from the editor.'
            }, { status: 400 });
        }
        const estimate = await estimateCampaignDuration(fanCount);
        console.log(`Attempting to queue campaign ${id} for ${fanCount} fans...`);
        let job;
        try {
            job = await queueBulkCampaign(id, 25);
            console.log(`Campaign queued successfully. Job ID: ${job.id}, Job Name: ${job.name}`);
        }
        catch (queueError) {
            console.error('Error queueing campaign:', queueError);
            throw new Error(`Failed to queue campaign: ${queueError instanceof Error ? queueError.message : 'Unknown error'}`);
        }
        await updateCampaign(id, {
            status: 'scheduled',
            send_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            job_id: job.id?.toString()
        });
        await serverAnalytics.track(user.id, 'Campaign Queued', {
            campaign_id: id,
            campaign_title: campaign.title || campaign.subject,
            recipient_count: fanCount,
            estimated_minutes: estimate.estimatedMinutes,
            campaign_type: campaign.template_data ? 'template' : 'custom',
            job_id: job.id,
        });
        if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: triggering queue processing...');
            setTimeout(async () => {
                try {
                    const processResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/queue/process-all`, {
                        method: 'GET',
                    });
                    if (processResponse.ok) {
                        const processResult = await processResponse.json();
                        console.log('Queue processing result:', processResult);
                    }
                    else {
                        console.error('Failed to process queue:', await processResponse.text());
                    }
                }
                catch (error) {
                    console.error('Error triggering queue processing:', error);
                }
            }, 2000);
        }
        const response = {
            success: true,
            queued: true,
            totalCount: fanCount,
            message: `Campaign queued for sending to ${fanCount} subscribed fans`,
            campaignId: id,
            campaignTitle: campaign.title || campaign.subject,
            jobId: job.id,
            estimatedTime: `${estimate.estimatedMinutes} minutes`,
            status: 'scheduled'
        };
        return NextResponse.json(response);
    }
    catch (error) {
        console.error('Error sending campaign:', error);
        return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
    }
}

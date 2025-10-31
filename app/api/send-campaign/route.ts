import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCampaignById, getFansByArtist, updateCampaign } from '@/lib/db';
import { queueBulkCampaign } from '@/lib/email-queue';
import { estimateCampaignDuration } from '@/lib/ses-config';
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { campaignId, batchSize = 50 } = await req.json();
        if (!campaignId) {
            return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
        }
        const campaign = await getCampaignById(campaignId);
        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }
        if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
            return NextResponse.json({
                error: `Cannot send campaign with status: ${campaign.status}`
            }, { status: 400 });
        }
        const fans = await getFansByArtist(campaign.artist_id);
        const subscribedFans = fans.filter(fan => fan.status === 'subscribed');
        if (subscribedFans.length === 0) {
            return NextResponse.json({
                error: 'No subscribed fans found for this campaign'
            }, { status: 400 });
        }
        await updateCampaign(campaignId, {
            status: 'scheduled',
            send_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        const estimate = await estimateCampaignDuration(subscribedFans.length);
        const job = await queueBulkCampaign(campaignId, batchSize);
        return NextResponse.json({
            success: true,
            message: 'Campaign queued for sending',
            jobId: job.id,
            totalRecipients: subscribedFans.length,
            estimatedTime: `${estimate.estimatedMinutes} minutes`
        });
    }
    catch (error) {
        console.error('Error queueing campaign:', error);
        return NextResponse.json({
            error: 'Failed to queue campaign for sending'
        }, { status: 500 });
    }
}

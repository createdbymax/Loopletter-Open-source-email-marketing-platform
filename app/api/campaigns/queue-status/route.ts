import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { getJobStatus } from '@/lib/email-queue';

export async function GET(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get artist to verify ownership
        const artist = await getOrCreateArtistByClerkId(
            user.id,
            user.primaryEmailAddress?.emailAddress || '',
            user.fullName || 'Artist'
        );

        // Get user's campaigns that are scheduled or sending (have job_id)
        const { data: campaigns, error } = await supabase
            .from('campaigns')
            .select('id, title, subject, status, job_id, send_date, created_at, updated_at')
            .eq('artist_id', artist.id)
            .in('status', ['scheduled', 'sending'])
            .not('job_id', 'is', null)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Get job status for each campaign
        const campaignsWithJobStatus = await Promise.all(
            (campaigns || []).map(async (campaign) => {
                let jobStatus = null;
                if (campaign.job_id) {
                    try {
                        jobStatus = await getJobStatus(campaign.job_id);
                    } catch (error) {
                        console.warn(`Failed to get job status for ${campaign.job_id}:`, error);
                    }
                }

                return {
                    ...campaign,
                    jobStatus,
                };
            })
        );

        // Calculate user-specific statistics
        const userStats = {
            scheduled: campaignsWithJobStatus.filter(c => c.status === 'scheduled').length,
            sending: campaignsWithJobStatus.filter(c => c.status === 'sending').length,
            total: campaignsWithJobStatus.length,
        };

        return NextResponse.json({
            success: true,
            campaigns: campaignsWithJobStatus,
            stats: userStats,
        });

    } catch (error) {
        console.error('Error getting user queue status:', error);
        return NextResponse.json(
            { error: 'Failed to get queue status' },
            { status: 500 }
        );
    }
}
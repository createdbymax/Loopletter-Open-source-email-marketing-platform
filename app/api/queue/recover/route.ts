import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { queueBulkCampaign, getJobStatus } from '@/lib/email-queue';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all scheduled campaigns that have job_ids but no active Redis jobs
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('id, title, subject, job_id, artist_id')
      .eq('status', 'scheduled')
      .not('job_id', 'is', null);

    if (error) {
      throw error;
    }

    const recoveredJobs = [];
    const failedRecoveries = [];

    for (const campaign of campaigns || []) {
      try {
        // Check if the Redis job actually exists
        const jobStatus = await getJobStatus(campaign.job_id);
        
        if (!jobStatus) {
          // Job doesn't exist in Redis, recreate it
          console.log(`Recovering campaign ${campaign.id} - job ${campaign.job_id} not found in Redis`);
          
          const newJob = await queueBulkCampaign(campaign.id, 25);
          
          // Update the campaign with the new job ID
          const { error: updateError } = await supabase
            .from('campaigns')
            .update({ 
              job_id: newJob.id?.toString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', campaign.id);

          if (updateError) {
            throw updateError;
          }

          recoveredJobs.push({
            campaignId: campaign.id,
            title: campaign.title || campaign.subject,
            oldJobId: campaign.job_id,
            newJobId: newJob.id
          });
        } else {
          console.log(`Campaign ${campaign.id} job ${campaign.job_id} exists in Redis`);
        }
      } catch (error) {
        console.error(`Failed to recover campaign ${campaign.id}:`, error);
        failedRecoveries.push({
          campaignId: campaign.id,
          title: campaign.title || campaign.subject,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Recovery completed. ${recoveredJobs.length} jobs recovered, ${failedRecoveries.length} failed.`,
      recovered: recoveredJobs,
      failed: failedRecoveries,
      totalCampaigns: campaigns?.length || 0
    });

  } catch (error) {
    console.error('Queue recovery failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
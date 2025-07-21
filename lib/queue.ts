// Background job processing for email campaigns
import { sendCampaignEmail } from './email-sender';
import { getCampaignById, getFansByArtist, getArtistById, updateCampaign } from './db';

interface EmailJob {
  id: string;
  campaignId: string;
  fanId: string;
  priority: 'high' | 'normal' | 'low';
  attempts: number;
  maxAttempts: number;
  scheduledFor: Date;
  createdAt: Date;
}

class EmailQueue {
  private jobs: EmailJob[] = [];
  private processing = false;
  private batchSize = 14; // SES rate limit
  private batchInterval = 1000; // 1 second between batches

  async addCampaignToQueue(campaignId: string): Promise<void> {
    const campaign = await getCampaignById(campaignId);
    const fans = await getFansByArtist(campaign.artist_id);

    // Filter active subscribers
    const activeFans = fans.filter(f => f.status === 'subscribed');

    // Create jobs for each fan
    const jobs: EmailJob[] = activeFans.map(fan => ({
      id: `${campaignId}-${fan.id}-${Date.now()}`,
      campaignId,
      fanId: fan.id,
      priority: 'normal',
      attempts: 0,
      maxAttempts: 3,
      scheduledFor: new Date(campaign.send_date),
      createdAt: new Date(),
    }));

    this.jobs.push(...jobs);

    // Start processing if not already running
    if (!this.processing) {
      this.startProcessing();
    }
  }

  private async startProcessing(): Promise<void> {
    this.processing = true;

    while (this.jobs.length > 0) {
      const now = new Date();
      const readyJobs = this.jobs
        .filter(job => job.scheduledFor <= now)
        .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
        .slice(0, this.batchSize);

      if (readyJobs.length === 0) {
        // Wait for next scheduled job
        const nextJob = this.jobs
          .filter(job => job.scheduledFor > now)
          .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())[0];

        if (nextJob) {
          const waitTime = nextJob.scheduledFor.getTime() - now.getTime();
          await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 60000))); // Max 1 minute wait
        } else {
          break;
        }
        continue;
      }

      // Process batch
      await this.processBatch(readyJobs);

      // Remove processed jobs
      this.jobs = this.jobs.filter(job => !readyJobs.includes(job));

      // Wait between batches to respect rate limits
      if (this.jobs.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.batchInterval));
      }
    }

    this.processing = false;
  }

  private async processBatch(jobs: EmailJob[]): Promise<void> {
    const results = await Promise.allSettled(
      jobs.map(job => this.processJob(job))
    );

    // Handle failed jobs
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const job = jobs[index];
        job.attempts++;

        if (job.attempts < job.maxAttempts) {
          // Retry with exponential backoff
          job.scheduledFor = new Date(Date.now() + Math.pow(2, job.attempts) * 60000);
          this.jobs.push(job);
        } else {
          console.error(`Job ${job.id} failed after ${job.maxAttempts} attempts:`, result.reason);
        }
      }
    });
  }

  private async processJob(job: EmailJob): Promise<void> {
    try {
      const [campaign, artist, fans] = await Promise.all([
        getCampaignById(job.campaignId),
        getCampaignById(job.campaignId).then(c => getArtistById(c.artist_id)),
        getFansByArtist((await getCampaignById(job.campaignId)).artist_id)
      ]);

      const fan = fans.find(f => f.id === job.fanId);
      if (!fan) {
        throw new Error(`Fan ${job.fanId} not found`);
      }

      const result = await sendCampaignEmail(campaign, fan, artist);

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  }

  getQueueStatus(): { pending: number; processing: boolean } {
    return {
      pending: this.jobs.length,
      processing: this.processing,
    };
  }
}

// Singleton instance
export const emailQueue = new EmailQueue();

// API endpoint helper
export async function queueCampaign(campaignId: string): Promise<void> {
  await emailQueue.addCampaignToQueue(campaignId);

  // Update campaign status
  await updateCampaign(campaignId, {
    status: 'sending',
    send_date: new Date().toISOString(),
  });
}
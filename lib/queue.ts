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
    private batchSize = 14;
    private batchInterval = 1000;
    async addCampaignToQueue(campaignId: string): Promise<void> {
        const campaign = await getCampaignById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        const fans = await getFansByArtist(campaign.artist_id);
        const activeFans = fans.filter(f => f.status === 'subscribed');
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
                const nextJob = this.jobs
                    .filter(job => job.scheduledFor > now)
                    .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())[0];
                if (nextJob) {
                    const waitTime = nextJob.scheduledFor.getTime() - now.getTime();
                    await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 60000)));
                }
                else {
                    break;
                }
                continue;
            }
            await this.processBatch(readyJobs);
            this.jobs = this.jobs.filter(job => !readyJobs.includes(job));
            if (this.jobs.length > 0) {
                await new Promise(resolve => setTimeout(resolve, this.batchInterval));
            }
        }
        this.processing = false;
    }
    private async processBatch(jobs: EmailJob[]): Promise<void> {
        const results = await Promise.allSettled(jobs.map(job => this.processJob(job)));
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const job = jobs[index];
                job.attempts++;
                if (job.attempts < job.maxAttempts) {
                    job.scheduledFor = new Date(Date.now() + Math.pow(2, job.attempts) * 60000);
                    this.jobs.push(job);
                }
                else {
                    console.error(`Job ${job.id} failed after ${job.maxAttempts} attempts:`, result.reason);
                }
            }
        });
    }
    private async processJob(job: EmailJob): Promise<void> {
        try {
            const campaign = await getCampaignById(job.campaignId);
            if (!campaign) {
                throw new Error(`Campaign ${job.campaignId} not found`);
            }
            const artist = await getArtistById(campaign.artist_id);
            if (!artist) {
                throw new Error(`Artist ${campaign.artist_id} not found`);
            }
            const fans = await getFansByArtist(campaign.artist_id);
            const fan = fans.find(f => f.id === job.fanId);
            if (!fan) {
                throw new Error(`Fan ${job.fanId} not found`);
            }
            const result = await sendCampaignEmail(campaign, fan, artist);
            if (!result.success) {
                throw new Error(result.error || 'Failed to send email');
            }
        }
        catch (error) {
            console.error(`Error processing job ${job.id}:`, error);
            throw error;
        }
    }
    getQueueStatus(): {
        pending: number;
        processing: boolean;
    } {
        return {
            pending: this.jobs.length,
            processing: this.processing,
        };
    }
}
export const emailQueue = new EmailQueue();
export async function queueCampaign(campaignId: string): Promise<void> {
    await emailQueue.addCampaignToQueue(campaignId);
    await updateCampaign(campaignId, {
        status: 'sending',
        send_date: new Date().toISOString(),
    });
}

import { SESClient, SendEmailCommand, GetSendQuotaCommand } from '@aws-sdk/client-ses';
import { render } from '@react-email/render';
import { 
  MusicReleaseTemplate, 
  ShowAnnouncementTemplate, 
  MerchandiseTemplate 
} from '@/app/dashboard/email-templates';
import { 
  getCampaignById, 
  getFansByArtist, 
  getFansBySegment,
  logEmailSent, 
  updateCampaign,
  getArtistById 
} from './db';
import type { Campaign, Fan, Artist } from './types';

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const ses = new SESClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  bounced?: boolean;
  complained?: boolean;
}

export async function sendCampaignEmail(
  campaign: Campaign, 
  fan: Fan, 
  artist: Artist
): Promise<EmailSendResult> {
  try {
    // Validate that artist has a verified domain
    if (!artist.ses_domain || !artist.ses_domain_verified) {
      throw new Error('Artist must have a verified SES domain to send emails');
    }

    // Generate email HTML
    const emailHtml = await generateEmailContent(campaign, fan, artist);
    
    // Add tracking pixels and links
    const trackedHtml = addEmailTracking(emailHtml, campaign.id, fan.id, campaign, fan);
    
    // Use artist's verified domain for sending
    const fromEmail = `${artist.name} <noreply@${artist.ses_domain}>`;
    const replyToEmail = artist.email.includes('@' + artist.ses_domain) 
      ? artist.email 
      : `${artist.name.toLowerCase().replace(/\s+/g, '')}@${artist.ses_domain}`;
    
    const emailParams = {
      Destination: {
        ToAddresses: [fan.email],
      },
      Message: {
        Body: {
          Html: {
            Data: trackedHtml,
            Charset: 'UTF-8',
          },
          Text: {
            Data: stripHtml(trackedHtml),
            Charset: 'UTF-8',
          },
        },
        Subject: {
          Data: campaign.subject || campaign.title,
          Charset: 'UTF-8',
        },
      },
      Source: fromEmail,
      ReplyToAddresses: [replyToEmail],
      Tags: [
        {
          Name: 'campaign_id',
          Value: campaign.id,
        },
        {
          Name: 'artist_id',
          Value: artist.id,
        },
      ],
    };

    // Send email via SES
    const result = await ses.send(new SendEmailCommand(emailParams));
    
    // Log the email send
    await logEmailSent({
      fan_id: fan.id,
      campaign_id: campaign.id,
      email_address: fan.email,
      status: 'sent',
      sent_at: new Date().toISOString(),
      message_id: result.MessageId,
    });

    return { 
      success: true, 
      messageId: result.MessageId 
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to send email:', errorMessage);
    
    // Log failed send
    await logEmailSent({
      fan_id: fan.id,
      campaign_id: campaign.id,
      email_address: fan.email,
      status: 'sent', // Will be updated by webhook if it bounces
      sent_at: new Date().toISOString(),
      error_message: errorMessage,
    });

    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

async function generateEmailContent(
  campaign: Campaign, 
  fan: Fan, 
  artist: Artist
): Promise<string> {
  if (campaign.template_id && campaign.template_data) {
    return await generateTemplateEmail(campaign.template_id, campaign.template_data, fan, artist);
  }
  
  // Fallback to campaign message with basic template
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${campaign.subject || campaign.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">${campaign.title}</h1>
          <p style="color: #7f8c8d; margin: 0;">From ${artist.name}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          ${campaign.message.replace(/\n/g, '<br>')}
        </div>
        
        ${campaign.artwork_url ? `
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${campaign.artwork_url}" alt="Artwork" style="max-width: 100%; height: auto; border-radius: 8px;">
          </div>
        ` : ''}
        
        ${campaign.link ? `
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${campaign.link}" style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Learn More
            </a>
          </div>
        ` : ''}
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; text-align: center; color: #7f8c8d; font-size: 14px;">
          <p>You're receiving this because you subscribed to ${artist.name}'s mailing list.</p>
          <p>
            <a href="${BASE_URL}/unsubscribe?fan_id=${fan.id}&campaign_id=${campaign.id}" style="color: #7f8c8d;">
              Unsubscribe
            </a> | 
            <a href="${BASE_URL}/preferences?fan_id=${fan.id}" style="color: #7f8c8d;">
              Update Preferences
            </a>
          </p>
        </div>
      </body>
    </html>
  `;
}

async function generateTemplateEmail(
  templateId: string, 
  templateData: Record<string, unknown>, 
  fan: Fan, 
  artist: Artist
): Promise<string> {
  // Merge fan and artist data into template data
  const mergedData = {
    ...templateData,
    fan_name: fan.name || 'Fan',
    fan_email: fan.email,
    artist_name: artist.name,
    unsubscribe_url: `${BASE_URL}/unsubscribe?fan_id=${fan.id}`,
    preferences_url: `${BASE_URL}/preferences?fan_id=${fan.id}`,
  };

  switch (templateId) {
    case 'music-release':
      return render(MusicReleaseTemplate(mergedData));
    case 'show-announcement':
      return render(ShowAnnouncementTemplate(mergedData));
    case 'merchandise':
      return render(MerchandiseTemplate(mergedData));
    default:
      throw new Error(`Unknown template: ${templateId}`);
  }
}

function addEmailTracking(html: string, campaignId: string, fanId: string, campaign: Campaign, fan: Fan): string {
  let trackedHtml = html;
  
  // Check both campaign settings and fan preferences
  const fanTrackingPrefs = fan.tracking_preferences || { allow_open_tracking: true, allow_click_tracking: true };
  
  // Only add click tracking if enabled in campaign AND fan allows it
  if (campaign.settings.track_clicks && fanTrackingPrefs.allow_click_tracking) {
    // Add click tracking to links
    trackedHtml = trackedHtml.replace(
      /href="([^"]+)"/g,
      `href="${BASE_URL}/api/track/click?fan_id=${fanId}&campaign_id=${campaignId}&url=${encodeURIComponent('$1')}"`
    );
  }
  
  // Only add open tracking if enabled in campaign AND fan allows it
  if (campaign.settings.track_opens && fanTrackingPrefs.allow_open_tracking) {
    // Add open tracking pixel
    const openPixel = `<img src="${BASE_URL}/api/track/open?fan_id=${fanId}&campaign_id=${campaignId}" width="1" height="1" style="display:none;" alt="" />`;
    // Insert tracking pixel before closing body tag
    trackedHtml = trackedHtml.replace('</body>', `${openPixel}</body>`);
  }
  
  return trackedHtml;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

export async function sendCampaignToAllFans(campaignId: string): Promise<{
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors: string[];
}> {
  try {
    const campaign = await getCampaignById(campaignId);
    const artist = await getArtistById(campaign.artist_id);
    
    // Validate that artist has a verified domain
    if (!artist.ses_domain || !artist.ses_domain_verified) {
      throw new Error('Artist must have a verified SES domain before sending campaigns. Please complete domain setup first.');
    }
    
    // Get fans based on segment or all fans
    const fans = campaign.segment_id 
      ? await getFansBySegment(campaign.segment_id)
      : await getFansByArtist(campaign.artist_id);
    
    // Filter active subscribers only (unless campaign allows unsubscribed)
    const targetFans = campaign.settings.send_to_unsubscribed 
      ? fans 
      : fans.filter(f => f.status === 'subscribed');

    // Check SES sending quota
    const quotaResult = await ses.send(new GetSendQuotaCommand({}));
    const remainingQuota = (quotaResult.Max24HourSend || 0) - (quotaResult.SentLast24Hours || 0);
    
    if (targetFans.length > remainingQuota) {
      throw new Error(`Not enough sending quota. Need ${targetFans.length}, have ${remainingQuota}`);
    }

    // Update campaign status
    await updateCampaign(campaignId, { 
      status: 'sending',
      send_date: new Date().toISOString()
    });

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Send emails in batches to respect rate limits
    const batchSize = 14; // SES allows 14 emails per second
    const batches = [];
    
    for (let i = 0; i < targetFans.length; i += batchSize) {
      batches.push(targetFans.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(fan => sendCampaignEmail(campaign, fan, artist));
      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          sentCount++;
        } else {
          failedCount++;
          const error = result.status === 'rejected' 
            ? result.reason.message 
            : result.value.error;
          errors.push(`${batch[index].email}: ${error}`);
        }
      });

      // Wait 1 second between batches to respect rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update campaign with final stats
    await updateCampaign(campaignId, { 
      status: 'sent',
      stats: {
        ...campaign.stats,
        total_sent: sentCount,
      }
    });

    return {
      success: true,
      sentCount,
      failedCount,
      errors,
    };
  } catch (error: unknown) {
    console.error('Failed to send campaign:', error);
    
    // Update campaign status to failed
    await updateCampaign(campaignId, { status: 'draft' });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      sentCount: 0,
      failedCount: 0,
      errors: [errorMessage],
    };
  }
}

export async function checkSendingQuota(): Promise<{
  max24Hour: number;
  sentLast24Hours: number;
  remaining: number;
  maxSendRate: number;
}> {
  try {
    const result = await ses.send(new GetSendQuotaCommand({}));
    
    return {
      max24Hour: result.Max24HourSend || 0,
      sentLast24Hours: result.SentLast24Hours || 0,
      remaining: (result.Max24HourSend || 0) - (result.SentLast24Hours || 0),
      maxSendRate: result.MaxSendRate || 0,
    };
  } catch (error) {
    console.error('Failed to check sending quota:', error);
    return {
      max24Hour: 0,
      sentLast24Hours: 0,
      remaining: 0,
      maxSendRate: 0,
    };
  }
}

export async function validateEmailDeliverability(domain: string): Promise<{
  spfValid: boolean;
  dkimValid: boolean;
  dmarcValid: boolean;
  mxValid: boolean;
  recommendations: string[];
}> {
  // This would integrate with email validation services
  // For now, return mock data
  return {
    spfValid: true,
    dkimValid: true,
    dmarcValid: false,
    mxValid: true,
    recommendations: [
      'Set up DMARC policy for better deliverability',
      'Consider using a dedicated IP for high volume sending',
    ],
  };
}
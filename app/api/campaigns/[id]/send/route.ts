import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getOrCreateArtistByClerkId,
  getCampaignById,
  updateCampaign,
  getFansByArtist,
  logEmailSent,
  getTemplateById
} from "@/lib/db";
// Import the email templates
import {
  MusicReleaseTemplate,
  ShowAnnouncementTemplate,
  MerchandiseTemplate
} from "@/app/dashboard/email-templates";
// Note: TypeScript resolves to .tsx file for template components
import { render } from "@react-email/render";

// Import SES config and email queue
import { SES_CONFIG, isEmailVerifiedInSandbox } from '@/lib/ses-config';
import { queueEmail } from '@/lib/email-queue';

import { EmailContent, TemplateData } from '@/lib/email-types';
import { Campaign } from '@/lib/types';

// Helper function to add tracking to HTML content
function addTracking(
  html: string,
  messageId: string,
  campaignId: string,
  fanId: string,
  baseUrl: string
): string {
  // Add tracking pixel for opens
  const trackingPixel = `<img src="${baseUrl}/api/track/open?mid=${messageId}&cid=${campaignId}&fid=${fanId}" width="1" height="1" alt="" style="display:none;"/>`;

  // Add tracking to links
  let trackedHtml = html.replace(/<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["']/gi, (match, url) => {
    // Skip tracking for unsubscribe links and anchors
    if (url.includes('unsubscribe') || url.startsWith('#')) {
      return match;
    }

    const encodedUrl = encodeURIComponent(url);
    return `<a href="${baseUrl}/api/track/click?mid=${messageId}&cid=${campaignId}&fid=${fanId}&url=${encodedUrl}"`;
  });

  // Add tracking pixel before closing body tag
  trackedHtml = trackedHtml.replace('</body>', `${trackingPixel}</body>`);

  return trackedHtml;
}

// Helper function to generate email content
async function generateEmailContent(campaign: Campaign, templateData: TemplateData): Promise<EmailContent> {
  // If using a template from the database
  if (campaign.template_id) {
    try {
      const template = await getTemplateById(campaign.template_id);
      // Here you would process the template with the template data
      // For now, we'll just return a simple HTML email
      return {
        html: template.html_content,
        text: "Please view this email in a HTML-capable email client."
      };
    } catch (error) {
      console.error("Error fetching template:", error);
    }
  }

  // If using a predefined template type
  if (templateData && templateData.templateName) {
    try {
      console.log(`Generating email content for template: ${templateData.templateName}`);
      console.log("Template data:", JSON.stringify(templateData, null, 2));

      // Generate HTML based on template type
      switch (templateData.templateName) {
        case 'music-release': {
          // Map the template data to the expected props
          const props = {
            artistName: templateData.artistName || 'Artist',
            releaseTitle: templateData.releaseTitle || 'New Release',
            releaseType: templateData.releaseType || 'Single',
            releaseDate: templateData.releaseDate || 'Now Available',
            coverArtUrl: templateData.artwork,
            streamingLinks: {
              spotify: templateData.spotifyUrl,
              apple: templateData.appleMusicUrl,
              youtube: templateData.youtubeUrl
            },
            artistMessage: templateData.description || 'Check out my latest release!',
            unsubscribe_url: '/unsubscribe'
          };

          // Render the React component to HTML
          const html = await render(MusicReleaseTemplate(props));

          // Create a plain text version
          const text = `New ${props.releaseType} from ${props.artistName}: "${props.releaseTitle}"\n\n${props.artistMessage}\n\nListen now:\n${props.streamingLinks.spotify ? `Spotify: ${props.streamingLinks.spotify}\n` : ''}${props.streamingLinks.apple ? `Apple Music: ${props.streamingLinks.apple}\n` : ''}${props.streamingLinks.youtube ? `YouTube: ${props.streamingLinks.youtube}` : ''}`;

          return { html, text };
        }

        case 'show-announcement': {
          // Map the template data to the expected props
          const props = {
            artistName: templateData.artistName || 'Artist',
            venue: templateData.venue || 'Venue',
            city: templateData.city || 'City',
            date: templateData.date || 'Date',
            time: templateData.time || 'Time',
            ticketUrl: templateData.ticketUrl,
            eventImageUrl: templateData.posterImage,
            supportingActs: templateData.supportingActs ? [templateData.supportingActs] : [],
            ticketPrice: templateData.ticketPrice,
            unsubscribe_url: '/unsubscribe'
          };

          // Render the React component to HTML
          const html = await render(ShowAnnouncementTemplate(props));

          // Create a plain text version
          const text = `${props.artistName} Live in ${props.city}\n\nVenue: ${props.venue}\nDate: ${props.date} at ${props.time}\n\n${props.supportingActs.length > 0 ? `Special Guests: ${props.supportingActs.join(', ')}\n\n` : ''}${props.ticketUrl ? `Get tickets: ${props.ticketUrl}` : ''}`;

          return { html, text };
        }

        case 'merchandise': {
          // Map the template data to the expected props
          const props = {
            artistName: templateData.artistName || 'Artist',
            collectionName: templateData.collectionName || 'New Collection',
            items: templateData.items?.map((item: {
              name: string;
              price: string;
              image?: string;
            }) => ({
              name: item.name,
              price: item.price,
              imageUrl: item.image,
              url: templateData.shopUrl
            })) || [],
            shopUrl: templateData.shopUrl,
            discountCode: templateData.discountCode,
            discountPercent: templateData.discountPercent ? parseInt(templateData.discountPercent) : undefined,
            unsubscribe_url: '/unsubscribe'
          };

          // Render the React component to HTML
          const html = await render(MerchandiseTemplate(props));

          // Create a plain text version
          const text = `New ${props.artistName} Merch Drop: ${props.collectionName}\n\n${props.discountCode ? `${props.discountPercent}% OFF with code: ${props.discountCode}\n\n` : ''}Shop now: ${props.shopUrl}`;

          return { html, text };
        }

        default:
          break;
      }
    } catch (error) {
      console.error("Error rendering email template:", error);
      // Fall back to a simple template
      return {
        html: `
          <html>
            <body>
              <h1>${campaign.subject}</h1>
              <p>${campaign.message || 'Check out our latest update!'}</p>
            </body>
          </html>
        `,
        text: `${campaign.subject}\n\n${campaign.message || 'Check out our latest update!'}`
      };
    }
  }

  // Default to using the campaign message
  return {
    html: `<html><body>
      <h1>${campaign.subject}</h1>
      <div>${campaign.message ? campaign.message.replace(/\n/g, '<br>') : ''}</div>
    </body></html>`,
    text: `${campaign.subject}\n\n${campaign.message || ''}`
  };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params in Next.js 13+ App Router
    const { id: campaignId } = await params;
    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    // Get the artist associated with the current user
    const artist = await getOrCreateArtistByClerkId(userId, "", "");

    // Get the campaign
    const campaign = await getCampaignById(campaignId);

    // Verify the campaign belongs to this artist
    if (campaign.artist_id !== artist.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the artist has a verified domain
    if (!artist.ses_domain || !artist.ses_domain_verified) {
      return NextResponse.json({
        error: "You must have a verified domain to send emails",
        details: "Please set up and verify your domain in the Domain Settings"
      }, { status: 400 });
    }

    // Get all fans for this artist
    const fans = await getFansByArtist(artist.id);

    // Filter to only subscribed fans
    const subscribedFans = fans.filter(fan => fan.status === 'subscribed');

    if (subscribedFans.length === 0) {
      return NextResponse.json({
        error: "No subscribers to send to",
        details: "You need to add subscribers before sending a campaign"
      }, { status: 400 });
    }

    // Generate email content
    // Ensure template_data is properly typed - provide default if undefined/null
    const templateData: TemplateData = {
      templateId: campaign.template_id || 'default',
      data: campaign.template_data || {}
    };
    const emailContent = await generateEmailContent(campaign, templateData);

    // Log the subscribers we're about to send to
    console.log(`Attempting to send to ${subscribedFans.length} subscribers:`,
      subscribedFans.map(fan => ({ id: fan.id, email: fan.email })));

    // Check if we're in SES sandbox mode
    const isSandbox = SES_CONFIG.isSandbox;
    if (isSandbox) {
      console.log("WARNING: Running in SES sandbox mode. Only verified email addresses will receive emails.");
    }

    // Use the email queue for sending emails
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const results = [];
    const queuedEmails = [];
    
    // Process each fan and queue their email
    for (const fan of subscribedFans) {
      try {
        // In sandbox mode, check if the email is verified
        if (isSandbox) {
          const isVerified = await isEmailVerifiedInSandbox(fan.email);
          if (!isVerified) {
            console.log(`Skipping unverified email in sandbox mode: ${fan.email}`);
            results.push({ 
              success: false, 
              fanId: fan.id, 
              email: fan.email, 
              error: 'Email not verified in sandbox mode' 
            });
            continue;
          }
        }
        
        // Generate a tracking message ID
        const trackingMessageId = `${campaignId}_${fan.id}_${Date.now()}`;
        
        // Add tracking to HTML content if tracking is enabled
        let htmlContent = emailContent.html;
        if (campaign.settings?.track_opens || campaign.settings?.track_clicks) {
          htmlContent = addTracking(
            emailContent.html,
            trackingMessageId,
            campaignId,
            fan.id,
            baseUrl
          );
        }
        
        // Create the email parameters
        const params = {
          Source: `${artist.name} <noreply@${artist.ses_domain}>`,
          Destination: {
            ToAddresses: [fan.email],
          },
          Message: {
            Subject: {
              Data: campaign.subject,
              Charset: 'UTF-8',
            },
            Body: {
              Html: {
                Data: htmlContent,
                Charset: 'UTF-8',
              },
              Text: {
                Data: emailContent.text,
                Charset: 'UTF-8',
              },
            },
          },
          // Add custom headers for tracking and identification
          Headers: [
            {
              Name: 'X-Campaign-ID',
              Value: campaignId
            },
            {
              Name: 'X-Fan-ID',
              Value: fan.id
            },
            ...(campaign.settings?.track_opens ? [{
              Name: 'X-SES-CONFIGURATION-SET',
              Value: SES_CONFIG.configurationSet,
            }] : [])
          ],
        };
        
        // Queue the email for sending
        const queueId = await queueEmail(
          campaignId,
          fan.id,
          fan.email,
          params,
          0 // Default priority
        );
        
        queuedEmails.push({
          queueId,
          fanId: fan.id,
          email: fan.email
        });
        
        // For immediate feedback, we'll consider queued emails as successful
        results.push({ 
          success: true, 
          fanId: fan.id, 
          email: fan.email, 
          queueId,
          status: 'queued'
        });
        
        // Log the email as sent in the database
        await logEmailSent({
          fan_id: fan.id,
          campaign_id: campaignId,
          email_address: fan.email,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      } catch (error: unknown) {
        console.error(`Error queueing email to ${fan.email}:`, error);
        
        results.push({ 
          success: false, 
          fanId: fan.id, 
          email: fan.email, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Count successful sends
    const successfulSends = results.filter(r => r.success).length;

    // Update campaign status to sent
    await updateCampaign(campaignId, {
      status: 'sent',
      stats: {
        ...campaign.stats,
        total_sent: subscribedFans.length,
        delivered: successfulSends
      }
    });

    return NextResponse.json({
      success: true,
      sentCount: successfulSends,
      totalAttempted: subscribedFans.length
    });
  } catch (error: unknown) {
    console.error("Failed to send campaign:", error);
    return NextResponse.json(
      { error: "Failed to send campaign", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
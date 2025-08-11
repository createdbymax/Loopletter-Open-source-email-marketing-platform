import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import type { Campaign, Fan, Artist } from './types';
import { logEmailSent } from './db';
import { sesRateLimiter } from './ses-config';
// import { render } from '@react-email/render';

// Initialize SES client
const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface TeamInvitationEmailProps {
  to: string;
  artistName: string;
  inviterName: string;
  role: string;
  invitationUrl: string;
}

interface WaitlistConfirmationEmailProps {
  to: string;
  waitlistCount?: number;
}

interface EarlyAccessConfirmationEmailProps {
  to: string;
  name: string;
  requestCount?: number;
}

export async function sendWaitlistConfirmationEmail({
  to,
  waitlistCount
}: WaitlistConfirmationEmailProps): Promise<void> {
  const html = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to the Loopletter Waitlist</title>
      <style type="text/css">
        #outlook a {padding: 0}
        .ExternalClass {width: 100%}
        .ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {line-height: 100%}
        body,table,td,a {-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%}
        table,td {mso-table-lspace: 0;mso-table-rspace: 0}
        img {-ms-interpolation-mode: bicubic}
        img {border: 0;outline: none;text-decoration: none}
        a img {border: none}
        td img {vertical-align: top}
        table,table td {border-collapse: collapse}
        body {margin: 0;padding: 0;width: 100% !important}
        .mobile-spacer {width: 0;display: none}
        @media all and (max-width:639px) {
          .container {width: 100% !important;max-width: 600px !important}
          .mobile {width: auto !important;max-width: 100% !important;display: block !important}
          .mobile-center {text-align: center !important}
          .mobile-right {text-align: right !important}
          .mobile-left {text-align: left !important;}
          .mobile-hidden {max-height: 0;display: none !important;mso-hide: all;overflow: hidden}
          .mobile-spacer {width: auto !important;display: table !important}
          .mobile-image,.mobile-image img {height: auto !important;max-width: 600px !important;width: 100% !important}
        }
      </style>
      <!--[if mso]>
      <style type="text/css">
        body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
      </style>
      <![endif]-->
    </head>
    <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
      <span style="color: transparent; display: none; height: 0px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; visibility: hidden; width: 0px;">Welcome to the Loopletter Waitlist</span>
      
      <table cellpadding="0" cellspacing="0" border="0" width="100%" class="body" style="width: 100%;">
        <tbody>
          <tr>
            <td align="center" valign="top" style="vertical-align: top; line-height: 1; padding: 48px 32px;">
              
              <!-- Header with Logo -->
              <table cellpadding="0" cellspacing="0" border="0" width="600" class="header container" style="width: 600px;">
                <tbody>
                  <tr>
                    <td align="left" valign="top" style="vertical-align: top; line-height: 1; padding: 16px 32px;">
                      <p style="padding: 0px; margin: 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 24px; line-height: 36px;">
                        <img width="128" src="https://loopletter.s3.us-east-1.amazonaws.com/assets/loopletterbimi.png" alt="Loopletter Logo" style="max-width: 128px; width: 128px;">
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <!-- Main Content -->
              <table cellpadding="0" cellspacing="0" border="0" width="600" class="main container" style="width: 600px; border-collapse: separate;">
                <tbody>
                  <tr>
                    <td align="left" valign="top" bgcolor="#fff" style="vertical-align: top; line-height: 1; background-color: #ffffff; border-radius: 0px;">
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" class="block" style="width: 100%; border-collapse: separate;">
                        <tbody>
                          <tr>
                            <td align="left" valign="top" bgcolor="#ffffff" style="vertical-align: top; line-height: 1; padding: 32px 32px 48px; background-color: #ffffff; border-radius: 0px;">
                              
                              <h1 class="h1" align="left" style="padding: 0px; margin: 0px; font-style: normal; font-family: Helvetica, Arial, sans-serif; font-size: 32px; line-height: 39px; color: #000000; font-weight: bold;">
                                🎉 You're on the waitlist!
                              </h1>
                              
                              <p align="left" style="padding: 0px; margin: 16px 0px 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 14px; line-height: 21px;">
                                Thanks for joining the waitlist! You're now part of an exclusive group of artists who are ready to own their audience and transform their music careers.
                              </p>
                              
                              ${waitlistCount ? `
                              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0px;">
                                <tbody>
                                  <tr>
                                    <td align="center" valign="top" style="vertical-align: top; line-height: 1; padding: 20px; background-color: #f1f5f9; border-radius: 8px;">
                                      <p style="padding: 0px; margin: 0px; font-family: Helvetica, Arial, sans-serif; color: #475569; font-size: 16px; line-height: 24px; font-weight: normal;">
                                        You're <strong style="color: #3b82f6;">#${waitlistCount}</strong> on the waitlist
                                      </p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              ` : ''}
                              
                              <h2 align="left" style="padding: 0px; margin: 24px 0px 16px 0px; font-style: normal; font-family: Helvetica, Arial, sans-serif; font-size: 20px; line-height: 24px; color: #000000; font-weight: bold;">
                                What happens next?
                              </h2>
                              
                              <p align="left" style="padding: 0px; margin: 8px 0px 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 14px; line-height: 21px;">
                                📧 We'll email you as soon as Loopletter launches
                              </p>
                              
                              <p align="left" style="padding: 0px; margin: 8px 0px 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 14px; line-height: 21px;">
                                🎯 You'll get exclusive early access before the general public
                              </p>
                              
                              <p align="left" style="padding: 0px; margin: 8px 0px 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 14px; line-height: 21px;">
                                💰 Special founder pricing (50% off for your first year)
                              </p>
                              
                              <p align="left" style="padding: 0px; margin: 8px 0px 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 14px; line-height: 21px;">
                                🚀 Free migration help from your current email platform
                              </p>
                              
                              <h2 align="left" style="padding: 0px; margin: 24px 0px 16px 0px; font-style: normal; font-family: Helvetica, Arial, sans-serif; font-size: 20px; line-height: 24px; color: #000000; font-weight: bold;">
                                Why Loopletter?
                              </h2>
                              
                              <p align="left" style="padding: 0px; margin: 16px 0px 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 14px; line-height: 21px;">
                                Stop chasing algorithms that don't care about your music. Build a fanbase that shows up, buys tickets, and streams your songs because they genuinely love what you create.
                              </p>
                              
                              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0px;">
                                <tbody>
                                  <tr>
                                    <td align="left" valign="top" style="vertical-align: top; line-height: 1; padding: 16px; background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px;">
                                      <p style="padding: 0px; margin: 0px; font-family: Helvetica, Arial, sans-serif; color: #475569; font-size: 14px; line-height: 21px; font-style: italic;">
                                        "The moment everything changes is when you own your audience."
                                      </p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              
                              <p align="center" style="padding: 0px; margin: 24px 0px 0px; font-family: Helvetica, Arial, sans-serif; color: #64748b; font-size: 14px; line-height: 21px;">
                                Thanks for believing in artist independence,<br>
                                <strong>The Loopletter Team</strong>
                              </p>
                              
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  const text = `
🎉 Welcome to the Loopletter Waitlist!

Thanks for joining the waitlist! You're now part of an exclusive group of artists who are ready to own their audience and transform their music careers.

${waitlistCount ? `You're #${waitlistCount} on the waitlist` : ''}

What happens next?
• We'll email you as soon as Loopletter launches
• You'll get exclusive early access before the general public  
• Special founder pricing (50% off for your first year)
• Free migration help from your current email platform

Why Loopletter?
Stop chasing algorithms that don't care about your music. Build a fanbase that shows up, buys tickets, and streams your songs because they genuinely love what you create.

"The moment everything changes is when you own your audience."

Thanks for believing in artist independence,
The Loopletter Team

loopletter.co
  `;

  const params = {
    Source: `Loopletter <hello@loopletter.co>`,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: `🎉 Welcome to the Loopletter Waitlist!`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8',
        },
        Text: {
          Data: text,
          Charset: 'UTF-8',
        },
      },
    },
  };

  const command = new SendEmailCommand(params);
  await ses.send(command);
}

export async function sendTeamInvitationEmail({
  to,
  artistName,
  inviterName,
  role,
  invitationUrl
}: TeamInvitationEmailProps): Promise<void> {
  // Simple HTML email template for team invitation
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>You've been invited to join ${artistName}'s team on Loopletter</h2>
          <p>${inviterName} has invited you to collaborate as a <strong>${role}</strong> on their Loopletter account.</p>
          <p>Loopletter is an email marketing platform built specifically for artists and creators.</p>
          <div style="margin: 30px 0;">
            <a href="${invitationUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Accept Invitation
            </a>
          </div>
          <p>This invitation will expire in 7 days.</p>
          <p>If you have any questions, please contact ${inviterName}.</p>
        </div>
      </body>
    </html>
  `;

  const text = `
    You've been invited to join ${artistName}'s team on Loopletter
    
    ${inviterName} has invited you to collaborate as a ${role} on their Loopletter account.
    
    Loopletter is an email marketing platform built specifically for artists and creators.
    
    Accept the invitation by visiting this link:
    ${invitationUrl}
    
    This invitation will expire in 7 days.
    
    If you have any questions, please contact ${inviterName}.
  `;

  const params = {
    Source: `Loopletter <noreply@loopletter.co>`,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: `You've been invited to join ${artistName}'s team on Loopletter`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8',
        },
        Text: {
          Data: text,
          Charset: 'UTF-8',
        },
      },
    },
  };

  const command = new SendEmailCommand(params);
  await ses.send(command);
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendCampaignEmail(
  campaign: Campaign,
  fan: Fan,
  artist: Artist
): Promise<EmailResult> {
  try {
    // Check rate limits before sending
    const rateLimitCheck = await sesRateLimiter.canSendEmail();
    if (!rateLimitCheck.canSend) {
      // If we need to wait, delay the execution
      if (rateLimitCheck.waitTime) {
        await new Promise(resolve => setTimeout(resolve, rateLimitCheck.waitTime));
        // Check again after waiting
        const secondCheck = await sesRateLimiter.canSendEmail();
        if (!secondCheck.canSend) {
          throw new Error(`Rate limit exceeded: ${secondCheck.reason}`);
        }
      } else {
        throw new Error(`Quota exceeded: ${rateLimitCheck.reason}`);
      }
    }
    // Personalize the email content
    let personalizedMessage = campaign.message;
    if (fan.name) {
      personalizedMessage = personalizedMessage.replace(/\{name\}/g, fan.name);
      personalizedMessage = personalizedMessage.replace(/\{first_name\}/g, fan.name.split(' ')[0]);
    }

    // Replace artist placeholders
    personalizedMessage = personalizedMessage.replace(/\{artist_name\}/g, artist.name);

    // Create unsubscribe and preferences links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const unsubscribeUrl = `${baseUrl}/unsubscribe?fan_id=${fan.id}&campaign_id=${campaign.id}`;
    const preferencesUrl = `${baseUrl}/preferences?fan_id=${fan.id}`;

    // Add tracking and unsubscribe functionality
    personalizedMessage = await addEmailTracking(personalizedMessage, campaign, fan, artist, unsubscribeUrl, preferencesUrl);

    // Determine sender email - use campaign's from_name if available
    const fromName = campaign.from_name || artist.default_from_name || artist.name;
    const emailPrefix = artist.default_from_email || "noreply";
    const senderEmail = artist.ses_domain_verified && artist.ses_domain
      ? `${fromName} <${emailPrefix}@${artist.ses_domain}>`
      : `${fromName} via Loopletter <noreply@loopletter.co>`;

    const params = {
      Source: senderEmail,
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
            Data: personalizedMessage, // Use the complete HTML as-is
            Charset: 'UTF-8',
          },
          Text: {
            Data: `${campaign.subject}\n\n${personalizedMessage.replace(/<[^>]*>/g, '')}\n\n---\nYou're receiving this email because you subscribed to updates from ${artist.name}.\nUnsubscribe: ${unsubscribeUrl}\nUpdate preferences: ${preferencesUrl}`,
            Charset: 'UTF-8',
          },
        },
      },
      // Add tracking headers if enabled
      ...(campaign.settings.track_opens && {
        Tags: [
          {
            Name: 'campaign_id',
            Value: campaign.id,
          },
          {
            Name: 'fan_id',
            Value: fan.id,
          },
        ],
      }),
    };

    // Generate a unique tracking ID for this email
    const trackingId = `${campaign.id}-${fan.id}-${Date.now()}`;

    // Replace messageId placeholder with tracking ID
    if (params.Message.Body.Html?.Data) {
      params.Message.Body.Html.Data = params.Message.Body.Html.Data.replace(/\{\{messageId\}\}/g, trackingId);
    }

    const command = new SendEmailCommand(params);
    const result = await ses.send(command);

    // Record the email as sent for rate limiting
    await sesRateLimiter.recordEmailSent();

    // Log the sent email (handle RLS policy errors gracefully)
    try {
      await logEmailSent({
        fan_id: fan.id,
        campaign_id: campaign.id,
        email_address: fan.email,
        status: 'sent',
        sent_at: new Date().toISOString(),
        message_id: result.MessageId || trackingId, // Use SES MessageId if available, otherwise tracking ID
      });
    } catch (logError) {
      // Don't fail the email send if logging fails due to RLS policies
      console.warn('Failed to log email sent (RLS policy issue):', logError);
    }

    return {
      success: true,
      messageId: result.MessageId,
    };
  } catch (error) {
    console.error('Error sending campaign email:', error);

    // Log the failed email attempt (handle RLS policy errors gracefully)
    try {
      await logEmailSent({
        fan_id: fan.id,
        campaign_id: campaign.id,
        email_address: fan.email,
        status: 'sent', // Will be updated by webhook when we get bounce/complaint
        sent_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    } catch (logError) {
      // Don't fail the email send if logging fails due to RLS policies
      console.warn('Failed to log failed email (RLS policy issue):', logError);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendEarlyAccessConfirmationEmail({
  to,
  name,
  requestCount
}: EarlyAccessConfirmationEmailProps): Promise<void> {
  const html = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Early Access Request Received - Loopletter</title>
      <style type="text/css">
        #outlook a {padding: 0}
        .ExternalClass {width: 100%}
        .ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {line-height: 100%}
        body,table,td,a {-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%}
        table,td {mso-table-lspace: 0;mso-table-rspace: 0}
        img {-ms-interpolation-mode: bicubic}
        img {border: 0;outline: none;text-decoration: none}
        a img {border: none}
        td img {vertical-align: top}
        table,table td {border-collapse: collapse}
        body {margin: 0;padding: 0;width: 100% !important}
        .mobile-spacer {width: 0;display: none}
        @media all and (max-width:639px) {
          .container {width: 100% !important;max-width: 600px !important}
          .mobile {width: auto !important;max-width: 100% !important;display: block !important}
          .mobile-center {text-align: center !important}
          .mobile-right {text-align: right !important}
          .mobile-left {text-align: left !important;}
          .mobile-hidden {max-height: 0;display: none !important;mso-hide: all;overflow: hidden}
          .mobile-spacer {width: auto !important;display: table !important}
          .mobile-image,.mobile-image img {height: auto !important;max-width: 600px !important;width: 100% !important}
        }
      </style>
      <!--[if mso]>
      <style type="text/css">
        body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
      </style>
      <![endif]-->
    </head>
    <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
      <span style="color: transparent; display: none; height: 0px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; visibility: hidden; width: 0px;">Early Access Request Received - Loopletter</span>
      
      <table cellpadding="0" cellspacing="0" border="0" width="100%" class="body" style="width: 100%;">
        <tbody>
          <tr>
            <td align="center" valign="top" style="vertical-align: top; line-height: 1; padding: 48px 32px;">
              
              <!-- Header with Logo -->
              <table cellpadding="0" cellspacing="0" border="0" width="600" class="header container" style="width: 600px;">
                <tbody>
                  <tr>
                    <td align="left" valign="top" style="vertical-align: top; line-height: 1; padding: 16px 32px;">
                      <p style="padding: 0px; margin: 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 24px; line-height: 36px;">
                        <img width="128" src="https://loopletter.s3.us-east-1.amazonaws.com/assets/loopletterbimi.png" alt="Loopletter Logo" style="max-width: 128px; width: 128px;">
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <!-- Main Content -->
              <table cellpadding="0" cellspacing="0" border="0" width="600" class="main container" style="width: 600px; border-collapse: separate;">
                <tbody>
                  <tr>
                    <td align="left" valign="top" bgcolor="#fff" style="vertical-align: top; line-height: 1; background-color: #ffffff; border-radius: 0px;">
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" class="block" style="width: 100%; border-collapse: separate;">
                        <tbody>
                          <tr>
                            <td align="left" valign="top" bgcolor="#ffffff" style="vertical-align: top; line-height: 1; padding: 32px 32px 48px; background-color: #ffffff; border-radius: 0px;">
                              
                              <h1 class="h1" align="left" style="padding: 0px; margin: 0px; font-style: normal; font-family: Helvetica, Arial, sans-serif; font-size: 32px; line-height: 39px; color: #000000; font-weight: bold;">
                                🎉 Early Access Request Received!
                              </h1>
                              
                              <p align="left" style="padding: 0px; margin: 16px 0px 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 14px; line-height: 21px;">
                                Hi ${name},
                              </p>
                              
                              <p align="left" style="padding: 0px; margin: 16px 0px 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 14px; line-height: 21px;">
                                Thanks for requesting early access to Loopletter! We're excited to have you join our community of artists who are ready to own their audience and transform their music careers.
                              </p>
                              
                              ${requestCount ? `
                              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0px;">
                                <tbody>
                                  <tr>
                                    <td align="center" valign="top" style="vertical-align: top; line-height: 1; padding: 20px; background-color: #f1f5f9; border-radius: 8px;">
                                      <p style="padding: 0px; margin: 0px; font-family: Helvetica, Arial, sans-serif; color: #475569; font-size: 16px; line-height: 24px; font-weight: normal;">
                                        You're <strong style="color: #3b82f6;">#${requestCount}</strong> in line for early access
                                      </p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              ` : ''}
                              
                              <h2 align="left" style="padding: 0px; margin: 24px 0px 16px 0px; font-style: normal; font-family: Helvetica, Arial, sans-serif; font-size: 20px; line-height: 24px; color: #000000; font-weight: bold;">
                                What happens next?
                              </h2>
                              
                              <p align="left" style="padding: 0px; margin: 8px 0px 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 14px; line-height: 21px;">
                                <strong>Review Process:</strong> Our team will review your request and music within 1-2 business days
                              </p>
                              
                              <p align="left" style="padding: 0px; margin: 8px 0px 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 14px; line-height: 21px;">
                                <strong>Priority Access:</strong> We'll send you an invitation to join Loopletter based on your profile and our current capacity
                              </p>
                              
                              <p align="left" style="padding: 0px; margin: 8px 0px 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 14px; line-height: 21px;">
                                <strong>Onboarding:</strong> Once approved, you'll get a personalized onboarding experience tailored to your goals
                              </p>
                              
                              <p align="left" style="padding: 0px; margin: 8px 0px 0px; font-family: Helvetica, Arial, sans-serif; color: #000000; font-size: 14px; line-height: 21px;">
                                <strong>Beta Feedback:</strong> Help us build the perfect platform for artists like you
                              </p>
                              
                              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0px;">
                                <tbody>
                                  <tr>
                                    <td align="left" valign="top" style="vertical-align: top; line-height: 1; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                                      <p style="padding: 0px; margin: 0px; font-family: Helvetica, Arial, sans-serif; color: #92400e; font-size: 14px; line-height: 21px;">
                                        <strong>Pro Tip:</strong> Follow us on social media for updates and tips while you wait!
                                      </p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  const text = `
🎉 Early Access Request Received!

Hi ${name},

Thanks for requesting early access to Loopletter! We're excited to have you join our community of artists who are ready to own their audience and transform their music careers.

${requestCount ? `You're #${requestCount} in line for early access` : ''}

What happens next?

• Review Process: Our team will review your request and music within 1-2 business days
• Priority Access: We'll send you an invitation to join Loopletter based on your profile and our current capacity  
• Onboarding: Once approved, you'll get a personalized onboarding experience tailored to your goals
• Beta Feedback: Help us build the perfect platform for artists like you

Pro Tip: Follow us on social media for updates and tips while you wait!


---
Loopletter - Email Marketing for Artists
You're receiving this because you requested early access to our platform.
  `;

  const params = {
    Source: `Loopletter <noreply@loopletter.co>`,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: `🎉 Early Access Request Received - Welcome to Loopletter!`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8',
        },
        Text: {
          Data: text,
          Charset: 'UTF-8',
        },
      },
    },
  };

  const command = new SendEmailCommand(params);
  await ses.send(command);
}

/**
 * Adds email tracking (open pixel, click tracking) and unsubscribe links to email content
 */
async function addEmailTracking(
  message: string,
  campaign: Campaign,
  fan: Fan,
  artist: Artist,
  unsubscribeUrl: string,
  preferencesUrl: string
): Promise<string> {
  let processedMessage = message;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';

  // Check if this is HTML content (more comprehensive check using regex)
  const isHtml = message.includes('<html>') || message.includes('<!DOCTYPE') || 
                 /<p\b/.test(message) || /<div\b/.test(message) || 
                 /<br\b/.test(message) || /<span\b/.test(message);

  if (isHtml) {
    // Add click tracking to all links if enabled
    if (campaign.settings?.track_clicks) {
      processedMessage = addClickTracking(processedMessage, campaign.id, fan.id);
    }

    // Add open tracking pixel if enabled
    if (campaign.settings?.track_opens) {
      const trackingPixel = `<img src="${baseUrl}/api/track/open?mid={{messageId}}&cid=${campaign.id}&fid=${fan.id}" width="1" height="1" style="display:none;" alt="" />`;

      // Insert tracking pixel before closing body tag
      processedMessage = processedMessage.replace(
        /<\/body>/i,
        `${trackingPixel}\n</body>`
      );
    }

    // Wrap content in complete HTML structure if it's not already
    if (!processedMessage.includes('<html>') && !processedMessage.includes('<!DOCTYPE')) {
      processedMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${campaign.subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    ${processedMessage}
  </div>
</body>
</html>`;
    }

    // Add unsubscribe footer if not already present
    if (!processedMessage.includes('unsubscribe')) {
      const unsubscribeFooter = `
        <div style="font-size: 12px; color: #666; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0 0 10px 0;">You're receiving this email because you subscribed to updates from ${artist.name}.</p>
          <p style="margin: 0;">
            <a href="${unsubscribeUrl}" style="color: #666; text-decoration: none;">Unsubscribe</a> | 
            <a href="${preferencesUrl}" style="color: #666; text-decoration: none;">Update preferences</a>
          </p>
        </div>
      `;

      // Add Loopletter footer
      const loopletterFooter = `
        <div style="font-size: 12px; color: #666; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eaeaea;">
          <p style="margin: 0;">
            Sent with <a href="https://loopletter.co" style="color: #666; text-decoration: none;">Loopletter</a>
          </p>
        </div>
      `;

      // Insert both footers before closing container div and body
      processedMessage = processedMessage.replace(
        /<\/div>\s*<\/body>/,
        unsubscribeFooter + loopletterFooter + '\n  </div>\n</body>'
      );
    }
  } else {
    // For plain text emails, just add unsubscribe footer
    if (!processedMessage.includes('unsubscribe')) {
      processedMessage += `\n\n---\nYou're receiving this email because you subscribed to updates from ${artist.name}.\nUnsubscribe: ${unsubscribeUrl}\nUpdate preferences: ${preferencesUrl}`;
    }
  }

  return processedMessage;
}

/**
 * Adds click tracking to all links in HTML content
 */
function addClickTracking(html: string, campaignId: string, fanId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';

  // Regular expression to find all href attributes
  const linkRegex = /href=["']([^"']+)["']/gi;

  return html.replace(linkRegex, (match, url) => {
    // Skip tracking for unsubscribe and preference links
    if (url.includes('/unsubscribe') || url.includes('/f/') || url.includes('mailto:')) {
      return match;
    }

    // Skip if already a tracking link
    if (url.includes('/api/track/click')) {
      return match;
    }

    // Create tracking URL
    const encodedUrl = encodeURIComponent(url);
    const trackingUrl = `${baseUrl}/api/track/click?mid={{messageId}}&cid=${campaignId}&fid=${fanId}&url=${encodedUrl}`;

    return `href="${trackingUrl}"`;
  });
}
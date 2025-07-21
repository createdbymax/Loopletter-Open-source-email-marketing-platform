import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import type { Campaign, Fan, Artist } from './types';
import { logEmailSent } from './db';
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
    Source: `Loopletter <noreply@loopletter.com>`,
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
    // Personalize the email content
    let personalizedMessage = campaign.message;
    if (fan.name) {
      personalizedMessage = personalizedMessage.replace(/\{name\}/g, fan.name);
      personalizedMessage = personalizedMessage.replace(/\{first_name\}/g, fan.name.split(' ')[0]);
    }
    
    // Replace artist placeholders
    personalizedMessage = personalizedMessage.replace(/\{artist_name\}/g, artist.name);
    
    // Create unsubscribe link
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?fan=${fan.id}&campaign=${campaign.id}`;
    
    // Add unsubscribe link to message if not already present
    if (!personalizedMessage.includes('unsubscribe')) {
      personalizedMessage += `\n\n---\nTo unsubscribe from these emails, click here: ${unsubscribeUrl}`;
    }
    
    // Determine sender email
    const senderEmail = artist.ses_domain_verified && artist.ses_domain 
      ? `${artist.name} <noreply@${artist.ses_domain}>`
      : `${artist.name} via Loopletter <noreply@loopletter.com>`;

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
            Data: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    ${personalizedMessage.replace(/\n/g, '<br>')}
                    ${campaign.artwork_url ? `<br><br><img src="${campaign.artwork_url}" alt="Campaign artwork" style="max-width: 100%; height: auto;">` : ''}
                    <br><br>
                    <div style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                      <p>You're receiving this email because you subscribed to updates from ${artist.name}.</p>
                      <p><a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> | <a href="${process.env.NEXT_PUBLIC_APP_URL}/f/${artist.slug}" style="color: #666;">Update preferences</a></p>
                    </div>
                  </div>
                </body>
              </html>
            `,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `${personalizedMessage}\n\n---\nYou're receiving this email because you subscribed to updates from ${artist.name}.\nTo unsubscribe: ${unsubscribeUrl}`,
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

    const command = new SendEmailCommand(params);
    const result = await ses.send(command);

    // Log the sent email
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
      messageId: result.MessageId,
    };
  } catch (error) {
    console.error('Error sending campaign email:', error);
    
    // Log the failed email attempt
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
      console.error('Error logging failed email:', logError);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
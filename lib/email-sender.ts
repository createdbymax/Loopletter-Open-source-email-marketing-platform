import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
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
          <h2>You've been invited to join ${artistName}'s team on LoopLetter</h2>
          <p>${inviterName} has invited you to collaborate as a <strong>${role}</strong> on their LoopLetter account.</p>
          <p>LoopLetter is an email marketing platform built specifically for artists and creators.</p>
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
    You've been invited to join ${artistName}'s team on LoopLetter
    
    ${inviterName} has invited you to collaborate as a ${role} on their LoopLetter account.
    
    LoopLetter is an email marketing platform built specifically for artists and creators.
    
    Accept the invitation by visiting this link:
    ${invitationUrl}
    
    This invitation will expire in 7 days.
    
    If you have any questions, please contact ${inviterName}.
  `;

  const params = {
    Source: `LoopLetter <noreply@loopletter.com>`,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: `You've been invited to join ${artistName}'s team on LoopLetter`,
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
import { ImportJob } from './types';
import { createNotification } from './notifications';

export async function sendImportCompletionEmail(
  artistEmail: string,
  artistName: string,
  job: ImportJob
): Promise<void> {
  const { SESClient, SendEmailCommand } = await import('@aws-sdk/client-ses');
  
  const sesClient = new SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const isSuccess = job.status === 'completed';
  const result = job.result;
  
  const subject = isSuccess 
    ? `✅ Fan import completed - ${result?.imported || 0} fans imported`
    : `❌ Fan import failed - ${job.file_data.filename}`;

  let htmlBody = '';
  let textBody = '';

  if (isSuccess && result) {
    htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Import Completed Successfully!</h2>
        <p>Hi ${artistName},</p>
        <p>Your fan import from <strong>${job.file_data.filename}</strong> has been completed.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0369a1;">Import Summary</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 5px 0;"><strong>✅ Successfully imported:</strong> ${result.imported} fans</li>
            ${result.failed > 0 ? `<li style="padding: 5px 0;"><strong>❌ Failed:</strong> ${result.failed} fans</li>` : ''}
            ${result.skipped > 0 ? `<li style="padding: 5px 0;"><strong>⏭️ Skipped (duplicates):</strong> ${result.skipped} fans</li>` : ''}
            <li style="padding: 5px 0;"><strong>📁 File:</strong> ${job.file_data.filename}</li>
            <li style="padding: 5px 0;"><strong>🏷️ Tags:</strong> ${job.file_data.tags.length > 0 ? job.file_data.tags.join(', ') : 'None'}</li>
          </ul>
        </div>

        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/fans" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Your Fans
          </a>
        </p>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This import was completed on ${new Date(job.completed_at!).toLocaleString()}.
        </p>
      </div>
    `;

    textBody = `
Import Completed Successfully!

Hi ${artistName},

Your fan import from ${job.file_data.filename} has been completed.

Import Summary:
✅ Successfully imported: ${result.imported} fans
${result.failed > 0 ? `❌ Failed: ${result.failed} fans\n` : ''}${result.skipped > 0 ? `⏭️ Skipped (duplicates): ${result.skipped} fans\n` : ''}📁 File: ${job.file_data.filename}
🏷️ Tags: ${job.file_data.tags.length > 0 ? job.file_data.tags.join(', ') : 'None'}

View your fans: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/fans

This import was completed on ${new Date(job.completed_at!).toLocaleString()}.
    `;
  } else {
    htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Import Failed</h2>
        <p>Hi ${artistName},</p>
        <p>Unfortunately, your fan import from <strong>${job.file_data.filename}</strong> has failed.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">Error Details</h3>
          <p style="margin: 0;">${job.error_message || 'An unknown error occurred during the import process.'}</p>
        </div>

        <p>Please check your CSV file format and try again. If you continue to experience issues, please contact support.</p>

        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/fans/import" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Try Import Again
          </a>
        </p>
      </div>
    `;

    textBody = `
Import Failed

Hi ${artistName},

Unfortunately, your fan import from ${job.file_data.filename} has failed.

Error Details:
${job.error_message || 'An unknown error occurred during the import process.'}

Please check your CSV file format and try again. If you continue to experience issues, please contact support.

Try import again: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/fans/import
    `;
  }

  const command = new SendEmailCommand({
    Source: process.env.FROM_EMAIL || 'noreply@loopletter.com',
    Destination: {
      ToAddresses: [artistEmail],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
        Text: {
          Data: textBody,
          Charset: 'UTF-8',
        },
      },
    },
  });

  try {
    await sesClient.send(command);
    console.log(`Import notification email sent to ${artistEmail}`);
  } catch (error) {
    console.error('Failed to send import notification email:', error);
    // Don't throw - we don't want email failures to break the import process
  }
}

export async function createImportNotification(
  artistId: string,
  job: ImportJob
): Promise<void> {
  const isSuccess = job.status === 'completed';
  const result = job.result;

  if (isSuccess && result) {
    await createNotification(
      artistId,
      'import_completed',
      'Fan import completed',
      `Successfully imported ${result.imported} fans from ${job.file_data.filename}${result.failed > 0 ? ` (${result.failed} failed)` : ''}${result.skipped > 0 ? ` (${result.skipped} skipped)` : ''}`,
      {
        job_id: job.id,
        filename: job.file_data.filename,
        imported: result.imported,
        failed: result.failed,
        skipped: result.skipped,
        total_records: job.total_records
      },
      7 // Expire after 7 days
    );
  } else {
    await createNotification(
      artistId,
      'import_failed',
      'Fan import failed',
      `Import of ${job.file_data.filename} failed: ${job.error_message || 'Unknown error'}`,
      {
        job_id: job.id,
        filename: job.file_data.filename,
        error_message: job.error_message
      },
      7 // Expire after 7 days
    );
  }
}
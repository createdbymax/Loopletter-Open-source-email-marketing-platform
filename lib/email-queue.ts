import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { ses, SES_CONFIG } from './ses-config';
import { supabase } from './supabase';
import { logEmailSent } from './db';

interface QueuedEmail {
  id: string;
  campaignId: string;
  fanId: string;
  email: string;
  params: SendEmailCommandInput;
  priority: number;
  retries: number;
  status: 'queued' | 'processing' | 'sent' | 'failed';
  createdAt: string;
  processedAt?: string;
  error?: string;
}

// In-memory queue for development
// In production, use a proper queue system like Redis or SQS
const emailQueue: QueuedEmail[] = [];
let isProcessing = false;

// Add an email to the queue
export async function queueEmail(
  campaignId: string,
  fanId: string,
  email: string,
  params: SendEmailCommandInput,
  priority = 0
): Promise<string> {
  const id = `${campaignId}_${fanId}_${Date.now()}`;
  
  const queuedEmail: QueuedEmail = {
    id,
    campaignId,
    fanId,
    email,
    params,
    priority,
    retries: 0,
    status: 'queued',
    createdAt: new Date().toISOString()
  };
  
  // In a real implementation, store this in a database or Redis
  emailQueue.push(queuedEmail);
  
  // Sort the queue by priority (higher priority first)
  emailQueue.sort((a, b) => b.priority - a.priority);
  
  // Start processing the queue if it's not already running
  if (!isProcessing) {
    processQueue();
  }
  
  return id;
}

// Process the email queue
async function processQueue() {
  if (isProcessing || emailQueue.length === 0) {
    return;
  }
  
  isProcessing = true;
  
  try {
    // Process emails in batches to respect rate limits
    const batch = emailQueue.splice(0, SES_CONFIG.batchSize);
    
    // Process each email in the batch
    const results = await Promise.allSettled(
      batch.map(async (queuedEmail) => {
        try {
          queuedEmail.status = 'processing';
          
          // Send the email
          const command = new SendEmailCommand(queuedEmail.params);
          const result = await ses.send(command);
          
          // Update the status
          queuedEmail.status = 'sent';
          queuedEmail.processedAt = new Date().toISOString();
          
          // Log the sent email
          await logEmailSent({
            fan_id: queuedEmail.fanId,
            campaign_id: queuedEmail.campaignId,
            email_address: queuedEmail.email,
            status: 'sent',
            sent_at: new Date().toISOString(),
            message_id: result.MessageId
          });
          
          return { success: true, id: queuedEmail.id, messageId: result.MessageId };
        } catch (error: any) {
          console.error(`Error sending email to ${queuedEmail.email}:`, error);
          
          // Handle retries
          if (queuedEmail.retries < SES_CONFIG.retry.maxRetries) {
            queuedEmail.retries++;
            queuedEmail.status = 'queued';
            
            // Add back to the queue with exponential backoff
            setTimeout(() => {
              emailQueue.push(queuedEmail);
            }, SES_CONFIG.retry.initialDelay * Math.pow(SES_CONFIG.retry.backoffFactor, queuedEmail.retries));
          } else {
            // Max retries reached, mark as failed
            queuedEmail.status = 'failed';
            queuedEmail.processedAt = new Date().toISOString();
            queuedEmail.error = error.message;
            
            // Log the failed email
            await logEmailSent({
              fan_id: queuedEmail.fanId,
              campaign_id: queuedEmail.campaignId,
              email_address: queuedEmail.email,
              status: 'bounced',
              sent_at: new Date().toISOString(),
              error_message: error.message
            });
          }
          
          return { success: false, id: queuedEmail.id, error: error.message };
        }
      })
    );
    
    // Wait before processing the next batch to respect rate limits
    if (emailQueue.length > 0) {
      setTimeout(() => {
        isProcessing = false;
        processQueue();
      }, 1000 / SES_CONFIG.rateLimit * batch.length);
    } else {
      isProcessing = false;
    }
    
    return results;
  } catch (error) {
    console.error('Error processing email queue:', error);
    isProcessing = false;
    
    // Retry processing after a delay
    setTimeout(() => {
      processQueue();
    }, 5000);
  }
}

// Get the current queue status
export function getQueueStatus() {
  return {
    queueLength: emailQueue.length,
    isProcessing,
    queuedEmails: emailQueue.filter(e => e.status === 'queued').length,
    processingEmails: emailQueue.filter(e => e.status === 'processing').length,
    sentEmails: emailQueue.filter(e => e.status === 'sent').length,
    failedEmails: emailQueue.filter(e => e.status === 'failed').length
  };
}
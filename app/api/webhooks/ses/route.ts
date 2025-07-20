import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface SESNotification {
  notificationType: 'Bounce' | 'Complaint' | 'Delivery';
  mail: {
    messageId: string;
    destination: string[];
    headers: Array<{
      name: string;
      value: string;
    }>;
  };
  bounce?: {
    bounceType: 'Permanent' | 'Transient' | 'Undetermined';
    bounceSubType: string;
    bouncedRecipients: Array<{
      emailAddress: string;
      status?: string;
      action?: string;
      diagnosticCode?: string;
    }>;
    timestamp: string;
    feedbackId: string;
  };
  complaint?: {
    complainedRecipients: Array<{
      emailAddress: string;
    }>;
    timestamp: string;
    feedbackId: string;
    complaintSubType?: string;
  };
  delivery?: {
    timestamp: string;
    processingTimeMillis: number;
    recipients: string[];
    smtpResponse: string;
    reportingMTA: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse the SNS message
    const body = await request.json();
    
    // SNS sends a subscription confirmation first
    if (body.Type === 'SubscriptionConfirmation') {
      console.log('Received SNS subscription confirmation:', body.SubscribeURL);
      // In production, you would automatically confirm the subscription
      // by making a GET request to the SubscribeURL
      return NextResponse.json({ message: 'Subscription confirmation received' });
    }
    
    // Parse the SES notification from the SNS message
    const sesNotification: SESNotification = JSON.parse(body.Message);
    
    // Extract campaign ID and fan ID from message headers
    const campaignId = sesNotification.mail.headers.find(h => h.name === 'X-Campaign-ID')?.value;
    const fanId = sesNotification.mail.headers.find(h => h.name === 'X-Fan-ID')?.value;
    const messageId = sesNotification.mail.messageId;
    
    // Handle bounce notifications
    if (sesNotification.notificationType === 'Bounce') {
      await handleBounce(sesNotification, campaignId, fanId, messageId);
    }
    
    // Handle complaint notifications
    if (sesNotification.notificationType === 'Complaint') {
      await handleComplaint(sesNotification, campaignId, fanId, messageId);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing SES notification:', error);
    return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
  }
}

async function handleBounce(
  notification: SESNotification, 
  campaignId?: string, 
  fanId?: string,
  messageId?: string
) {
  if (!notification.bounce) return;
  
  const isPermanent = notification.bounce.bounceType === 'Permanent';
  
  // Process each bounced recipient
  for (const recipient of notification.bounce.bouncedRecipients) {
    const email = recipient.emailAddress;
    
    console.log(`Processing bounce for ${email}, type: ${notification.bounce.bounceType}`);
    
    // Update email_sent record if we have the message ID
    if (messageId) {
      await supabase
        .from('email_sent')
        .update({
          status: 'bounced',
          bounced_at: new Date().toISOString(),
          error_message: recipient.diagnosticCode || notification.bounce.bounceType
        })
        .eq('message_id', messageId);
    }
    
    // If it's a permanent bounce, update the fan status
    if (isPermanent) {
      // Try to find the fan by email
      const { data: fans } = await supabase
        .from('fans')
        .select('id')
        .eq('email', email)
        .limit(1);
      
      if (fans && fans.length > 0) {
        const fanIdToUpdate = fanId || fans[0].id;
        
        // Update fan status to bounced
        await supabase
          .from('fans')
          .update({
            status: 'bounced',
            updated_at: new Date().toISOString()
          })
          .eq('id', fanIdToUpdate);
        
        // Log the bounce event
        await supabase
          .from('email_events')
          .insert({
            event_type: 'bounce',
            email: email,
            fan_id: fanIdToUpdate,
            campaign_id: campaignId,
            message_id: messageId,
            timestamp: notification.bounce.timestamp,
            details: {
              bounceType: notification.bounce.bounceType,
              bounceSubType: notification.bounce.bounceSubType,
              diagnosticCode: recipient.diagnosticCode
            }
          });
      }
    }
  }
}

async function handleComplaint(
  notification: SESNotification, 
  campaignId?: string, 
  fanId?: string,
  messageId?: string
) {
  if (!notification.complaint) return;
  
  // Process each complained recipient
  for (const recipient of notification.complaint.complainedRecipients) {
    const email = recipient.emailAddress;
    
    console.log(`Processing complaint for ${email}`);
    
    // Update email_sent record if we have the message ID
    if (messageId) {
      await supabase
        .from('email_sent')
        .update({
          status: 'complained',
          complained_at: new Date().toISOString()
        })
        .eq('message_id', messageId);
    }
    
    // Try to find the fan by email
    const { data: fans } = await supabase
      .from('fans')
      .select('id')
      .eq('email', email)
      .limit(1);
    
    if (fans && fans.length > 0) {
      const fanIdToUpdate = fanId || fans[0].id;
      
      // Update fan status to unsubscribed
      await supabase
        .from('fans')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', fanIdToUpdate);
      
      // Log the complaint event
      await supabase
        .from('email_events')
        .insert({
          event_type: 'complaint',
          email: email,
          fan_id: fanIdToUpdate,
          campaign_id: campaignId,
          message_id: messageId,
          timestamp: notification.complaint.timestamp,
          details: {
            complaintSubType: notification.complaint.complaintSubType
          }
        });
    }
  }
}
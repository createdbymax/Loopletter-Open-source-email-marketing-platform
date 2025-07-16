import { NextRequest, NextResponse } from 'next/server';
import { updateEmailStatus } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle SES webhook notifications
    if (body.Type === 'SubscriptionConfirmation') {
      // Auto-confirm SNS subscription
      const response = await fetch(body.SubscribeURL);
      console.log('SNS subscription confirmed');
      return NextResponse.json({ status: 'confirmed' });
    }

    if (body.Type === 'Notification') {
      const message = JSON.parse(body.Message);
      
      switch (message.eventType) {
        case 'bounce':
          await handleBounce(message);
          break;
        case 'complaint':
          await handleComplaint(message);
          break;
        case 'delivery':
          await handleDelivery(message);
          break;
        case 'send':
          // Email was sent successfully
          break;
        default:
          console.log('Unknown SES event type:', message.eventType);
      }
    }

    return NextResponse.json({ status: 'processed' });
  } catch (error) {
    console.error('Error processing SES webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleBounce(message: any) {
  const bounce = message.bounce;
  
  for (const recipient of bounce.bouncedRecipients) {
    // Find the email record by message ID and recipient
    // Update status to bounced
    console.log(`Email bounced: ${recipient.emailAddress}, reason: ${recipient.diagnosticCode}`);
    
    // In a real implementation, you'd find the email record and update it
    // await updateEmailStatus(emailId, 'bounced', new Date().toISOString());
  }
}

async function handleComplaint(message: any) {
  const complaint = message.complaint;
  
  for (const recipient of complaint.complainedRecipients) {
    console.log(`Complaint received: ${recipient.emailAddress}`);
    
    // Update email status and potentially unsubscribe the user
    // await updateEmailStatus(emailId, 'complained', new Date().toISOString());
  }
}

async function handleDelivery(message: any) {
  const delivery = message.delivery;
  
  for (const recipient of delivery.recipients) {
    console.log(`Email delivered: ${recipient}`);
    
    // Update email status to delivered
    // await updateEmailStatus(emailId, 'delivered', new Date().toISOString());
  }
}
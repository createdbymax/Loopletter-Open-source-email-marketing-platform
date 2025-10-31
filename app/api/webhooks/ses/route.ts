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
        const body = await request.json();
        if (body.Type === 'SubscriptionConfirmation') {
            console.log('Received SNS subscription confirmation:', body.SubscribeURL);
            return NextResponse.json({ message: 'Subscription confirmation received' });
        }
        const sesNotification: SESNotification = JSON.parse(body.Message);
        const campaignId = sesNotification.mail.headers.find(h => h.name === 'X-Campaign-ID')?.value;
        const fanId = sesNotification.mail.headers.find(h => h.name === 'X-Fan-ID')?.value;
        const messageId = sesNotification.mail.messageId;
        if (sesNotification.notificationType === 'Bounce') {
            await handleBounce(sesNotification, campaignId, fanId, messageId);
        }
        if (sesNotification.notificationType === 'Complaint') {
            await handleComplaint(sesNotification, campaignId, fanId, messageId);
        }
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error processing SES notification:', error);
        return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
    }
}
async function handleBounce(notification: SESNotification, campaignId?: string, fanId?: string, messageId?: string) {
    if (!notification.bounce)
        return;
    const isPermanent = notification.bounce.bounceType === 'Permanent';
    for (const recipient of notification.bounce.bouncedRecipients) {
        const email = recipient.emailAddress;
        console.log(`Processing bounce for ${email}, type: ${notification.bounce.bounceType}`);
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
        if (isPermanent) {
            const { data: fans } = await supabase
                .from('fans')
                .select('id')
                .eq('email', email)
                .limit(1);
            if (fans && fans.length > 0) {
                const fanIdToUpdate = fanId || fans[0].id;
                await supabase
                    .from('fans')
                    .update({
                    status: 'bounced',
                    updated_at: new Date().toISOString()
                })
                    .eq('id', fanIdToUpdate);
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
async function handleComplaint(notification: SESNotification, campaignId?: string, fanId?: string, messageId?: string) {
    if (!notification.complaint)
        return;
    for (const recipient of notification.complaint.complainedRecipients) {
        const email = recipient.emailAddress;
        console.log(`Processing complaint for ${email}`);
        if (messageId) {
            await supabase
                .from('email_sent')
                .update({
                status: 'complained',
                complained_at: new Date().toISOString()
            })
                .eq('message_id', messageId);
        }
        const { data: fans } = await supabase
            .from('fans')
            .select('id')
            .eq('email', email)
            .limit(1);
        if (fans && fans.length > 0) {
            const fanIdToUpdate = fanId || fans[0].id;
            await supabase
                .from('fans')
                .update({
                status: 'unsubscribed',
                unsubscribed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
                .eq('id', fanIdToUpdate);
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

import { NextRequest, NextResponse } from 'next/server';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';
import { checkDataProcessingCompliance } from '@/lib/privacy-middleware';

// This endpoint serves a 1x1 transparent pixel and tracks email opens
export async function GET(request: NextRequest) {
  try {
    // Get tracking parameters from query string
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('mid');
    const campaignId = searchParams.get('cid');
    const fanId = searchParams.get('fid');
    
    if (messageId && campaignId && fanId) {
      // Check privacy compliance before tracking
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('artist_id')
        .eq('id', campaignId)
        .single();
      
      if (campaign) {
        const hasConsent = await checkDataProcessingCompliance(
          campaign.artist_id,
          fanId,
          'analytics'
        );
        
        if (hasConsent) {
          // Record the open event asynchronously (don't await)
          recordOpenEvent(messageId, campaignId, fanId, request).catch(error => {
            console.error('Error recording open event:', error);
          });
        } else {
          // Log the blocked tracking attempt
          await supabase
            .from('compliance_audit_logs')
            .insert({
              artist_id: campaign.artist_id,
              fan_id: fanId,
              action: 'tracking_blocked',
              details: {
                reason: 'no_analytics_consent',
                tracking_type: 'email_open',
                message_id: messageId,
                campaign_id: campaignId
              },
              timestamp: new Date().toISOString(),
              ip_address: request.headers.get('x-forwarded-for') || 'unknown',
              user_agent: request.headers.get('user-agent') || 'unknown'
            });
        }
      }
    }
    
    // Return a 1x1 transparent pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error in tracking pixel:', error);
    
    // Still return the pixel even if there's an error
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

async function recordOpenEvent(messageId: string, campaignId: string, fanId: string, request: NextRequest) {
  try {
    const supabaseAdmin = await getSupabaseAdmin();
    
    // Get client information
    const userAgent = request.headers.get('user-agent') || '';
    
    
    // Find the email_sent record (try both messageId and campaign/fan combo)
    const { data: emailSentRecord } = await supabaseAdmin
      .from('emails_sent')
      .select('id, opened_at')
      .or(`message_id.eq.${messageId},and(campaign_id.eq.${campaignId},fan_id.eq.${fanId})`)
      .limit(1)
      .single();
    
    if (emailSentRecord) {
      // Only update if this is the first open (for unique open tracking)
      if (!emailSentRecord.opened_at) {
        await supabaseAdmin
          .from('emails_sent')
          .update({
            opened_at: new Date().toISOString(),
            status: 'opened'
          })
          .eq('id', emailSentRecord.id);
        
        // Update campaign stats for unique opens
        const { data: campaign } = await supabaseAdmin
          .from('campaigns')
          .select('stats')
          .eq('id', campaignId)
          .single();
        
        if (campaign) {
          const currentStats = campaign.stats || {};
          const newUniqueOpens = (currentStats.unique_opens || 0) + 1;
          const totalSent = currentStats.total_sent || 1;
          
          await supabaseAdmin
            .from('campaigns')
            .update({
              stats: {
                ...currentStats,
                opens: (currentStats.opens || 0) + 1,
                unique_opens: newUniqueOpens,
                open_rate: (newUniqueOpens / totalSent) * 100
              }
            })
            .eq('id', campaignId);
        }
      } else {
        // This is a repeat open, just increment the total opens count
        const { data: campaign } = await supabaseAdmin
          .from('campaigns')
          .select('stats')
          .eq('id', campaignId)
          .single();
        
        if (campaign) {
          const currentStats = campaign.stats || {};
          await supabaseAdmin
            .from('campaigns')
            .update({
              stats: {
                ...currentStats,
                opens: (currentStats.opens || 0) + 1
              }
            })
            .eq('id', campaignId);
        }
      }
    }
  } catch (error) {
    console.error('Error recording open event:', error);
    throw error;
  }
}
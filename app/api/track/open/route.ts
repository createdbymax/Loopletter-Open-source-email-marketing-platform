import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// This endpoint serves a 1x1 transparent pixel and tracks email opens
export async function GET(request: NextRequest) {
  try {
    // Get tracking parameters from query string
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('mid');
    const campaignId = searchParams.get('cid');
    const fanId = searchParams.get('fid');
    
    if (messageId && campaignId && fanId) {
      // Record the open event asynchronously (don't await)
      recordOpenEvent(messageId, campaignId, fanId, request).catch(error => {
        console.error('Error recording open event:', error);
      });
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
    // Get client information
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    
    // Check if this open has already been recorded
    const { data: existingOpen } = await supabase
      .from('email_opens')
      .select('id')
      .eq('message_id', messageId)
      .eq('fan_id', fanId)
      .limit(1);
    
    if (existingOpen && existingOpen.length > 0) {
      // Get current open_count and increment it
      const { data: currentRecord } = await supabase
        .from('email_opens')
        .select('open_count')
        .eq('id', existingOpen[0].id)
        .single();
      
      const currentCount = currentRecord?.open_count || 0;
      
      // Update the existing open record with a new timestamp and incremented count
      await supabase
        .from('email_opens')
        .update({
          opened_at: new Date().toISOString(),
          user_agent: userAgent,
          ip_address: ip,
          open_count: currentCount + 1
        })
        .eq('id', existingOpen[0].id);
    } else {
      // Create a new open record
      await supabase
        .from('email_opens')
        .insert({
          message_id: messageId,
          campaign_id: campaignId,
          fan_id: fanId,
          opened_at: new Date().toISOString(),
          user_agent: userAgent,
          ip_address: ip,
          open_count: 1
        });
      
      // Update the email_sent record
      await supabase
        .from('email_sent')
        .update({
          opened_at: new Date().toISOString(),
          status: 'opened'
        })
        .eq('message_id', messageId)
        .eq('fan_id', fanId);
      
      // Update campaign stats
      await supabase.rpc('increment_campaign_opens', {
        p_campaign_id: campaignId
      });
    }
  } catch (error) {
    console.error('Error recording open event:', error);
    throw error;
  }
}
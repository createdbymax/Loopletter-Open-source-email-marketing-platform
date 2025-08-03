import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// This endpoint tracks link clicks and redirects to the target URL
export async function GET(request: NextRequest) {
  try {
    // Get tracking parameters from query string
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('mid');
    const campaignId = searchParams.get('cid');
    const fanId = searchParams.get('fid');
    const url = searchParams.get('url');
    const linkId = searchParams.get('lid');
    
    if (!url) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Decode the URL if it's encoded
    const targetUrl = decodeURIComponent(url);
    
    if (messageId && campaignId && fanId) {
      // Record the click event asynchronously (don't await)
      recordClickEvent(messageId, campaignId, fanId, targetUrl, linkId, request).catch(error => {
        console.error('Error recording click event:', error);
      });
    }
    
    // Redirect to the target URL
    return NextResponse.redirect(new URL(targetUrl));
  } catch (error) {
    console.error('Error in click tracking:', error);
    
    // Redirect to homepage if there's an error
    return NextResponse.redirect(new URL('/', request.url));
  }
}

async function recordClickEvent(
  messageId: string, 
  campaignId: string, 
  fanId: string, 
  url: string,
  linkId: string | null,
  request: NextRequest
) {
  try {
    // Get client information
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    
    // Create a click record
    await supabase
      .from('email_clicks')
      .insert({
        message_id: messageId,
        campaign_id: campaignId,
        fan_id: fanId,
        link_id: linkId,
        url: url,
        clicked_at: new Date().toISOString(),
        user_agent: userAgent,
        ip_address: ip
      });
    
    // Update the email_sent record if this is the first click (try both messageId and campaign/fan combo)
    const { data: emailSent } = await supabase
      .from('email_sent')
      .select('clicked_at, id')
      .or(`message_id.eq.${messageId},and(campaign_id.eq.${campaignId},fan_id.eq.${fanId})`)
      .limit(1)
      .single();
    
    if (!emailSent?.clicked_at && emailSent?.id) {
      await supabase
        .from('email_sent')
        .update({
          clicked_at: new Date().toISOString(),
          status: 'clicked'
        })
        .eq('id', emailSent.id);
      
      // Update campaign stats for unique clicks
      await supabase.rpc('increment_campaign_clicks', {
        p_campaign_id: campaignId
      });
    }
    
    // Always increment total clicks
    await supabase.rpc('increment_campaign_total_clicks', {
      p_campaign_id: campaignId
    });
  } catch (error) {
    console.error('Error recording click event:', error);
    throw error;
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';

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
    const supabaseAdmin = await getSupabaseAdmin();
    
    // Get client information
    const userAgent = request.headers.get('user-agent') || '';
    
    
    // Find the email_sent record (try both messageId and campaign/fan combo)
    const { data: emailSent } = await supabaseAdmin
      .from('emails_sent')
      .select('clicked_at, id')
      .or(`message_id.eq.${messageId},and(campaign_id.eq.${campaignId},fan_id.eq.${fanId})`)
      .limit(1)
      .single();
    
    if (emailSent?.id) {
      // Update the email_sent record if this is the first click
      if (!emailSent.clicked_at) {
        await supabaseAdmin
          .from('emails_sent')
          .update({
            clicked_at: new Date().toISOString(),
            status: 'clicked'
          })
          .eq('id', emailSent.id);
        
        // Update campaign stats for unique clicks
        const { data: campaign } = await supabaseAdmin
          .from('campaigns')
          .select('stats')
          .eq('id', campaignId)
          .single();
        
        if (campaign) {
          const currentStats = campaign.stats || {};
          const newUniqueClicks = (currentStats.unique_clicks || 0) + 1;
          const totalSent = currentStats.total_sent || 1;
          
          await supabaseAdmin
            .from('campaigns')
            .update({
              stats: {
                ...currentStats,
                clicks: (currentStats.clicks || 0) + 1,
                unique_clicks: newUniqueClicks,
                click_rate: (newUniqueClicks / totalSent) * 100
              }
            })
            .eq('id', campaignId);
        }
      } else {
        // This is a repeat click, just increment the total clicks count
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
                clicks: (currentStats.clicks || 0) + 1
              }
            })
            .eq('id', campaignId);
        }
      }
    }
  } catch (error) {
    console.error('Error recording click event:', error);
    throw error;
  }
}
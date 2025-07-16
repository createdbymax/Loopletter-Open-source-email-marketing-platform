import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fan_id = searchParams.get('fan_id');
  const campaign_id = searchParams.get('campaign_id');
  const url = searchParams.get('url');
  
  if (fan_id && campaign_id) {
    try {
      // Check if campaign has tracking enabled
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('settings')
        .eq('id', campaign_id)
        .single();
      
      if (campaign?.settings?.track_clicks) {
        // Check if this is the first click (for unique clicks tracking)
        const { data: existingClick } = await supabase
          .from('emails_sent')
          .select('clicked_at')
          .eq('fan_id', fan_id)
          .eq('campaign_id', campaign_id)
          .single();
        
        const isFirstClick = !existingClick?.clicked_at;
        
        // Update the email record with click timestamp
        await supabase
          .from('emails_sent')
          .update({ 
            clicked_at: new Date().toISOString()
          })
          .eq('fan_id', fan_id)
          .eq('campaign_id', campaign_id);
        
        // Update campaign stats
        if (isFirstClick) {
          await supabase.rpc('increment_campaign_stat', {
            campaign_id: campaign_id,
            stat_name: 'unique_clicks'
          });
        }
        
        await supabase.rpc('increment_campaign_stat', {
          campaign_id: campaign_id,
          stat_name: 'clicks'
        });
      }
    } catch (error) {
      console.error('Error tracking email click:', error);
    }
  }
  
  if (url) {
    return NextResponse.redirect(decodeURIComponent(url));
  }
  return NextResponse.json({ status: 'ok' });
} 
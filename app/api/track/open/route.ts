import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const transparentGif = Buffer.from(
  'R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
  'base64'
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fan_id = searchParams.get('fan_id');
  const campaign_id = searchParams.get('campaign_id');
  
  if (fan_id && campaign_id) {
    try {
      // Check if campaign has tracking enabled
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('settings')
        .eq('id', campaign_id)
        .single();
      
      if (campaign?.settings?.track_opens) {
        // Check if this is the first open (for unique opens tracking)
        const { data: existingOpen } = await supabase
          .from('emails_sent')
          .select('opened_at')
          .eq('fan_id', fan_id)
          .eq('campaign_id', campaign_id)
          .single();
        
        const isFirstOpen = !existingOpen?.opened_at;
        
        // Update the email record with open timestamp
        await supabase
          .from('emails_sent')
          .update({ 
            opened_at: new Date().toISOString()
          })
          .eq('fan_id', fan_id)
          .eq('campaign_id', campaign_id);
        
        // Update campaign stats
        if (isFirstOpen) {
          await supabase.rpc('increment_campaign_stat', {
            campaign_id: campaign_id,
            stat_name: 'unique_opens'
          });
        }
        
        await supabase.rpc('increment_campaign_stat', {
          campaign_id: campaign_id,
          stat_name: 'opens'
        });
      }
    } catch (error) {
      console.error('Error tracking email open:', error);
    }
  }
  
  return new NextResponse(transparentGif, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': transparentGif.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
} 
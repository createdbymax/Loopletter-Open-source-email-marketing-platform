import { NextRequest, NextResponse } from 'next/server';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { supabase } from '@/lib/supabase';

const AWS_REGION = process.env.AWS_REGION!;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;

const ses = new SESClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req: NextRequest) {
  const { campaignId } = await req.json();
  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
  }

  // Fetch campaign, artist, fans
  const { data: campaign, error: campaignError } = await supabase.from('campaigns').select('*').eq('id', campaignId).single();
  if (campaignError || !campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  const { data: artist, error: artistError } = await supabase.from('artists').select('*').eq('id', campaign.artist_id).single();
  if (artistError || !artist) return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
  const { data: fans, error: fansError } = await supabase.from('fans').select('*').eq('artist_id', artist.id);
  if (fansError) return NextResponse.json({ error: 'Error fetching fans' }, { status: 500 });

  let sent = 0;
  for (const fan of fans) {
    try {
      const openPixel = `<img src="${process.env.NEXT_PUBLIC_BASE_URL}/api/track/open?fan_id=${fan.id}&campaign_id=${campaign.id}" width="1" height="1" style="display:none" />`;
      const trackedLink = campaign.link
        ? `<a href=\"${process.env.NEXT_PUBLIC_BASE_URL}/api/track/click?fan_id=${fan.id}&campaign_id=${campaign.id}&url=${encodeURIComponent(campaign.link)}\">More info</a>`
        : '';
      const emailBody = `<h2>${campaign.title}</h2><p>${campaign.message}</p>${campaign.artwork_url ? `<img src='${campaign.artwork_url}' alt='Artwork' />` : ''}${trackedLink ? `<p>${trackedLink}</p>` : ''}${openPixel}`;
      const emailParams = {
        Destination: { ToAddresses: [fan.email] },
        Message: {
          Body: {
            Html: {
              Data: emailBody,
            },
          },
          Subject: { Data: campaign.title },
        },
        Source: `artist@${artist.ses_domain || 'loopletter.com'}`,
      };
      await ses.send(new SendEmailCommand(emailParams));
      await supabase.from('emails_sent').insert({
        fan_id: fan.id,
        campaign_id: campaign.id,
        open_status: false,
        click_status: false,
        sent_at: new Date().toISOString(),
      });
      sent++;
    } catch {
      // Log/send error, but continue
      continue;
    }
  }

  return NextResponse.json({ sent, total: fans.length });
} 
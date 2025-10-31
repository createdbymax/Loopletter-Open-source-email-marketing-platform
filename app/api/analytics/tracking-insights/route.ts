import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuth } from '@clerk/nextjs/server';
export async function GET(req: NextRequest) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || '30d';
        const { data: artist } = await supabase
            .from('artists')
            .select('id')
            .eq('clerk_user_id', userId)
            .single();
        if (!artist) {
            return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
        }
        const now = new Date();
        const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90;
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        const { data: campaigns, error } = await supabase
            .from('campaigns')
            .select(`
        id,
        title,
        settings,
        stats,
        created_at,
        emails_sent (
          id,
          opened_at,
          clicked_at,
          sent_at
        )
      `)
            .eq('artist_id', artist.id)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching campaigns:', error);
            return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
        }
        const insights = campaigns.map(campaign => {
            const emails = campaign.emails_sent || [];
            const totalSent = emails.length;
            const opens = emails.filter(e => e.opened_at).length;
            const clicks = emails.filter(e => e.clicked_at).length;
            const uniqueOpens = new Set(emails.filter(e => e.opened_at).map(e => e.id)).size;
            const uniqueClicks = new Set(emails.filter(e => e.clicked_at).map(e => e.id)).size;
            return {
                campaign_id: campaign.id,
                campaign_title: campaign.title,
                total_sent: totalSent,
                opens,
                unique_opens: uniqueOpens,
                clicks,
                unique_clicks: uniqueClicks,
                open_rate: totalSent > 0 ? (opens / totalSent) * 100 : 0,
                click_rate: totalSent > 0 ? (clicks / totalSent) * 100 : 0,
                tracking_enabled: {
                    opens: campaign.settings?.track_opens || false,
                    clicks: campaign.settings?.track_clicks || false,
                },
                created_at: campaign.created_at,
            };
        });
        return NextResponse.json(insights);
    }
    catch (error) {
        console.error('Error in tracking insights API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

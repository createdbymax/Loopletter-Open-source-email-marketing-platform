import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { getOrCreateArtistByClerkId } from '@/lib/db';

interface Campaign {
  id: string;
  title: string;
  subject: string;
  status: string;
  send_date: string;
  stats?: {
    total_sent?: number;
    opens?: number;
    clicks?: number;
    open_rate?: number;
    click_rate?: number;
  };
}

interface TimeSeriesDataPoint {
  label: string;
  sent: number;
  opens: number;
  clicks: number;
  date: string;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the artist associated with the current user
    const artist = await getOrCreateArtistByClerkId(userId, '', '');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // day, week, month, year, all

    const now = new Date();

    // Get campaigns data
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, subject, status, send_date, stats')
      .eq('artist_id', artist.id)
      .eq('status', 'sent')
      .order('send_date', { ascending: false });

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }

    // Get fans data
    const { data: fans, error: fansError } = await supabase
      .from('fans')
      .select('id, created_at, status')
      .eq('artist_id', artist.id);

    if (fansError) {
      console.error('Error fetching fans:', fansError);
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }

    // Note: Email opens and clicks data is already included in campaign stats
    // so we don't need to fetch them separately for this overview

    // Calculate overview metrics
    const totalCampaigns = campaigns.length;
    const totalSent = campaigns.reduce((sum, campaign) => sum + (campaign.stats?.total_sent || 0), 0);
    const totalOpens = campaigns.reduce((sum, campaign) => sum + (campaign.stats?.opens || 0), 0);
    const totalClicks = campaigns.reduce((sum, campaign) => sum + (campaign.stats?.clicks || 0), 0);
    const totalSubscribers = fans.filter(fan => fan.status === 'subscribed').length;
    const totalUnsubscribes = fans.filter(fan => fan.status === 'unsubscribed').length;

    // Calculate average rates
    const avgOpenRate = totalCampaigns > 0
      ? campaigns.reduce((sum, campaign) => sum + (campaign.stats?.open_rate || 0), 0) / totalCampaigns
      : 0;

    const avgClickRate = totalCampaigns > 0
      ? campaigns.reduce((sum, campaign) => sum + (campaign.stats?.click_rate || 0), 0) / totalCampaigns
      : 0;

    // Calculate growth metrics
    const newSubscribers = fans.filter(fan => {
      const createdAt = new Date(fan.created_at);
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return createdAt >= monthAgo;
    }).length;

    // Prepare campaign performance data
    const campaignPerformance = campaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      subject: campaign.subject,
      sendDate: campaign.send_date,
      totalSent: campaign.stats?.total_sent || 0,
      opens: campaign.stats?.opens || 0,
      clicks: campaign.stats?.clicks || 0,
      openRate: campaign.stats?.open_rate || 0,
      clickRate: campaign.stats?.click_rate || 0
    }));

    // Prepare time series data for charts
    const timeSeriesData = generateTimeSeriesData(campaigns, period);

    return NextResponse.json({
      overview: {
        totalCampaigns,
        totalSent,
        totalOpens,
        totalClicks,
        totalSubscribers,
        totalUnsubscribes,
        avgOpenRate,
        avgClickRate,
        newSubscribers
      },
      campaignPerformance,
      timeSeriesData
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate time series data for charts
function generateTimeSeriesData(campaigns: Campaign[], period: string): TimeSeriesDataPoint[] {
  const now = new Date();
  const data: TimeSeriesDataPoint[] = [];

  // Determine the number of data points and interval based on period
  let dataPoints = 30;
  let intervalUnit = 'day';

  switch (period) {
    case 'day':
      dataPoints = 24;
      intervalUnit = 'hour';
      break;
    case 'week':
      dataPoints = 7;
      intervalUnit = 'day';
      break;
    case 'month':
      dataPoints = 30;
      intervalUnit = 'day';
      break;
    case 'year':
      dataPoints = 12;
      intervalUnit = 'month';
      break;
    case 'all':
      dataPoints = 12; // Default to 12 months for 'all'
      intervalUnit = 'month';
      break;
  }

  // Generate the time series data
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(now);

    // Adjust date based on interval
    if (intervalUnit === 'hour') {
      date.setHours(date.getHours() - (dataPoints - i - 1));
    } else if (intervalUnit === 'day') {
      date.setDate(date.getDate() - (dataPoints - i - 1));
    } else if (intervalUnit === 'month') {
      date.setMonth(date.getMonth() - (dataPoints - i - 1));
    }

    // Format date label
    let label = '';
    if (intervalUnit === 'hour') {
      label = date.getHours() + ':00';
    } else if (intervalUnit === 'day') {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (intervalUnit === 'month') {
      label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    // Filter campaigns for this time period
    const periodCampaigns = campaigns.filter(campaign => {
      const campaignDate = new Date(campaign.send_date);

      if (intervalUnit === 'hour') {
        return campaignDate.getDate() === date.getDate() &&
          campaignDate.getMonth() === date.getMonth() &&
          campaignDate.getFullYear() === date.getFullYear() &&
          campaignDate.getHours() === date.getHours();
      } else if (intervalUnit === 'day') {
        return campaignDate.getDate() === date.getDate() &&
          campaignDate.getMonth() === date.getMonth() &&
          campaignDate.getFullYear() === date.getFullYear();
      } else if (intervalUnit === 'month') {
        return campaignDate.getMonth() === date.getMonth() &&
          campaignDate.getFullYear() === date.getFullYear();
      }

      return false;
    });

    // Calculate metrics for this period
    const sent = periodCampaigns.reduce((sum, campaign) => sum + (campaign.stats?.total_sent || 0), 0);
    const opens = periodCampaigns.reduce((sum, campaign) => sum + (campaign.stats?.opens || 0), 0);
    const clicks = periodCampaigns.reduce((sum, campaign) => sum + (campaign.stats?.clicks || 0), 0);

    data.push({
      label,
      sent,
      opens,
      clicks,
      date: date.toISOString()
    });
  }

  return data;
}